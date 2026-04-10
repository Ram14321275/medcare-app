import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LanguageSelection from './screens/LanguageSelection';
import RoleSelection from './screens/RoleSelection';
import ElderFlow from './screens/elder/ElderFlow';
import CaregiverFlow from './screens/caregiver/CaregiverFlow';

function App() {
  const [langSelected, setLangSelected] = useState(false);
  const [role, setRole] = useState<'elder' | 'caregiver' | null>(null);

  const handleLogout = () => {
    setRole(null);
    setLangSelected(false);
  };

  return (
    <div className="w-full min-h-screen bg-transparent font-sans">
      <AnimatePresence mode="wait">
        {!langSelected && (
          <LanguageSelection 
            key="language" 
            onSelectLanguage={() => setLangSelected(true)} 
          />
        )}
        
        {langSelected && !role && (
          <RoleSelection 
            key="role" 
            onSelectRole={(selectedRole) => setRole(selectedRole)} 
          />
        )}

        {langSelected && role === 'elder' && (
          <ElderFlow key="elderFlow" onLogout={handleLogout} />
        )}

        {langSelected && role === 'caregiver' && (
          <CaregiverFlow key="caregiverFlow" onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
