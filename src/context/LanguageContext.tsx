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
    t: (key: string, params?: Record<string, string | number>) => string;
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

    const handleSetLanguage = React.useCallback((lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('promax-lang', lang);
    }, []);

    const t = React.useCallback((key: string, params?: Record<string, string | number>): string => {
        let text = translations[language][key] || key;
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
            });
        }
        return text;
    }, [language]);

    const value = React.useMemo(() => ({
        language,
        setLanguage: handleSetLanguage,
        t
    }), [language, handleSetLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
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
