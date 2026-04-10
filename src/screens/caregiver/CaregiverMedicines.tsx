import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import MedicineCard from '../../components/MedicineCard';
import BigButton from '../../components/BigButton';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Medicine } from '../../types/medicine';

interface Props {
  onBack: () => void;
  onAdd: () => void;
  onEdit: (med: Medicine) => void;
}

const CaregiverMedicines: React.FC<Props> = ({ onBack, onAdd, onEdit }) => {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const fetchMeds = async () => {
    const data = await api.getCurrentMedicines();
    setMedicines(data);
  };

  useEffect(() => {
    fetchMeds();
    const unsub = api.subscribe((e) => {
      if (e.data.type === 'MEDICINES_UPDATED') {
        fetchMeds();
      }
    });
    return unsub;
  }, []);

  return (
    <ScreenWrapper>
      <Header title={t('medicines')} onBack={onBack} />
      
      <div className="flex flex-col gap-4 mt-8 flex-1">
        {medicines.map(med => (
          <MedicineCard key={med.id} medicine={med} onClick={() => onEdit(med)} />
        ))}
      </div>

      <div className="mt-8">
        <BigButton label={t('addMedicine')} icon={<Plus />} onClick={onAdd} color="primary" />
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverMedicines;
