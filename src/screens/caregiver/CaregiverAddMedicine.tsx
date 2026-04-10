import React, { useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import BigButton from '../../components/BigButton';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Medicine } from '../../types/medicine';

interface Props {
  onBack: () => void;
  initialData?: Medicine | null;
}

const CaregiverAddMedicine: React.FC<Props> = ({ onBack, initialData }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(initialData?.name || '');
  const [slot, setSlot] = useState<'morning' | 'afternoon' | 'night'>(initialData?.time_slot || 'morning');
  const [image, setImage] = useState(initialData?.image || '');
  const [instruction, setInstruction] = useState(initialData?.instruction || '');
  const [animType, setAnimType] = useState<'tablet' | 'capsule' | 'syrup'>(initialData?.animation_type || 'tablet');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return setErrorText("Please enter medicine name");
    if (!instruction.trim()) return setErrorText("Please enter instructions for the elder");
    setErrorText('');
    
    setLoading(true);
    if (initialData) {
      await api.updateMedicine({
        ...initialData,
        name,
        time_slot: slot,
        image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        instruction,
        animation_type: animType
      });
    } else {
      await api.addMedicine({
        id: Date.now().toString(),
        name,
        time_slot: slot,
        image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        instruction,
        animation_type: animType
      });
    }
    setLoading(false);
    onBack();
  };

  return (
    <ScreenWrapper>
      <Header title={initialData ? 'Edit Medicine' : t('addMedicine')} onBack={onBack} />
      
      <div className="flex flex-col gap-6 mt-8 flex-1 pb-24 overflow-y-auto">
        {errorText && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold border border-red-200">
            {errorText}
          </div>
        )}
        <div>
          <label className="block text-xl font-bold text-gray-700 mb-2">Medicine Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 shadow-sm" 
            placeholder="e.g. Aspirin" 
          />
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-700 mb-2">Elder Instructions (Spoken Aloud)</label>
          <textarea 
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 shadow-sm min-h-[120px]" 
            placeholder="e.g. Please take 1 tablet with a warm glass of water after food." 
          />
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-700 mb-2">Medication Type (Visual Animation)</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setAnimType('tablet')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${animType === 'tablet' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              💊 Tablet
            </button>
            <button 
              onClick={() => setAnimType('capsule')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${animType === 'capsule' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              💊 Capsule
            </button>
            <button 
              onClick={() => setAnimType('syrup')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${animType === 'syrup' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              🥄 Syrup
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-700 mb-2">Time Slot</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setSlot('morning')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${slot === 'morning' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              {t('morning')}
            </button>
            <button 
              onClick={() => setSlot('afternoon')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${slot === 'afternoon' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              {t('afternoon')}
            </button>
            <button 
              onClick={() => setSlot('night')}
              className={`p-4 font-bold rounded-2xl border-2 shadow-sm ${slot === 'night' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              {t('night')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xl font-bold text-gray-700 mb-2">Medicine Image URL (Optional)</label>
          <input 
            type="text" 
            value={image}
            onChange={e => setImage(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 shadow-sm" 
            placeholder="https://images.unsplash.com/..." 
          />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t-2 border-slate-100 bg-slate-50 flex flex-col gap-4">
        <BigButton label={loading ? 'Saving...' : t('save')} onClick={handleSave} color="primary" />
        {initialData && (
          <button 
            type="button"
            disabled={loading}
            onClick={async () => {
              if (confirmDelete) {
                setLoading(true);
                await api.deleteMedicine(initialData.id);
                setLoading(false);
                onBack();
              } else {
                setConfirmDelete(true);
              }
            }}
            className={`w-full font-bold p-4 rounded-3xl text-xl transition-colors ${
              confirmDelete ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'text-red-500 hover:bg-red-50'
            }`}
          >
            {confirmDelete ? "Tap again to confirm delete" : "Delete Medicine"}
          </button>
        )}
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverAddMedicine;
