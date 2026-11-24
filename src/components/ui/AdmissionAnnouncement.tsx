"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const STORAGE_KEY = "promax_admission_dismissed";

const AdmissionAnnouncement = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm"
        >
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-3.5">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 flex items-center justify-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Logo_without_sentence.png"
                  alt="Promax Education Center Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight mb-0.5 font-sans">
                {t("announcement.admission.title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug font-medium line-clamp-2">
                {t("announcement.admission.subtitle")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="tel:+998955137776"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95 transition-all"
                aria-label="Call Now"
              >
                <Phone size={16} />
              </a>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdmissionAnnouncement;
