import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { Check, X } from 'lucide-react';
import { Medicine } from '../../types/medicine';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { speak } from '../../utils/speech';
import { motion } from 'framer-motion';

interface Props {
  medicine: Medicine;
  onConfirm: () => void;
  onBack: () => void;
}

const ElderConfirmation: React.FC<Props> = ({ medicine, onConfirm, onBack }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Let voices load first
    setTimeout(() => {
      speak(t('didYouTakeMedicine'), language);
    }, 500);
  }, [language, t]);

  const handleStatus = async (status: 'taken' | 'missed') => {
    if (loading) return;
    setLoading(true);

    if(status === 'taken') {
      speak(t('greatJob'), language);
    } else {
       speak(t('thatIsOkay'), language);
    }

    await api.postMedicineStatus({ name: medicine.name, status });
    
    // Give time to talk
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 1500);
  };

  return (
    <ScreenWrapper>
      <Header title="" onBack={onBack} />
      
      <div 
        className="flex-1 flex flex-col items-center justify-center gap-12 py-8 cursor-pointer"
        onClick={() => speak(t('didYouTakeMedicine'), language)}
      >
        <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden border-8 border-white">
           {medicine.image ? (
            <img 
              src={medicine.image} 
              alt={medicine.name} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : (
            <span className="text-9xl">💊</span>
          )}
        </div>
        
        <h2 className="text-5xl font-extrabold text-gray-800 text-center leading-tight">
          {t('didYouTakeMedicine')}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-auto pb-4 h-64">
        <button 
          disabled={loading}
          onClick={() => handleStatus('missed')}
          className="bg-red-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-red-200 active:scale-95 transition-transform border-4 border-red-300 shadow-md shadow-red-200/50"
        >
          <X className="w-24 h-24 text-red-600" strokeWidth={4} />
          <span className="text-4xl font-black text-red-800">NO</span>
        </button>

        <button 
          disabled={loading}
          onClick={() => handleStatus('taken')}
          className="bg-green-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-green-200 active:scale-95 transition-transform border-4 border-green-300 shadow-md shadow-green-200/50"
        >
          <Check className="w-24 h-24 text-green-600" strokeWidth={4} />
          <span className="text-4xl font-black text-green-800">YES</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default ElderConfirmation;
