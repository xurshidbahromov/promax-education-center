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
    Globe,
    Loader2,
    User,
    Camera,
    Save,
    Lock
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getUserProfile, updateUserSettings, updateUserProfile, uploadAvatar, updatePassword } from "@/lib/profile";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Profile State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true
    });

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        loadCreateSettings();
    }, []);

    const loadCreateSettings = async () => {
        setLoading(true);
        try {
            const profile = await getUserProfile();
            if (profile) {
                setUserId(profile.id);
                const s = profile.settings || {};

                setFullName(profile.full_name || "");
                setPhone(profile.phone || "");
                setAvatarUrl(profile.avatar_url || null);

                // Apply saved settings
                if (s.theme) setTheme(s.theme);
                if (s.language && ['UZ', 'RU', 'EN'].includes(s.language)) {
                    setLanguage(s.language as 'UZ' | 'RU' | 'EN');
                }
                if (s.notifications) setNotifications(s.notifications);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: string, value: any) => {
        if (!userId) return;

        // Optimistic update local state first
        if (key === 'theme') {
            // Theme is already updated by useTheme
        } else if (key === 'language') {
            // Language is already updated by useLanguage
        } else if (key === 'notifications') {
            setNotifications(value);
        }

        // Prepare new settings object
        const newSettings = {
            theme: key === 'theme' ? value : theme,
            language: key === 'language' ? value : language,
            notifications: key === 'notifications' ? value : notifications
        };

        // Save to DB (debouncing could be better but direct is fine for now)
        await updateUserSettings(newSettings);
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        saveSetting('theme', newTheme);
    };

    const handleLanguageChange = (newLang: 'UZ' | 'RU' | 'EN') => {
        setLanguage(newLang);
        saveSetting('language', newLang);
    };

    const handleNotificationChange = (type: 'email' | 'push') => {
        const newNotifs = { ...notifications, [type]: !notifications[type] };
        saveSetting('notifications', newNotifs);
    };

    const handleProfileSave = async () => {
        setIsSavingProfile(true);
        const { success } = await updateUserProfile({ full_name: fullName, phone });
        setIsSavingProfile(false);
        if (success) {
            showToast(t('settings.profile.saved') || "Profil saqlandi", "success");
        } else {
            showToast(t('settings.profile.error') || "Xatolik yuz berdi", "error");
        }
    };

    const handlePasswordSave = async () => {
        if (!password || password.length < 6) {
            showToast(t('settings.password.min_length') || "Parol kamida 6ta belgi bo'lishi kerak", "error");
            return;
        }
        setIsSavingPassword(true);
        const { success } = await updatePassword(password);
        setIsSavingPassword(false);
        if (success) {
            setPassword("");
            showToast(t('settings.password.saved') || "Parol yangilandi", "success");
        } else {
            showToast(t('settings.password.error') || "Xatolik yuz berdi", "error");
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        const url = await uploadAvatar(file);
        if (url) {
            const { success } = await updateUserProfile({ avatar_url: url });
            if (success) {
                setAvatarUrl(url);
                showToast(t('settings.avatar.saved') || "Rasm yuklandi", "success");
            } else {
                showToast(t('settings.avatar.error') || "Xatolik yuz berdi", "error");
            }
        } else {
            showToast(t('settings.avatar.error') || "Yuklashda xatolik", "error");
        }
        setIsUploadingAvatar(false);
    };

    if (!mounted) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="text-brand-blue" size={32} />
                {t('settings.title')}
                {loading && <Loader2 className="animate-spin text-brand-blue" size={20} />}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <User size={20} className="text-brand-blue" />
                            {t('settings.profile.title') || "Profil Ma'lumotlari"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('settings.profile.name') || "Ism familiya"}
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                    placeholder="Ism familiyangiz"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('settings.profile.phone') || "Telefon raqam"}
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>

                            <button
                                onClick={handleProfileSave}
                                disabled={isSavingProfile}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 w-fit"
                            >
                                {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {t('common.save') || "Saqlash"}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Lock size={20} className="text-brand-orange" />
                            {t('settings.password.title') || "Parolni Qayta Tiklash"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('settings.password.new') || "Yangi parol"}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                onClick={handlePasswordSave}
                                disabled={isSavingPassword || !password}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 w-fit"
                            >
                                {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                {t('settings.password.update') || "Parolni o'rnatish"}
                            </button>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                {t('settings.avatar.title') || "Profil rasmi"}
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-brand-blue relative">
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                    ) : (
                                        <User size={24} className="text-gray-400" />
                                    )}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 size={16} className="text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        <Camera size={16} />
                                        {t('settings.avatar.upload') || "Rasm yuklash"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Sun size={20} className="text-brand-orange" />
                        {t('settings.appearance.title')}
                    </h2>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('settings.appearance.subtitle')}</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleThemeChange("light")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Sun size={24} className={theme === 'light' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'light' ? "text-brand-blue" : "text-gray-500"}`}>{t('settings.appearance.light')}</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange("dark")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Moon size={24} className={theme === 'dark' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'dark' ? "text-brand-blue" : "text-gray-500"}`}>{t('settings.appearance.dark')}</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange("system")}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                            >
                                <Monitor size={24} className={theme === 'system' ? "text-brand-blue" : "text-gray-400"} />
                                <span className={`text-xs font-semibold ${theme === 'system' ? "text-brand-blue" : "text-gray-500"}`}>{t('settings.appearance.system')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-green-500" />
                        {t('settings.language.title')}
                    </h2>

                    <div className="space-y-4">
                        <div
                            onClick={() => handleLanguageChange('UZ')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'UZ' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇺🇿</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'UZ' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>{t('settings.language.uz')}</p>
                                    <p className="text-xs text-gray-500">{t('settings.language.uz.desc')}</p>
                                </div>
                            </div>
                            {language === 'UZ' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>

                        <div
                            onClick={() => handleLanguageChange('EN')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'EN' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇬🇧</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'EN' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>{t('settings.language.en')}</p>
                                    <p className="text-xs text-gray-500">{t('settings.language.en.desc')}</p>
                                </div>
                            </div>
                            {language === 'EN' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>

                        <div
                            onClick={() => handleLanguageChange('RU')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${language === 'RU' ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇷🇺</span>
                                <div className="text-left">
                                    <p className={`font-semibold ${language === 'RU' ? 'text-brand-blue' : 'text-gray-900 dark:text-white'}`}>{t('settings.language.ru')}</p>
                                    <p className="text-xs text-gray-500">{t('settings.language.ru.desc')}</p>
                                </div>
                            </div>
                            {language === 'RU' && <div className="w-3 h-3 rounded-full bg-brand-blue" />}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Bell size={20} className="text-purple-500" />
                        {t('settings.notifications.title')}
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-purple-600">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t('settings.notifications.email')}</p>
                                    <p className="text-xs text-gray-500">{t('settings.notifications.email.desc')}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.email}
                                    onChange={() => handleNotificationChange('email')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-blue-600">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t('settings.notifications.push')}</p>
                                    <p className="text-xs text-gray-500">{t('settings.notifications.push.desc')}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.push}
                                    onChange={() => handleNotificationChange('push')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/30 dark:peer-focus:ring-brand-blue/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
