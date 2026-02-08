"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { uz } from '../locales/uz';
import { en } from '../locales/en';
import { ru } from '../locales/ru';

type Language = 'UZ' | 'EN' | 'RU';

type Translations = {
    [key in Language]: Record<string, string>;
};

const translations: Translations = {
    UZ: uz,
    EN: en,
    RU: ru,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('UZ');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('promax-lang') as Language;
        if (saved && ['UZ', 'EN', 'RU'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('promax-lang', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
