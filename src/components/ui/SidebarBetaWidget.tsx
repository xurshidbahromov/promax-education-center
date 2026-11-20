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
} from "lucide-react";

export default function SidebarBetaWidget({ variant = "card" }: { variant?: "card" | "pill" }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  // Flat Minimalist Creative Premium Modal (aligned with StreakPill & DailyStreakCard)
  const popoverCard = (
    <AnimatePresence>
      {expanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.12)] space-y-4 text-left text-slate-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                  <Sparkles size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold font-fredoka text-slate-900 dark:text-white leading-none">
                      {t("beta.title") || "Platforma Test Rejimida"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("beta.badge") || "PROMAX BETA v2.0"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Yopish"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {t("beta.desc") ||
                "Platformamiz sinov va takomillashtirish bosqichida. Biz har kuni yangi imkoniyatlar va qulayliklar qo'shib bormoqdamiz."}
            </p>

            {/* 2 Flat Feature Cards */}
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={14} strokeWidth={1.9} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t("beta.feature1_title") || "Doimiy Yangilanishlar"}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t("beta.feature1_desc") ||
                      "Barcha sahifalar va tizim imkoniyatlari real-vaqt rejimida yangilanib bormoqda."}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={14} strokeWidth={1.9} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {t("beta.feature2_title") || "Fikr va Takliflar"}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {t("beta.feature2_desc") ||
                      "Kamchilik yoki takliflaringiz bo'lsa, to'g'ridan-to'g'ri dasturchilarga xabar bering."}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors active:scale-95 whitespace-nowrap cursor-pointer"
              >
                {t("beta.understand") || "Tushunarli"}
              </button>

              <a
                href="https://t.me/xurshidbahromov"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExpanded(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>{t("beta.action") || "Xabar Berish"}</span>
                <ArrowUpRight size={14} className="shrink-0" />
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
          className="h-7 sm:h-8 px-2 sm:px-2.5 bg-slate-900/[0.04] hover:bg-slate-900/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/70 dark:border-slate-700/60 rounded-full flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs font-semibold font-fredoka transition-colors active:scale-95 cursor-pointer shrink-0 shadow-none"
          title="Tizim test rejimida ishlamoqda"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shrink-0" />
          <span className="sm:hidden">Beta</span>
          <span className="hidden sm:inline">{t("beta.pill") || "Test Rejimi"}</span>
        </button>

        {mounted && createPortal(popoverCard, document.body)}
      </>
    );
  }

  return (
    <>
      <div className="mx-4 mb-4 p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>BETA</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">v2.0</span>
        </div>

        <h4 className="text-xs font-bold font-fredoka text-slate-900 dark:text-white">
          {t("beta.title") || "Test Rejimi"}
        </h4>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {t("beta.sidebar_message") || "Tizim test rejimida ishlamoqda. Xatolik topsangiz xabar bering."}
        </p>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-brand-blue active:scale-95 flex items-center gap-1 transition-colors pt-0.5 cursor-pointer"
        >
          <span>{t("beta.action") || "Batafsil / Xabar berish"}</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
