import React, { useState } from 'react';
import { Medicine } from '../../types/medicine';
import { AnimatePresence } from 'framer-motion';
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

  const navigateTo = (screen: typeof currentScreen) => setCurrentScreen(screen);

  return (
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
  );
};

export default CaregiverFlow;
