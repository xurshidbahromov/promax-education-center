"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { 
  MessageSquare, 
  Sparkles, 
  X, 
  Zap, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function SidebarBetaWidget({ variant = "card" }: { variant?: "card" | "pill" }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  // Clean, Glassy, Centered Popover Modal with Smooth Backdrop
  const popoverCard = (
    <AnimatePresence>
      {expanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-slate-800 shadow-2xl space-y-5 text-left text-slate-800 dark:text-white"
          >
            {/* Top Row: Badge & Close Button */}
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>{t('beta.badge') || "PROMAX BETA v2.0"}</span>
              </span>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                {t('beta.title') || "Platforma Test Rejimida"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {t('beta.desc') || "Platformamiz sinov va takomillashtirish bosqichida. Biz har kuni yangi imkoniyatlar va qulayliklar qo'shib bormoqdamiz."}
              </p>
            </div>

            {/* 2 Glassy Feature Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('beta.feature1_title') || "Doimiy Yangilanishlar"}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t('beta.feature1_desc') || "Barcha sahifalar va tizim imkoniyatlari real-vaqt rejimida yangilanib bormoqda."}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
                <MessageSquare size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t('beta.feature2_title') || "Fikr va Takliflar"}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t('beta.feature2_desc') || "Kamchilik yoki takliflaringiz bo'lsa, to'g'ridan-to'g'ri dasturchilarga xabar bering."}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
              >
                {t('beta.understand') || "Tushunarli"}
              </button>

              <a
                href="https://t.me/xurshidbahromov"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExpanded(false)}
                className="flex-1 py-3 px-4 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>{t('beta.action') || "Xabar Berish"}</span>
                <ArrowUpRight size={15} className="shrink-0" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="h-8 px-3.5 bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/20 rounded-full flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold font-fredoka transition-all active:scale-95 cursor-pointer shrink-0 shadow-none backdrop-blur-md"
          title="Tizim test rejimida ishlamoqda"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span>{t('beta.pill') || "Test Rejimi"}</span>
        </button>

        {mounted && createPortal(popoverCard, document.body)}
      </>
    );
  }

  return (
    <>
      <div className="mx-4 mb-4 p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>BETA</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">v2.0</span>
        </div>

        <h4 className="text-xs font-black font-fredoka text-slate-900 dark:text-white">
          {t('beta.title') || "Test Rejimi"}
        </h4>

        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {t('beta.sidebar_message') || "Tizim test rejimida ishlamoqda. Xatolik topsangiz xabar bering."}
        </p>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-bold text-brand-blue hover:text-blue-600 active:scale-95 flex items-center gap-1 transition-all pt-0.5"
        >
          <span>{t('beta.action') || "Batafsil / Xabar berish"}</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
