import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import MedicineCard from '../../components/MedicineCard';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Medicine } from '../../types/medicine';
import { speak } from '../../utils/speech';

interface Props {
  onBack: () => void;
}

const ElderMissed: React.FC<Props> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [missed, setMissed] = useState<Medicine[]>([]);

  useEffect(() => {
    speak(t('missedMedicines'), language);
    api.getMissedMedicines().then(data => setMissed(data));
  }, [t, language]);

  return (
    <ScreenWrapper className="bg-orange-50">
      <Header title={t('missedMedicines')} onBack={onBack} />
      
      <div className="flex flex-col gap-4 mt-8 flex-1">
        {missed.length > 0 ? (
          missed.map(med => (
            <MedicineCard 
              key={med.id} 
              medicine={med} 
            />
          ))
        ) : (
          <div className="text-center p-8 bg-green-50 rounded-3xl border-2 border-green-100 mt-12">
            <h2 className="text-3xl font-bold text-green-800">{t('noMissedMedicines')}</h2>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
};

export default ElderMissed;
