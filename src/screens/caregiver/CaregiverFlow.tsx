import React, { useState, useEffect } from 'react';
import { Medicine } from '../../types/medicine';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../api/api';
import CaregiverDashboard from './CaregiverDashboard';
import CaregiverMedicines from './CaregiverMedicines';
import CaregiverAddMedicine from './CaregiverAddMedicine';
import CaregiverAlerts from './CaregiverAlerts';
import CaregiverProfile from './CaregiverProfile';
import CaregiverSettings from './CaregiverSettings';
import CaregiverChatbot from './CaregiverChatbot';

interface Props {
  onLogout: () => void;
}

const CaregiverFlow: React.FC<Props> = ({ onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'medicines' | 'addMedicine' | 'alerts' | 'profile' | 'settings' | 'chatbot'
  >('dashboard');
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);

  useEffect(() => {
    const unsub = api.subscribe((e: any) => {
      if (e.data.type === 'NEW_ALERT') {
        setGlobalAlert("NEW EMERGENCY ALERT TRIGGERED!");
        setTimeout(() => setGlobalAlert(null), 8000);
      }
    });
    return () => unsub();
  }, []);

  const navigateTo = (screen: typeof currentScreen) => setCurrentScreen(screen);

  return (
    <>
      <AnimatePresence>
        {globalAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[100] bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-4 border-red-400"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl animate-pulse">🚨</span>
              <span className="font-bold text-lg">{globalAlert}</span>
            </div>
            <button 
              onClick={() => { setGlobalAlert(null); navigateTo('alerts'); }}
              className="bg-white text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-100"
            >
              View
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
      {currentScreen === 'dashboard' && (
        <CaregiverDashboard key="dashboard" onNavigate={navigateTo} onLogout={onLogout} />
      )}
      {currentScreen === 'medicines' && (
        <CaregiverMedicines 
          key="medicines" 
          onBack={() => navigateTo('dashboard')} 
          onAdd={() => { setEditingMed(null); navigateTo('addMedicine'); }} 
          onEdit={(med) => { setEditingMed(med); navigateTo('addMedicine'); }}
        />
      )}
      {currentScreen === 'addMedicine' && (
        <CaregiverAddMedicine 
          key="addMedicine" 
          initialData={editingMed}
          onBack={() => navigateTo('medicines')} 
        />
      )}
      {currentScreen === 'alerts' && (
        <CaregiverAlerts key="alerts" onBack={() => navigateTo('dashboard')} />
      )}
      {currentScreen === 'profile' && (
        <CaregiverProfile key="profile" onBack={() => navigateTo('dashboard')} />
      )}
      {currentScreen === 'settings' && (
        <CaregiverSettings key="settings" onBack={() => navigateTo('dashboard')} />
      )}
      {currentScreen === 'chatbot' && (
        <CaregiverChatbot key="chatbot" onBack={() => navigateTo('dashboard')} />
      )}
    </AnimatePresence>
    </>
  );
};

export default CaregiverFlow;
