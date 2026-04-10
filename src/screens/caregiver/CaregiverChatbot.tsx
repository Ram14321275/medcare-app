import React, { useState, useRef, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';
import { Send, Bot, User } from 'lucide-react';
import { api } from '../../api/api';

interface Props {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const GEMINI_API_KEY = "AIzaSyAf5B8yqRufS3C0ryRH6UBkHGn8rKcAoDY";

const CaregiverChatbot: React.FC<Props> = ({ onBack }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Kind, your AI assistant powered by Google Gemini. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const currentMeds = await api.getCurrentMedicines();
      const systemPrompt = `You are Kind, a highly empathetic and knowledgeable eldercare assistant. Keep your responses helpful, clear, and concise. 
      The current medicines scheduled in the app are: ${JSON.stringify(currentMeds)}. 
      
      CRITICAL INSTRUCTION: IF AND ONLY IF the caregiver explicitly asks you to add, edit, or delete a medicine, you MUST respond exactly with a RAW JSON block like this and NOTHING else:
      {"name": "add_medicine", "parameters": {"name": "Aspirin", "time_slot": "morning", "instruction": "Take with water", "animation_type": "tablet"}}
      OR
      {"name": "delete_medicine", "parameters": {"name": "Aspirin"}}
      
      If they do NOT want to modify the schedule, just chat nicely in plain text.`;

      // Map our messages to Gemini's native API format
      const historyContents = messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
      }));
      
      historyContents.push({ role: 'user', parts: [{ text: userMsg }] });

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: historyContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Google API Error: ${errData}`);
      }

      const data = await response.json();
      let assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const executeToolJSON = async (name: string, args: any) => {
        const toolName = name.toLowerCase();
        try {
          if (toolName === 'add_medicine') {
            let fetchedImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
            await api.addMedicine({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              name: args.name || 'Unknown',
              time_slot: args.time_slot || 'morning',
              instruction: args.instruction || `Please take ${args.name || 'this medicine'}.`,
              animation_type: args.animation_type || 'tablet',
              image: fetchedImage
            });
            return `\n\n✅ I have successfully added ${args.name || 'the medicine'} to the ${args.time_slot || 'morning'} schedule!`;
          } else if (toolName === 'delete_medicine') {
            const meds = await api.getCurrentMedicines();
            if(!args.name) return `\n\n❌ I need a medicine name to delete.`;
            const toDelete = meds.find(m => m.name.toLowerCase() === args.name.toLowerCase());
            if (toDelete) {
              await api.deleteMedicine(toDelete.id);
              return `\n\n🗑️ I have deleted ${args.name} from the schedule.`;
            } else {
              return `\n\n❌ I couldn't find a medicine named "${args.name}" to delete.`;
            }
          }
        } catch(e) {
          console.error("Tool execution error", e);
        }
        return '';
      };

      let cleanedResponse = assistantResponse;
      const jsonRegex = /\{[\s\S]*?"name"\s*:\s*"[^"]*"[\s\S]*?"parameters"\s*:\s*\{[\s\S]*\}\s*\}/g;
      const matches = assistantResponse.match(jsonRegex);
      
      if (matches) {
        for (const str of matches) {
          try {
            const obj = JSON.parse(str);
            if (obj.name && obj.parameters) {
               const toolResult = await executeToolJSON(obj.name, obj.parameters);
               cleanedResponse = cleanedResponse.replace(str, toolResult);
            }
          } catch(e) { /* ignore bad json */ }
        }
      }
      assistantResponse = cleanedResponse;

      const finalMsg = assistantResponse.trim() || 'I have checked your schedule.';
      setMessages(prev => [...prev, { role: 'assistant', content: finalMsg }]);
    } catch (error: any) {
       console.error(error);
       setMessages(prev => [...prev, { role: 'assistant', content: `🚨 System Error: ${error.message}` }]);
    } finally {
       setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title={t('chatbot') as string || "AI Assistant"} onBack={onBack} />
      
      <div className="flex flex-col flex-1 mt-6 bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                  {msg.role === 'user' ? <User /> : <Bot />}
                </div>
                <div className={`p-4 rounded-2xl text-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-100 text-gray-800 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                  <Bot />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 text-gray-500 rounded-tl-sm flex gap-2 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-slate-50 border-t-2 border-slate-100">
          <div className="flex gap-4">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-4 text-xl rounded-full border-2 border-slate-200 focus:border-indigo-500 outline-none"
              placeholder="Ask Kind anything..."
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send />
            </button>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverChatbot;
