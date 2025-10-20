import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (ar: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>({ code: 'en', dir: 'ltr' });

  useEffect(() => {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = language.code;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => 
      prev.code === 'ar' 
        ? { code: 'en', dir: 'ltr' }
        : { code: 'ar', dir: 'rtl' }
    );
  };

  const t = (ar: string, en: string) => {
    return language.code === 'ar' ? ar : en;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
