import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ElderHome from './ElderHome';
import ElderGuidance from './ElderGuidance';
import ElderConfirmation from './ElderConfirmation';
import ElderWellness from './ElderWellness';
import ElderSOS from './ElderSOS';
import ElderMissed from './ElderMissed';
import { Medicine } from '../../types/medicine';

interface Props {
  onLogout: () => void;
}

const ElderFlow: React.FC<Props> = ({ onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'guidance' | 'confirmation' | 'wellness' | 'sos' | 'missed'
  >('home');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const navigateTo = (screen: typeof currentScreen) => setCurrentScreen(screen);

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'home' && (
        <ElderHome 
          key="home" 
          onNavigate={navigateTo} 
          onMedicineSelect={(med) => {
            setSelectedMedicine(med);
            navigateTo('guidance');
          }}
          onLogout={onLogout}
        />
      )}
      {currentScreen === 'guidance' && selectedMedicine && (
        <ElderGuidance 
          key="guidance" 
          medicine={selectedMedicine} 
          onNext={() => navigateTo('confirmation')} 
          onBack={() => navigateTo('home')} 
        />
      )}
      {currentScreen === 'confirmation' && selectedMedicine && (
        <ElderConfirmation 
          key="confirmation"
          medicine={selectedMedicine}
          onConfirm={() => {
            setSelectedMedicine(null);
            navigateTo('home');
          }}
          onBack={() => navigateTo('guidance')}
        />
      )}
      {currentScreen === 'wellness' && (
        <ElderWellness key="wellness" onBack={() => navigateTo('home')} />
      )}
      {currentScreen === 'sos' && (
        <ElderSOS key="sos" onBack={() => navigateTo('home')} />
      )}
      {currentScreen === 'missed' && (
        <ElderMissed key="missed" onBack={() => navigateTo('home')} />
      )}
    </AnimatePresence>
  );
};

export default ElderFlow;
