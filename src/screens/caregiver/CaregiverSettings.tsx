import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBack: () => void;
}

const CaregiverSettings: React.FC<Props> = ({ onBack }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <ScreenWrapper>
      <Header title={t('settings')} onBack={onBack} />
      
      <div className="flex flex-col gap-6 mt-8">
        <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-slate-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">App Language</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setLanguage('en')} className={`p-4 font-bold rounded-2xl border-2 ${language === 'en' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>English</button>
            <button onClick={() => setLanguage('te')} className={`p-4 font-bold rounded-2xl border-2 ${language === 'te' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>తెలుగు</button>
            <button onClick={() => setLanguage('hi')} className={`p-4 font-bold rounded-2xl border-2 ${language === 'hi' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>हिंदी</button>
            <button onClick={() => setLanguage('ta')} className={`p-4 font-bold rounded-2xl border-2 ${language === 'ta' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>தமிழ்</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md border-2 border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Voice Guidance</h3>
            <p className="text-gray-500 mt-1">Enable spoken instructions</p>
          </div>
          <div className="w-14 h-8 bg-indigo-500 rounded-full flex items-center p-1 cursor-pointer">
            <div className="w-6 h-6 bg-white rounded-full translate-x-6 transform transition-transform"></div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverSettings;
