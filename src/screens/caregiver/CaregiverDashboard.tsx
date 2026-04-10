import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { Pill, AlertCircle, Settings, User, LogOut, Bot } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Medicine } from '../../types/medicine';

interface Props {
  onNavigate: (screen: 'medicines' | 'alerts' | 'profile' | 'settings' | 'chatbot') => void;
  onLogout: () => void;
}

const CaregiverDashboard: React.FC<Props> = ({ onNavigate, onLogout }) => {
  const { t } = useLanguage();
  const [missedCount, setMissedCount] = useState(0);
  const [totalMeds, setTotalMeds] = useState(0);

  const fetchData = async () => {
    const medicines = await api.getCurrentMedicines();
    const missed = await api.getMissedMedicines();
    
    setTotalMeds(medicines.length);
    setMissedCount(missed.length);
  };

  useEffect(() => {
    fetchData();

    const unsubscribe = api.subscribe((e) => {
      if (e.data.type === 'STATUS_UPDATED' || e.data.type === 'MEDICINES_UPDATED') {
        fetchData();
      }
    });

    return unsubscribe;
  }, []);

  const adherence = totalMeds === 0 ? 100 : Math.round(((totalMeds - missedCount) / totalMeds) * 100);

  return (
    <ScreenWrapper>
      <div className="flex items-center justify-between w-full">
        <Header title={t('dashboard')} subtitle="Overview" />
        <button onClick={onLogout} className="p-4 bg-gray-200 rounded-full hover:bg-gray-300">
          <LogOut className="w-8 h-8 text-gray-700" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 mt-8 gap-6 px-1">
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-2xl font-bold text-gray-700 z-10">{t('adherence')}</h3>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 z-10">{Math.max(0, adherence)}%</div>
        </div>
        
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden group" onClick={() => onNavigate('alerts')}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-2xl font-bold text-gray-700 z-10">{t('missedMedicines')}</h3>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 z-10">{missedCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mt-8 px-1">
        <button onClick={() => onNavigate('chatbot')} className="glass-button p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 h-36 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Bot className="w-12 h-12 text-teal-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" />
          <span className="font-bold text-teal-900 truncate w-full text-center z-10 text-lg">{t('chatbot')}</span>
        </button>
        <button onClick={() => onNavigate('medicines')} className="glass-button p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 h-36 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Pill className="w-12 h-12 text-blue-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" />
          <span className="font-bold text-blue-900 z-10 text-lg">{t('medicines')}</span>
        </button>
        <button onClick={() => onNavigate('alerts')} className="glass-button p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 h-36 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AlertCircle className="w-12 h-12 text-orange-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" />
          <span className="font-bold text-orange-900 z-10 text-lg">{t('alerts')}</span>
        </button>
        <button onClick={() => onNavigate('profile')} className="glass-button p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 h-36 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <User className="w-12 h-12 text-purple-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" />
          <span className="font-bold text-purple-900 z-10 text-lg">{t('profile')}</span>
        </button>
        <button onClick={() => onNavigate('settings')} className="glass-button p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 h-36 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Settings className="w-12 h-12 text-gray-700 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" />
          <span className="font-bold text-gray-900 z-10 text-lg">{t('settings')}</span>
        </button>
      </div>

      <div className="mt-8 mb-4 px-1">
        <div className="glass-button p-6 rounded-[2rem] cursor-pointer" onClick={() => onNavigate('medicines')}>
          <h3 className="text-xl font-bold text-gray-700 mb-4">{t('medicines')} Schedule Overview</h3>
          <p className="text-gray-500 font-semibold">{totalMeds} total scheduled active medicines</p>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverDashboard;
