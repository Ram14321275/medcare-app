import React, { ReactNode } from 'react';

interface BigButtonProps {
  label: string;
  icon?: ReactNode;
  color?: 'primary' | 'danger' | 'success' | 'warning' | 'white';
  onClick: () => void;
  className?: string;
}

const BigButton: React.FC<BigButtonProps> = ({ 
  label, 
  icon, 
  color = 'primary', 
  onClick,
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
    white: 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50 active:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-[80px] sm:h-[100px] rounded-3xl 
        flex items-center justify-center gap-4 
        text-2xl sm:text-3xl font-bold 
        shadow-md transition-all active:scale-95
        px-6 ${colorClasses[color]} ${className}
      `}
    >
      {icon && <span className="flex items-center justify-center [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};

export default BigButton;
