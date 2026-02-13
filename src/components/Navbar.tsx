"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, Moon, Sun, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === 'home') return pathname === '/';
        return pathname.startsWith(`/${path}`);
    };
    const [themeOpen, setThemeOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Close dropdowns on click outside
    const themeRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
                setThemeOpen(false);
            }
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ThemeIcon = () => {
        if (!mounted) return <Monitor className="w-4 h-4" />;
        if (theme === 'dark') return <Moon className="w-4 h-4" />;
        if (theme === 'light') return <Sun className="w-4 h-4" />;
        return <Monitor className="w-4 h-4" />;
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -5, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, y: -5, scale: 0.95, transition: { duration: 0.1 } }
    };

    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-b border-gray-100/10 dark:border-slate-800/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-24 h-24">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={256}
                                    height={256}
                                    className="w-full h-full object-contain dark:filter-none invert hue-rotate-180"
                                />
                            </div>
                        </Link>
                    </div>



                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-5 xl:gap-8">
                        {['home', 'courses', 'methodology', 'results', 'about'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'home' ? '/' : `/${item}`}
                                className={cn(
                                    "text-sm font-medium transition-colors relative group",
                                    isActive(item)
                                        ? "text-brand-blue dark:text-blue-400 font-bold"
                                        : "text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-blue-400"
                                )}
                            >
                                {t(`nav.${item}`)}
                                <span className={cn(
                                    "absolute -bottom-1 left-0 h-0.5 bg-brand-blue transition-all duration-300",
                                    isActive(item) ? "w-full" : "w-0 group-hover:w-full"
                                )}></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Area: Theme, Language & Auth */}
                    <div className="hidden lg:flex items-center gap-4">

                        {/* Theme Dropdown */}
                        <div className="relative" ref={themeRef}>
                            <button
                                onClick={() => setThemeOpen(!themeOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                                aria-label="Theme Menu"
                            >
                                <ThemeIcon />
                                <ChevronDown className={cn("w-3 h-3 transition-transform", themeOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {themeOpen && (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                        className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden z-20"
                                    >
                                        {[
                                            { value: 'light', label: 'Light', icon: Sun },
                                            { value: 'dark', label: 'Dark', icon: Moon },
                                            { value: 'system', label: 'System', icon: Monitor }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => { setTheme(option.value); setThemeOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800",
                                                    theme === option.value ? "text-brand-blue" : "text-gray-600 dark:text-gray-400"
                                                )}
                                            >
                                                <option.icon className="w-4 h-4" />
                                                <span>{option.label}</span>
                                                {theme === option.value && <Check className="w-3.5 h-3.5 ml-auto" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Language Dropdown */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                                aria-label="Language Menu"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm font-semibold">{language}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", langOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {langOpen && (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                        className="absolute top-full right-[-4px] mt-2 w-24 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden z-20"
                                    >
                                        {(['UZ', 'EN', 'RU'] as const).map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => { setLanguage(lang); setLangOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-slate-800",
                                                    language === lang ? "text-brand-blue" : "text-gray-600 dark:text-gray-400"
                                                )}
                                            >
                                                <span>{lang}</span>
                                                {language === lang && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-2"></div>

                        <Link
                            href="/login"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                        >
                            {t('nav.login')}
                        </Link>

                        <Link
                            href="/register"
                            className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            {t('hero.cta.primary')}
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-brand-blue"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="lg:hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-t border-gray-100/10 dark:border-slate-800/10 overflow-hidden shadow-xl"
                    >
                        <div className="flex flex-col gap-4 p-4">
                            {['home', 'courses', 'methodology', 'results', 'about'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'home' ? '/' : `/${item}`}
                                    className={cn(
                                        "text-base font-medium py-2 border-b border-gray-50 dark:border-slate-900",
                                        isActive(item)
                                            ? "text-brand-blue dark:text-blue-400 font-bold"
                                            : "text-gray-800 dark:text-gray-200 hover:text-brand-blue"
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t(`nav.${item}`)}
                                </Link>
                            ))}

                            {/* Mobile Theme & Language - Simplified for Mobile */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-50 dark:border-slate-900 pb-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Theme</span>
                                    <div className="flex gap-1">
                                        {(['light', 'dark', 'system'] as const).map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setTheme(mode)}
                                                className={cn(
                                                    "p-2 rounded-md transition-colors",
                                                    theme === mode ? "bg-gray-100 dark:bg-slate-800 text-brand-blue" : "text-gray-500"
                                                )}
                                            >
                                                {mode === 'light' && <Sun size={16} />}
                                                {mode === 'dark' && <Moon size={16} />}
                                                {mode === 'system' && <Monitor size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</span>
                                    <div className="flex gap-1">
                                        {(['UZ', 'EN', 'RU'] as const).map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setLanguage(lang)}
                                                className={cn(
                                                    "px-2 py-1 text-sm font-semibold rounded border",
                                                    language === lang
                                                        ? "bg-brand-blue text-white border-brand-blue"
                                                        : "bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800"
                                                )}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/login"
                                className="bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white text-center py-3 rounded-lg font-semibold"
                            >
                                {t('nav.login')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
