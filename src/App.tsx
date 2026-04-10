import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, api } from './api/api';
import { useLanguage } from './context/LanguageContext';
import LanguageSelection from './screens/LanguageSelection';
import RoleSelection from './screens/RoleSelection';
import ElderFlow from './screens/elder/ElderFlow';
import CaregiverFlow from './screens/caregiver/CaregiverFlow';
import AuthScreen from './screens/AuthScreen';
import { HeartPulse } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLanguageSelected, setIsLanguageSelected } = useLanguage();
  const [role, setRole] = useState<'elder' | 'caregiver' | null>(null);
  
  const roleRef = useRef(role);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Alert Sounds directly from Firebase!
  useEffect(() => {
    const unsub = api.subscribe((e: any) => {
      if (e.data.type === 'NEW_ALERT' || e.data.type === 'STATUS_UPDATED') {
        if (roleRef.current === 'caregiver') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => console.log('Audio autoplay blocked by browser. Please tap screen first.'));
        }
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    setRole(null);
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
        {!isLanguageSelected && (
          <LanguageSelection 
            key="language" 
            onSelectLanguage={() => setIsLanguageSelected(true)} 
          />
        )}
        
        {isLanguageSelected && !role && (
          <RoleSelection 
            key="role" 
            onSelectRole={(selectedRole) => setRole(selectedRole)} 
          />
        )}

        {isLanguageSelected && role === 'elder' && (
          <ElderFlow key="elderFlow" onLogout={handleLogout} />
        )}

        {isLanguageSelected && role === 'caregiver' && (
          <CaregiverFlow key="caregiverFlow" onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
