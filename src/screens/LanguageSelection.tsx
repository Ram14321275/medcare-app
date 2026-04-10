import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { Language } from '../i18n/translations';
import { useLanguage } from '../context/LanguageContext';
import { speak, initAudio } from '../utils/speech';

interface Props {
  onSelectLanguage: (lang: Language) => void;
}

const LanguageSelection: React.FC<Props> = ({ onSelectLanguage }) => {
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = async (lang: Language) => {
    initAudio(); // Unlocks the browser's autoplay policies on the very first tap
    setLanguage(lang);
    
    // Announce the success IN THE CHOSEN LANGUAGE, so they know it immediately works perfectly
    const greetings = {
      en: "Language Selected",
      te: "భాష ఎంచుకోబడింది",
      hi: "भाषा चुनी गई",
      ta: "மொழி தேர்ந்தெடுக்கப்பட்டது"
    };

    await speak(greetings[lang], lang);
    
    setTimeout(() => {
        onSelectLanguage(lang);
    }, 1500);
  };

  return (
    <ScreenWrapper className="justify-center !px-4 max-w-none">
      <div className="glass-panel p-8 mb-12 self-stretch mx-4 mt-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-[2.5rem] sm:text-[3.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 mb-2 leading-tight">
          Choose Language
        </h1>
        <p className="text-gray-500 font-bold text-[1.5rem] sm:text-[2rem] tracking-widest">
          భాష / भाषा / மொழி
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-6 sm:gap-8 h-full flex-1 max-w-5xl mx-auto w-full pb-8 px-4">
        <button 
          onClick={() => handleLanguageSelect('te')}
          className="glass-button flex flex-col items-center justify-center gap-4 rounded-[2rem] p-4 min-h-[220px] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[5rem] sm:text-[7rem] drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">🕉️</span>
          <span className="text-[2rem] sm:text-[3rem] font-black text-orange-900 leading-none z-10">తెలుగు</span>
        </button>

        <button 
          onClick={() => handleLanguageSelect('hi')}
          className="glass-button flex flex-col items-center justify-center gap-4 rounded-[2rem] p-4 min-h-[220px] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[5rem] sm:text-[7rem] drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">🪷</span>
          <span className="text-[2rem] sm:text-[3rem] font-black text-emerald-900 leading-none z-10">हिंदी</span>
        </button>

        <button 
          onClick={() => handleLanguageSelect('ta')}
          className="glass-button flex flex-col items-center justify-center gap-4 rounded-[2rem] p-4 min-h-[220px] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[5rem] sm:text-[7rem] drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">🛕</span>
          <span className="text-[2rem] sm:text-[3rem] font-black text-purple-900 leading-none z-10">தமிழ்</span>
        </button>

        <button 
          onClick={() => handleLanguageSelect('en')}
          className="glass-button flex flex-col items-center justify-center gap-4 rounded-[2rem] p-4 min-h-[220px] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="text-[5rem] sm:text-[7rem] font-black text-blue-500/80 font-serif leading-none mt-4 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">A</div>
          <span className="text-[2rem] sm:text-[3rem] font-black text-blue-900 leading-none mt-2 z-10">English</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default LanguageSelection;
