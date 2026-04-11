import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { Pill, AlertCircle, Settings, User, LogOut, Bot, ChevronRight, Activity } from 'lucide-react';
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
    const alerts = await api.getAlerts();
    setTotalMeds(medicines.length);
    setMissedCount(missed.length + alerts.length);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = api.subscribe((e: any) => {
      if (e.data.type === 'STATUS_UPDATED' || e.data.type === 'MEDICINES_UPDATED') {
        fetchData();
      }
    });
    return unsubscribe;
  }, []);

  const adherence = totalMeds === 0 ? 100 : Math.max(0, Math.round(((totalMeds - missedCount) / totalMeds) * 100));

  return (
    <ScreenWrapper>
      <div className="flex items-center justify-between w-full pb-4">
        <Header title={t('dashboard')} subtitle="Family Workspace" />
        <button onClick={onLogout} className="p-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white hover:bg-white transition-colors">
          <LogOut className="w-6 h-6 text-indigo-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 mt-2 gap-4">
        {/* Adherence Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl shadow-indigo-100/50 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
               <Activity className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-800">{t('adherence')}</h3>
          </div>
          
          <div className="flex items-end gap-3 relative z-10">
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 tracking-tighter leading-none">
              {adherence}%
            </div>
            <span className="text-gray-400 font-semibold mb-2">Overall Score</span>
          </div>
        </div>
        
        {/* Alerts Card */}
        <div 
          onClick={() => onNavigate('alerts')}
          className="bg-red-500 p-8 rounded-3xl shadow-xl shadow-red-200/50 flex flex-col justify-between cursor-pointer relative overflow-hidden group hover:bg-red-600 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 text-white rounded-2xl">
                 <AlertCircle className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-white">Alerts & Missed</h3>
             </div>
             <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
          </div>
          
          <div className="flex items-end gap-3 relative z-10">
            <div className="text-7xl font-black text-white tracking-tighter leading-none">
              {missedCount}
            </div>
            <span className="text-red-100 font-semibold mb-2">Requires Attention</span>
          </div>
        </div>
      </div>

      <h3 className="mt-10 mb-4 text-xl font-black text-gray-800 tracking-tight">Management Tools</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'chatbot', label: t('chatbot'), icon: Bot, color: 'text-teal-600', bg: 'bg-teal-50' },
          { id: 'medicines', label: t('medicines'), icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'profile', label: t('profile'), icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
          { id: 'settings', label: t('settings'), icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((item: any) => (
          <button 
            key={item.id}
            onClick={() => onNavigate(item.id)} 
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-lg shadow-indigo-100/30 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all"
          >
            <div className={`p-4 rounded-2xl ${item.bg} group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            <span className="font-bold text-gray-700 text-md tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

    </ScreenWrapper>
  );
};

export default CaregiverDashboard;
