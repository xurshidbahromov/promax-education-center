"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BetaNotification = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem("beta_notification_dismissed");
        if (!dismissed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after dashboard reveal
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("beta_notification_dismissed", "true");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[60] md:max-w-sm w-auto"
                >
                    <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-2xl shadow-xl shadow-amber-500/5">

                        {/* Glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-50 -z-10"></div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                                    <AlertTriangle size={20} />
                                </div>
                            </div>

                            <div className="flex-1 pt-1">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                    {t('beta.title')}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                    {t('beta.message')}
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <a
                                        href="https://t.me/xurshidbahromov"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-brand-blue hover:text-brand-blue/80 flex items-center gap-1.5 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                                    >
                                        <MessageSquare size={14} />
                                        {t('beta.action')}
                                    </a>
                                    <button
                                        onClick={handleDismiss}
                                        className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    >
                                        {t('common.dismiss') || "Yopish"}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BetaNotification;
