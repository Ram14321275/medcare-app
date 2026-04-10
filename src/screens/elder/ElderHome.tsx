import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import BigButton from '../../components/BigButton';
import MedicineCard from '../../components/MedicineCard';
import { Pill, Activity, AlertCircle, Phone, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Medicine } from '../../types/medicine';
import { getCurrentSlot } from '../../utils/timeSlot';

interface Props {
  onNavigate: (screen: 'guidance' | 'wellness' | 'sos' | 'missed') => void;
  onMedicineSelect: (medicine: Medicine) => void;
  onLogout: () => void;
}

const ElderHome: React.FC<Props> = ({ onNavigate, onMedicineSelect, onLogout }) => {
  const { t, language } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const slot = getCurrentSlot();

  const fetchMeds = async () => {
    const data = await api.getCurrentMedicines();
    const currentSlotMedicines = data.filter(m => m.time_slot === slot);
    setMedicines(currentSlotMedicines);
  };

  useEffect(() => {
    // Need to initialize voices if they aren't loaded yet
    const playGreeting = async () => {
      const { speak } = await import('../../utils/speech');
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speak(`${t('hello')}. ${t('takeMedicine')}.`, language);
        };
      } else {
        speak(`${t('hello')}. ${t('takeMedicine')}.`, language);
      }
    };
    
    playGreeting();

    fetchMeds();

    const unsub = api.subscribe((e) => {
      if (e.data.type === 'MEDICINES_UPDATED' || e.data.type === 'STATUS_UPDATED') {
        fetchMeds();
      }
    });

    return unsub;
  }, [slot, language, t]);

  return (
    <ScreenWrapper>
      <div className="flex items-center justify-between w-full h-[80px] px-1">
        <Header title={t('hello')} />
        <button onClick={onLogout} className="w-16 h-16 glass-button rounded-full flex items-center justify-center">
          <LogOut className="w-8 h-8 text-indigo-900" />
        </button>
      </div>

      <div className="flex flex-col gap-6 mt-6 flex-1">
        {medicines.length > 0 ? (
          medicines.map(med => (
            <MedicineCard 
              key={med.id} 
              medicine={med} 
              onClick={() => onMedicineSelect(med)} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-[3rem] shadow-md h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent"></div>
            <span className="text-8xl mb-4 drop-shadow-md z-10">✅</span>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 text-center z-10">All Done</h2>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 h-48 px-1">
        <button 
          onClick={() => onNavigate('wellness')}
          className="glass-button rounded-[3rem] p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden group shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Activity className="w-20 h-20 text-green-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" strokeWidth={3} />
          <span className="text-3xl font-bold text-green-900 z-10">{t('wellness')}</span>
        </button>

        <button 
          onClick={() => onNavigate('missed')}
          className="glass-button rounded-[3rem] p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden group shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AlertCircle className="w-20 h-20 text-yellow-600 drop-shadow-md z-10 transform group-hover:scale-110 transition-transform" strokeWidth={3} />
          <span className="text-3xl font-bold text-yellow-900 break-words text-center leading-tight z-10">Missed</span>
        </button>
      </div>

      <div className="mt-4 pb-4 px-1">
        <button 
          onClick={() => onNavigate('sos')}
          className="w-full h-32 relative overflow-hidden rounded-[3rem] flex items-center justify-center gap-6 shadow-xl group border border-red-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-700"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <Phone className="w-16 h-16 text-white animate-pulse z-10 drop-shadow-md" strokeWidth={3} />
          <span className="text-5xl font-black text-white tracking-widest z-10 drop-shadow-md">{t('sos')}</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default ElderHome;
