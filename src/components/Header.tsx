import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <div className="w-full py-6 flex items-center gap-4">
      {onBack && (
        <button
          onClick={onBack}
          className="glass-button p-4 rounded-full flex items-center justify-center shadow-sm"
        >
          <svg className="w-8 h-8 text-indigo-700 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 drop-shadow-sm leading-tight pb-1">{title}</h1>
        {subtitle && <p className="text-2xl font-bold tracking-wide text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Header;
