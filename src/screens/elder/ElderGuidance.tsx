import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { CheckCircle } from 'lucide-react';
import { Medicine } from '../../types/medicine';
import { useLanguage } from '../../context/LanguageContext';
import { speak } from '../../utils/speech';
import { translateText } from '../../utils/translate';
import { motion } from 'framer-motion';

interface Props {
  medicine: Medicine;
  onNext: () => void;
  onBack: () => void;
}

const ElderGuidance: React.FC<Props> = ({ medicine, onNext, onBack }) => {
  const { t, language } = useLanguage();
  const [translatedInstruction, setTranslatedInstruction] = useState<string>('');
  const [translatedMedicineName, setTranslatedMedicineName] = useState<string>(medicine.name);

  // Fallback defaults if caregiver didn't enter anything
  const baseInstruction = medicine.instruction || 'Please take 1 tablet with a glass of water.';

  const processAndSpeak = async () => {
     // 1. Translate the dynamic parts using our Free Google Translation utility
     const translatedName = await translateText(medicine.name, language);
     const translatedInst = await translateText(baseInstruction, language);
     
     // Update UI
     setTranslatedMedicineName(translatedName);
     setTranslatedInstruction(translatedInst);

     // 2. Speak the combined sentence perfectly 
     const textToSpeak = `${t('takeMedicine')} ${translatedName}. ${translatedInst}`;
     await speak(textToSpeak, language);
  };

  useEffect(() => {
    processAndSpeak();
    // eslint-disable-next-line
  }, []);

  const animType = medicine.animation_type || 'tablet';

  return (
    <ScreenWrapper>
      <Header title="" onBack={onBack} />
      
      <div 
        className="flex-1 flex flex-col items-center justify-center gap-8 py-8 cursor-pointer relative"
        onClick={processAndSpeak}
      >
        <p className="text-2xl text-center text-gray-500 font-bold mb-4 bg-blue-50 px-6 py-2 rounded-full border-2 border-blue-200 shadow-sm animate-pulse z-20">
          Tap anywhere to hear instructions again
        </p>
        
        <div className="relative w-[350px] h-[350px] bg-blue-50 rounded-[4rem] flex flex-col items-center justify-end overflow-hidden border-8 border-white shadow-2xl z-10">
          
          {(animType === 'tablet' || animType === 'capsule') && (
            <>
              <motion.div 
                className="absolute bottom-0 w-full bg-blue-300 opacity-50"
                initial={{ height: "20%" }}
                animate={{ height: ["20%", "40%", "20%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-0 w-full bg-blue-400 opacity-60"
                initial={{ height: "25%" }}
                animate={{ height: ["25%", "45%", "25%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </>
          )}

          {animType === 'syrup' && (
              <motion.div 
              className="absolute bottom-10 w-48 h-32 bg-orange-100 rounded-b-3xl border-4 border-orange-300 overflow-hidden"
            >
                <motion.div 
                  className="absolute bottom-0 w-full bg-orange-500 opacity-90"
                  initial={{ height: "0%" }}
                  animate={{ height: ["0%", "80%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
          )}

          <motion.div
            className="absolute top-4 z-20"
            initial={{ y: -60, opacity: 0, rotate: 0 }}
            animate={{ y: [0, 150], opacity: [0, 1, 0], rotate: [0, 180] }}
            transition={{ duration: animType === 'syrup' ? 4 : 2, repeat: Infinity, ease: "easeIn", delay: 1 }}
          >
            {animType === 'tablet' && (
               <div className="w-20 h-20 bg-white border-4 border-slate-300 rounded-full shadow-lg flex items-center justify-center">
                   <div className="w-full border-t-2 border-slate-200"></div>
               </div>
            )}
            
            {animType === 'capsule' && (
              <div className="w-16 h-32 bg-white border-4 border-slate-200 rounded-full overflow-hidden flex flex-col shadow-lg">
                <div className="h-1/2 w-full bg-red-500"></div>
                <div className="h-1/2 w-full bg-white"></div>
              </div>
            )}

            {animType === 'syrup' && (
              <div className="flex flex-col items-center top-[-40px]">
                <div className="w-32 h-10 bg-gray-300 rounded-full border-4 border-gray-400 rotate-12 relative overflow-hidden flex items-center shadow-md">
                    <motion.div 
                        className="w-1/2 h-full bg-orange-600 ml-auto rounded-r-full"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                </div>
                 <motion.div 
                    className="w-4 h-8 bg-orange-600 rounded-full mt-2 ml-16"
                    animate={{ y: [0, 50], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                 />
              </div>
            )}
            
          </motion.div>

          {medicine.image && (
            <img 
              src={medicine.image} 
              alt={medicine.name} 
              className="absolute top-4 left-4 w-24 h-24 object-cover rounded-full border-4 border-white shadow-md z-30" 
            />
          )}
        </div>
        
        {/* Render fully live-translated text! */}
        <div className="mt-4 px-4 h-48 overflow-y-auto w-full max-w-2xl bg-white/50 rounded-3xl p-6 border-2 border-white shadow-sm">
            <h2 className="text-[3rem] font-black text-indigo-900 text-center leading-none mb-4">
               {translatedMedicineName}
            </h2>
            <p className="text-[1.8rem] font-bold text-gray-700 text-center leading-tight">
               {translatedInstruction || "Transating..."}
            </p>
        </div>
      </div>

      <div className="mt-auto px-4 pb-4">
        <button 
          onClick={onNext}
          className="w-full h-32 bg-green-500 rounded-[3rem] flex items-center justify-center gap-6 hover:bg-green-600 active:scale-95 transition-transform shadow-lg border-b-8 border-green-700"
        >
          <CheckCircle className="w-16 h-16 text-white" strokeWidth={3} />
          <span className="text-4xl font-black text-white tracking-wide">Continue</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default ElderGuidance;
