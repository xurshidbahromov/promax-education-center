"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const AdmissionAnnouncement = () => {
 const { t } = useLanguage();
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 // Show after a small delay to not overwhelm immediately
 const timer = setTimeout(() => {
 setIsVisible(true);
 }, 1500);

 return () => clearTimeout(timer);
 }, []);

 if (!isVisible) return null;

 return (
 <AnimatePresence>
 {isVisible && (
 <motion.div
 initial={{ y: 100, opacity: 0, scale: 0.9 }}
 animate={{ y: 0, opacity: 1, scale: 1 }}
 exit={{ y: 100, opacity: 0, scale: 0.9 }}
 transition={{ type: "spring", stiffness: 260, damping: 20 }}
 className="fixed bottom-4 right-4 z-50 w-[90vw] md:w-auto md:max-w-sm"
 >
 {/* Floating Animation Wrapper */}
 <motion.div
 animate={{ y: [0, -10, 0] }}
 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
 className="relative"
 >
 {/* Glow Effect - Minimal & Warm */}
 <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/40 to-orange-600/40 rounded-2xl blur-sm opacity-20 animate-pulse"></div>

 {/* Main Card Content */}
 <div className="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-2xl flex items-center gap-4">

 {/* Icon / Visual */}
 <div className="relative flex-shrink-0">
 <div className="w-13 h-13 flex items-center justify-center p-1 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/60 dark:border-slate-700">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src="/Logo_without_sentence.png"
 alt="Promax Education Center Logo"
 className="w-full h-full object-contain"
 />
 </div>
 <span className="absolute -top-1 -right-1 flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
 </span>
 </div>

 {/* Text Content */}
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 font-fredoka">
 {t('announcement.admission.title')}
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
 {t('announcement.admission.subtitle')}
 </p>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2">
 <a
 href="tel:+998955137776"
 className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
 aria-label="Call Now"
 >
 <Phone size={18} />
 </a>
 <button
 onClick={() => setIsVisible(false)}
 className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-black/5 dark:active:bg-white/10 transition-colors"
 aria-label="Close"
 >
 <X size={16} />
 </button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};

export default AdmissionAnnouncement;
