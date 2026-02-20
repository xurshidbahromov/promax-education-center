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
                        <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4">

                            {/* Icon / Visual */}
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/Logo_without_sentence.png"
                                        alt="Promax Education Center Logo"
                                        className="w-full h-full object-contain drop-shadow-sm"
                                    />
                                </div>
                                <span className="absolute top-0 right-0 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">
                                    {t('announcement.admission.title')}
                                </h3>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {t('announcement.admission.subtitle')}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <a
                                    href="tel:+998955137776"
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
                                    aria-label="Call Now"
                                >
                                    <Phone size={20} />
                                </a>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
