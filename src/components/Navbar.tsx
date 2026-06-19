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
import { createClient } from '@/utils/supabase/client';

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
 const [user, setUser] = useState<any>(null);

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
 
 const supabase = createClient();
 supabase.auth.getUser().then(({ data }) => {
   if (data.user) {
     setUser(data.user);
   }
 });

 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
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
 <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 pointer-events-none">
 <nav className="w-full max-w-7xl flex flex-col gap-4 pointer-events-none relative" aria-label="Main Navigation">
 {/* Desktop and Mobile Islands Row */}
 <div className="w-full flex justify-between items-center pointer-events-none">
 
 {/* Left: Logo Island */}
 <div className="flex justify-start pointer-events-auto">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm rounded-full h-16 px-5 flex items-center transition-all duration-300">
 <Link href="/" className="flex items-center group">
 <div className="w-20 h-10 relative flex items-center">
 <Image
 src="/logo.png"
 alt="Promax Education Center Logo"
 width={256}
 height={256}
 className="w-full h-full object-contain dark:filter-none invert hue-rotate-180 opacity-85 hover:opacity-100 transition-opacity duration-300"
 />
 </div>
 </Link>
 </div>
 </div>

 {/* Center: Nav Links Island */}
 <div className="hidden lg:flex justify-center pointer-events-auto">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm rounded-full h-16 px-8 flex items-center gap-6 xl:gap-8 transition-all duration-300">
 {['home', 'courses', 'methodology', 'results', 'about'].map((item) => (
 <Link
 key={item}
 href={item === 'home' ? '/' : `/${item}`}
 className={cn(
 "text-sm font-semibold transition-colors relative group py-2",
 isActive(item)
 ? "text-brand-blue dark:text-blue-400"
 : "text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-blue-400"
 )}
 >
 {t(`nav.${item}`)}
 <span className={cn(
 "absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full bg-brand-blue transition-all duration-300",
 isActive(item) ? "w-1.5" : "w-0 group-hover:w-1.5"
 )}></span>
 </Link>
 ))}
 </div>
 </div>

 {/* Right: Controls Island / Mobile Toggle Island */}
 <div className="flex justify-end items-center gap-3">
 {/* Desktop Controls Island */}
 <div className="hidden lg:flex pointer-events-auto">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm rounded-full h-16 px-6 flex items-center gap-3 transition-all duration-300">
 {/* Theme Dropdown */}
 <div className="relative" ref={themeRef}>
 <button
 onClick={() => setThemeOpen(!themeOpen)}
 className="flex items-center justify-center w-10 h-10 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
 aria-label="Theme Menu"
 >
 <ThemeIcon />
 </button>

 <AnimatePresence>
 {themeOpen && (
 <motion.div
 initial="hidden"
 animate="visible"
 exit="exit"
 variants={dropdownVariants}
 className="absolute top-full right-0 mt-4 w-36 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden"
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
 "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5",
 theme === option.value ? "text-brand-blue" : "text-gray-700 dark:text-gray-300"
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
 className="flex items-center gap-1.5 px-3 h-10 rounded-full text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors font-semibold text-sm"
 aria-label="Language Menu"
 >
 <Globe className="w-4 h-4" />
 <span>{language}</span>
 </button>

 <AnimatePresence>
 {langOpen && (
 <motion.div
 initial="hidden"
 animate="visible"
 exit="exit"
 variants={dropdownVariants}
 className="absolute top-full right-0 mt-4 w-24 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden"
 >
 {(['UZ', 'EN', 'RU'] as const).map((lang) => (
 <button
 key={lang}
 onClick={() => { setLanguage(lang); setLangOpen(false); }}
 className={cn(
 "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5",
 language === lang ? "text-brand-blue" : "text-gray-700 dark:text-gray-300"
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

 <div className="h-6 w-px bg-gray-300 dark:bg-slate-700 mx-1"></div>

 {user ? (
  <Link
    href="/dashboard"
    className="bg-brand-blue text-white px-6 h-10 flex items-center justify-center rounded-full text-sm font-medium hover:bg-brand-blue/90 transition-colors active:scale-[0.98] ml-1 shadow-sm"
  >
    Dashboard
  </Link>
) : (
  <>
    <Link
      href="/login"
      className="text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-blue dark:hover:text-blue-400 transition-colors px-2"
    >
      {t('nav.login')}
    </Link>

    <Link
      href="/register"
      className="bg-brand-blue text-white px-6 h-10 flex items-center justify-center rounded-full text-sm font-medium hover:bg-brand-blue/90 transition-colors active:scale-[0.98] ml-1 shadow-sm"
    >
      {t('hero.cta.primary')}
    </Link>
  </>
)}
 </div>
 </div>

 {/* Mobile: Hamburger Menu Toggle Island */}
 <div className="lg:hidden flex justify-end pointer-events-auto">
 <button
 className="flex items-center justify-center w-16 h-16 rounded-full text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-sm active:scale-[0.98] transition-transform duration-300"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 aria-label="Toggle Menu"
 >
 {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </div>
 </div>

 </div>

 {/* Mobile Menu Island */}
 <AnimatePresence>
 {mobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="lg:hidden pointer-events-auto w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col p-6 gap-6 mt-2"
 >
 <div className="flex flex-col gap-2">
 {['home', 'courses', 'methodology', 'results', 'about'].map((item) => (
 <Link
 key={item}
 href={item === 'home' ? '/' : `/${item}`}
 className={cn(
 "text-lg font-medium px-4 py-3 rounded-2xl transition-colors",
 isActive(item)
 ? "bg-brand-blue/10 text-brand-blue dark:text-blue-400"
 : "text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
 )}
 onClick={() => setMobileMenuOpen(false)}
 >
 {t(`nav.${item}`)}
 </Link>
 ))}
 </div>

 <div className="h-px bg-gray-200 dark:bg-slate-800 w-full" />

 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-3">
 <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">Theme</span>
 <div className="flex gap-2">
 {(['light', 'dark', 'system'] as const).map((mode) => (
 <button
 key={mode}
 onClick={() => setTheme(mode)}
 className={cn(
 "p-3 rounded-xl transition-all flex-1 flex justify-center",
 theme === mode ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-100" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
 )}
 >
 {mode === 'light' && <Sun size={18} />}
 {mode === 'dark' && <Moon size={18} />}
 {mode === 'system' && <Monitor size={18} />}
 </button>
 ))}
 </div>
 </div>

 <div className="flex flex-col gap-3">
 <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">Lang</span>
 <div className="flex gap-2">
 {(['UZ', 'EN', 'RU'] as const).map((lang) => (
 <button
 key={lang}
 onClick={() => setLanguage(lang)}
 className={cn(
 "p-2 rounded-xl transition-all flex-1 text-sm font-medium flex justify-center items-center",
 language === lang
 ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30"
 : "bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400"
 )}
 >
 {lang}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="flex flex-col gap-3 mt-2">
 <Link
 href="/login"
 className="w-full py-4 text-center rounded-full font-medium text-gray-800 dark:text-gray-200 bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
 onClick={() => setMobileMenuOpen(false)}
 >
 {t('auth.login.title')}
 </Link>
 <Link
 href="/register"
 className="w-full py-4 text-center rounded-full font-medium text-white bg-brand-blue hover:bg-blue-700 shadow-xl shadow-brand-blue/20 transition-all active:scale-95"
 onClick={() => setMobileMenuOpen(false)}
 >
 {t('auth.register.button')}
 </Link>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </nav>
 </div>
 );
};

export default Navbar;
