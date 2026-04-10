import React, { useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { Smile, Frown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { speak } from '../../utils/speech';
import { api } from '../../api/api';

interface Props {
  onBack: () => void;
}

const ElderWellness: React.FC<Props> = ({ onBack }) => {
  const { t, language } = useLanguage();

  const playQuestion = () => {
    speak(t('howAreYouFeeling'), language);
  };

  useEffect(() => {
    setTimeout(() => playQuestion(), 500);
  }, [t, language]);

  const handleStatus = async (feeling: 'good' | 'bad') => {
    if (feeling === 'bad') {
      speak(t('callingCaregiver'), language);
      await api.postAlert('Elder is reporting feeling unwell.');
    } else {
      speak(t('great'), language);
    }
    // Give time for speech
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  return (
    <ScreenWrapper>
       <Header title="" onBack={onBack} />
      
      <div 
        className="flex-1 flex flex-col items-center justify-center py-8 cursor-pointer w-full"
        onClick={playQuestion}
      >
        <h2 className="text-5xl font-extrabold text-gray-800 text-center mb-16 leading-tight">
          {t('howAreYouFeeling')}
        </h2>
        
        <div className="w-full grid grid-cols-1 gap-8 h-full flex-1">
            <button 
                onClick={(e) => { e.stopPropagation(); handleStatus('good'); }}
                className="w-full h-full bg-green-100 rounded-[3rem] border-4 border-green-300 shadow-md shadow-green-200/50 flex items-center justify-center gap-8 active:scale-95 transition-transform hover:bg-green-200 min-h-[160px]"
            >
               <span className="text-8xl">😊</span>
               <span className="text-5xl font-black text-green-800">GOOD</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); handleStatus('bad'); }}
                className="w-full h-full bg-yellow-100 rounded-[3rem] border-4 border-yellow-300 shadow-md shadow-yellow-200/50 flex items-center justify-center gap-8 active:scale-95 transition-transform hover:bg-yellow-200 min-h-[160px]"
            >
                <span className="text-8xl">🤒</span>
                <span className="text-5xl font-black text-yellow-800">BAD</span>
            </button>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default ElderWellness;
