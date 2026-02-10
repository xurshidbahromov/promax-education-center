"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import {
    Settings,
    Moon,
    Sun,
    Monitor,
    Languages,
    Bell,
    Smartphone,
    Mail,
    Globe
} from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="text-brand-blue" size={32} />
                Settings
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Sun size={20} className="text-brand-orange" />
                        Appearance
                    </h2>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Theme Preference</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Sun size={24} className={theme === 'light' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'light' ? "text-brand-blue" : "text-gray-500"}`}>Light</span>
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Moon size={24} className={theme === 'dark' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'dark' ? "text-brand-blue" : "text-gray-500"}`}>Dark</span>
                            </button>
                            <button
                                onClick={() => setTheme("system")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Monitor size={24} className={theme === 'system' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'system' ? "text-brand-blue" : "text-gray-500"}`}>System</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-green-500" />
                        Language
                    </h2>

                    <div className="space-y-4">
                        <div
                            onClick={() => setLanguage('uz')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'uz' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇺🇿</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'uz' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>O'zbekcha</p>
                                    <p className="text-xs text-gray-500">Lotin yozuvi</p>
                                </div>
                            </div>
                            {language === 'uz' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>

                        <div
                            onClick={() => setLanguage('en')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'en' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇬🇧</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'en' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>English</p>
                                    <p className="text-xs text-gray-500">United Kingdom</p>
                                </div>
                            </div>
                            {language === 'en' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>

                        <div
                            onClick={() => setLanguage('ru')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'ru' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇷🇺</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'ru' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>Русский</p>
                                    <p className="text-xs text-gray-500">Kirill yozuvi</p>
                                </div>
                            </div>
                            {language === 'ru' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell size={20} className="text-purple-500" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-purple-600">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                                    <p className="text-xs text-gray-500">Exam results, weekly reports</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-blue-600">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Push Notifications</p>
                                    <p className="text-xs text-gray-500">Mock reminders, new assignments</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/30 dark:peer-focus:ring-brand-blue/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
