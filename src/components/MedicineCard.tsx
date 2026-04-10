import React from 'react';
import { Medicine } from '../types/medicine';

interface MedicineCardProps {
  medicine: Medicine;
  onClick?: () => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-[2rem] p-6 
        ${onClick ? 'cursor-pointer hover:bg-white/90 active:scale-95 transition-all shadow-lg hover:shadow-xl' : 'shadow-md'}
        flex flex-row items-center gap-6 group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="w-24 h-24 flex-shrink-0 bg-blue-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-inner z-10">
        {medicine.image ? (
          <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl text-blue-500 drop-shadow-sm">💊</span>
        )}
      </div>
      
      <div className="flex-1 z-10">
        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">{medicine.name}</h3>
        <p className="text-xl font-bold text-gray-500 mt-2 capitalize tracking-wide">{medicine.time_slot}</p>
      </div>
    </div>
  );
};

export default MedicineCard;
