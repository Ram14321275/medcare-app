import React, { useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { speak } from '../utils/speech';

interface Props {
  onSelectRole: (role: 'elder' | 'caregiver') => void;
}

const RoleSelection: React.FC<Props> = ({ onSelectRole }) => {
  const { t, language } = useLanguage();

  useEffect(() => {
     // Give a moment for language engine to initialize properly 
     setTimeout(() => {
        speak(t('roleSelection'), language);
     }, 1000);
  }, [t, language]);

  return (
    <ScreenWrapper className="justify-center !px-4 max-w-none">
      <div className="glass-panel p-8 mb-12 self-stretch mx-4 mt-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-[2.5rem] sm:text-[3.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 leading-tight">
          {t('roleSelection')}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full max-h-[800px] flex-1 w-full max-w-5xl mx-auto pb-8 px-4">
        <button 
          onClick={() => {
            speak(t('elder'), language);
            onSelectRole('elder');
          }}
          className="glass-button flex flex-col items-center justify-center gap-8 rounded-[2rem] p-8 min-h-[300px] relative overflow-hidden group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[7rem] sm:text-[9rem] drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">👴🏼</span>
          <span className="text-[3rem] sm:text-[4rem] font-black text-blue-900 drop-shadow-sm z-10">{t('elder')}</span>
        </button>

        <button 
          onClick={() => {
            speak(t('caregiver'), language);
            onSelectRole('caregiver');
          }}
          className="glass-button flex flex-col items-center justify-center gap-8 rounded-[2rem] p-8 min-h-[300px] relative overflow-hidden group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[7rem] sm:text-[9rem] drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">👩🏽‍⚕️</span>
          <span className="text-[3rem] sm:text-[4rem] font-black text-green-900 drop-shadow-sm z-10">{t('caregiver')}</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default RoleSelection;
