import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageSelected: boolean;
  setIsLanguageSelected: (selected: boolean) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('eldermed_language') as Language) || 'en');
  const [isLanguageSelected, setIsLanguageSelectedState] = useState<boolean>(() => localStorage.getItem('eldermed_lang_selected') === 'true');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eldermed_language', lang);
  };

  const setIsLanguageSelected = (selected: boolean) => {
    setIsLanguageSelectedState(selected);
    if(selected) {
      localStorage.setItem('eldermed_lang_selected', 'true');
    } else {
      localStorage.removeItem('eldermed_lang_selected');
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageSelected, setIsLanguageSelected, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
