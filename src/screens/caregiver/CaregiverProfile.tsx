import React, { useState, useEffect } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { ElderProfile } from '../../types/medicine';
import { Edit3, Check, X } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CaregiverProfile: React.FC<Props> = ({ onBack }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<ElderProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ElderProfile>({
    name: '', age: '', bloodType: '', allergies: '', emergencyContact: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await api.getElderProfile();
      setProfile(data);
      setEditForm(data);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    await api.updateElderProfile(editForm);
    setProfile(editForm);
    setIsEditing(false);
  };

  if (!profile) return <ScreenWrapper><Header title={t('profile')} onBack={onBack} /><div className="p-8 text-center mt-10 font-bold text-gray-500 animate-pulse">Loading Profile...</div></ScreenWrapper>;

  return (
    <ScreenWrapper>
      <Header title={t('profile')} onBack={onBack} />
      
      <div className="flex flex-col items-center gap-6 mt-12 bg-white p-8 rounded-3xl shadow-md border-2 border-slate-100 relative">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={() => { setIsEditing(false); setEditForm(profile); }}
              className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSave}
              className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg shadow-purple-200">
          <span className="text-5xl">👵</span>
        </div>
        
        {!isEditing ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-xl text-gray-500 font-semibold uppercase tracking-widest text-sm">Elder Profile</p>
          </>
        ) : (
          <div className="w-full mt-4">
             <label className="block text-sm font-bold text-gray-500 mb-1">Elder's Full Name</label>
             <input 
               value={editForm.name} 
               onChange={e => setEditForm({...editForm, name: e.target.value})}
               className="w-full p-4 border-2 border-indigo-100 rounded-xl text-xl font-bold text-gray-800 focus:border-indigo-500 outline-none"
             />
          </div>
        )}

        <div className="w-full mt-6 bg-slate-50 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col border-b border-slate-200 pb-2">
            <span className="text-gray-400 font-bold text-xs uppercase">Age</span>
            {!isEditing ? (
               <span className="text-gray-800 font-bold text-lg">{profile.age}</span>
            ) : (
               <input value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="bg-white p-2 rounded-lg border border-gray-200 font-bold outline-none focus:border-indigo-500" />
            )}
          </div>
          
          <div className="flex flex-col border-b border-slate-200 pb-2">
            <span className="text-gray-400 font-bold text-xs uppercase">Blood Type</span>
            {!isEditing ? (
               <span className="text-gray-800 font-bold text-lg">{profile.bloodType}</span>
            ) : (
               <input value={editForm.bloodType} onChange={e => setEditForm({...editForm, bloodType: e.target.value})} className="bg-white p-2 rounded-lg border border-gray-200 font-bold outline-none focus:border-indigo-500" />
            )}
          </div>

          <div className="flex flex-col border-b border-slate-200 pb-2">
            <span className="text-gray-400 font-bold text-xs uppercase">Allergies</span>
            {!isEditing ? (
               <span className="text-gray-800 font-bold text-lg">{profile.allergies}</span>
            ) : (
               <input value={editForm.allergies} onChange={e => setEditForm({...editForm, allergies: e.target.value})} className="bg-white p-2 rounded-lg border border-gray-200 font-bold outline-none focus:border-indigo-500" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-red-400 font-bold text-xs uppercase">Emergency Contact Number</span>
            {!isEditing ? (
               <span className="text-red-600 font-bold text-xl">{profile.emergencyContact}</span>
            ) : (
               <input type="tel" value={editForm.emergencyContact} onChange={e => setEditForm({...editForm, emergencyContact: e.target.value})} className="bg-white p-2 rounded-lg border border-red-200 text-red-600 font-bold outline-none focus:border-red-500" />
            )}
          </div>
        </div>
        
        {isEditing && (
            <button 
              onClick={handleSave}
              className="w-full mt-4 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
            >
              Save Profile Changes
            </button>
        )}
      </div>
    </ScreenWrapper>
  );
};

export default CaregiverProfile;
