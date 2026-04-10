import { Language } from '../i18n/translations';

const shortLangMap: Record<Language, string> = {
  en: 'en',
  te: 'te',
  hi: 'hi',
  ta: 'ta'
};

const langMap: Record<Language, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN'
};

let currentAudio: HTMLAudioElement | null = null;

export const initAudio = () => {
    if (!currentAudio) {
        currentAudio = new Audio();
        // A silent 0.1s wav file base64 to completely bypass autoplay restrictions instantly
        currentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        currentAudio.play().catch(() => {});
    }
};

export const speak = async (text: string, language: Language) => {
  try {
    if (!currentAudio) {
      currentAudio = new Audio();
    } else {
      currentAudio.pause();
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const shortCode = shortLangMap[language] || 'en';
    const url = `/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${shortCode}&client=gtx`;
    
    currentAudio.src = url;
    currentAudio.load();
    await currentAudio.play();

  } catch (err) {
    console.warn("Remote TTS failed/blocked:", err);
    fallbackSpeech(text, language);
  }
};

const fallbackSpeech = (text: string, language: Language) => {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langMap[language] || 'en-IN';
  utterance.rate = 0.85; 
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const langVoices = voices.filter(v => v.lang.startsWith(shortLangMap[language]));
  
  if (langVoices.length > 0) {
    utterance.voice = langVoices[0];
  } else if (language !== 'en') {
      console.warn(`No local Windows voice package found for ${language}. Refusing English accent.`);
      return; 
  }

  window.speechSynthesis.speak(utterance);
};
