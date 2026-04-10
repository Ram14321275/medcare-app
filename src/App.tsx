import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './api/api';
import LanguageSelection from './screens/LanguageSelection';
import RoleSelection from './screens/RoleSelection';
import ElderFlow from './screens/elder/ElderFlow';
import CaregiverFlow from './screens/caregiver/CaregiverFlow';
import AuthScreen from './screens/AuthScreen';
import { HeartPulse } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [langSelected, setLangSelected] = useState(false);
  const [role, setRole] = useState<'elder' | 'caregiver' | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    setRole(null);
    setLangSelected(false);
    await auth.signOut(); // Securely logs out of Firebase
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
         <HeartPulse className="text-indigo-500 w-16 h-16 animate-pulse" />
      </div>
    );
  }

  // App is completely inaccessible without an account
  if (!user) {
    return <AuthScreen />;
  }

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
