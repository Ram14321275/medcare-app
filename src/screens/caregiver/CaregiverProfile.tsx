import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBack: () => void;
}

const CaregiverProfile: React.FC<Props> = ({ onBack }) => {
  const { t } = useLanguage();

  return (
    <ScreenWrapper>
      <Header title={t('profile')} onBack={onBack} />
      
      <div className="flex flex-col items-center gap-6 mt-12 bg-white p-8 rounded-3xl shadow-md border-2 border-slate-100">
        <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-5xl">👵</span>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800">Smt. Lakshmi</h2>
        <p className="text-xl text-gray-500">Elder Profile</p>

        <div className="w-full mt-8 bg-slate-50 p-6 rounded-2xl">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-gray-500 font-bold">Age</span>
            <span className="text-gray-800 font-bold">78</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-gray-500 font-bold">Blood Type</span>
            <span className="text-gray-800 font-bold">O+</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-bold">Allergies</span>
            <span className="text-gray-800 font-bold">Penicillin</span>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverProfile;
