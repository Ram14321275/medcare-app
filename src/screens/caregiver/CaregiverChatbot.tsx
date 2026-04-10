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
    { role: 'assistant', content: 'Hello! I am Kind, your eldercare AI assistant powered by Google Gemini. How can I help you today?' }
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
      const systemPrompt = `You are Kind, a highly empathetic and knowledgeable eldercare assistant. Keep your responses helpful, clear, and concise for a caregiver. 
      The current medicines scheduled in the app are: ${JSON.stringify(currentMeds)}. 
      CRITICAL INSTRUCTION: DO NOT use any tools or output JSON unless the caregiver EXPLICITLY asks you to add, edit, change, update, or delete a specific medicine. If they just say "Hello", "How are you", or ask a general question, just reply normally using text without executing any tool. Never assume or guess a medicine to delete.
      IF ADDING A MEDICINE: You MUST know the requested time slot (morning, afternoon, or night) BEFORE calling the add_medicine tool. If the caregiver did not specify the time slot, DO NOT call the tool. Instead, ask them "What time of day should this medicine be taken?" and wait for their reply.`;

      const isToolIntent = /add|update|edit|change|delete|remove|schedule/i.test(userMsg);
      
      const requestBody: any = {
        model: 'gemini-1.5-flash',
        messages: [
           { role: 'system', content: systemPrompt },
           ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
           { role: 'user', content: userMsg }
        ],
        stream: false
      };

      if (isToolIntent) {
        requestBody.tools = [
          {
            type: "function",
            function: {
              name: "add_medicine",
              description: "Add a new medicine to the elder's schedule.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of the medicine" },
                  time_slot: { type: "string", enum: ["morning", "afternoon", "night"] },
                  instruction: { type: "string", description: "Instructions for taking it" },
                  animation_type: { type: "string", enum: ["tablet", "capsule", "syrup"] }
                },
                required: ["name", "time_slot", "instruction", "animation_type"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "delete_medicine",
              description: "Delete an existing medicine from the schedule by its exact name.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Exact name of the medicine" }
                },
                required: ["name"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "edit_medicine",
              description: "Edit an existing medicine by its exact name. You only need to provide the fields that changing.",
              parameters: {
                type: "object",
                properties: {
                  current_name: { type: "string", description: "Exact current name of the medicine" },
                  new_name: { type: "string", description: "New name of the medicine (optional)" },
                  time_slot: { type: "string", enum: ["morning", "afternoon", "night"], description: "New time slot (optional)" },
                  instruction: { type: "string", description: "New instructions (optional)" },
                  animation_type: { type: "string", enum: ["tablet", "capsule", "syrup"], description: "New animation type (optional)" }
                },
                required: ["current_name"]
              }
            }
          }
        ];
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Gemini');
      }

      const data = await response.json();
      const responseMessage = data.choices?.[0]?.message || {};
      let assistantResponse = responseMessage.content || '';

      const executeTool = async (name: string, args: any) => {
        const toolName = name.toLowerCase();
        try {
          if (toolName === 'add_medicine') {
            let fetchedImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60';
            try {
              const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(args.name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
              const wikiData = await wikiRes.json();
              const pages = wikiData.query?.pages;
              if (pages) {
                const pageId = Object.keys(pages)[0];
                if (pageId !== '-1' && pages[pageId].thumbnail?.source) {
                  fetchedImage = pages[pageId].thumbnail.source;
                }
              }
            } catch(e) { console.log("Wiki fetch failed", e); }

            await api.addMedicine({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              name: args.name || 'Unknown',
              time_slot: args.time_slot || 'morning',
              instruction: args.instruction || `Please take ${args.name || 'this medicine'}.`,
              animation_type: args.animation_type || 'tablet',
              image: fetchedImage
            });
            return `\n\n✅ I have successfully added ${args.name || 'the medicine'} to the ${args.time_slot || 'morning'} schedule and retrieved its image!`;
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
          } else if (toolName === 'edit_medicine') {
            const meds = await api.getCurrentMedicines();
            if(!args.current_name) return `\n\n❌ I need the current medicine name to edit it.`;
            const toEdit = meds.find(m => m.name.toLowerCase() === args.current_name.toLowerCase());
            if (toEdit) {
              await api.updateMedicine({
                ...toEdit,
                name: args.new_name || toEdit.name,
                time_slot: args.time_slot || toEdit.time_slot,
                instruction: args.instruction || toEdit.instruction,
                animation_type: args.animation_type || toEdit.animation_type
              });
              return `\n\n✏️ I have successfully updated ${args.current_name}!`;
            } else {
              return `\n\n❌ I couldn't find a medicine named "${args.current_name}" to edit.`;
            }
          }
        } catch(e) {
          console.error("Tool execution error", e);
        }
        return '';
      };

      // Handle Gemini/OpenAI standard tool calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const call of responseMessage.tool_calls) {
           const parsedArgs = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments;
           const toolResult = await executeTool(call.function.name, parsedArgs);
           assistantResponse += toolResult;
        }
      }

      const finalMsg = assistantResponse.trim() || 'I have checked the schedule as requested.';
      setMessages(prev => [...prev, { role: 'assistant', content: finalMsg }]);
    } catch (error) {
       console.error(error);
       setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble reaching Google's servers. Please try again soon." }]);
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
