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

  // Shop-aligned Bottom Sheet / Modal
  const popoverCard = (
    <AnimatePresence>
      {expanded && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-left text-slate-800 dark:text-white"
          >
            {/* Sticky Header (Shop style) */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight">
                      {t("beta.title") || "Platforma Test Rejimida"}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {t("beta.badge") || "PROMAX BETA v2.0"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Yopish"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t("beta.desc") ||
                  "Platformamiz sinov va takomillashtirish bosqichida. Biz har kuni yangi imkoniyatlar va qulayliklar qo'shib bormoqdamiz."}
              </p>

              {/* 2 Feature Cards (Shop slate-50 inner box style) */}
              <div className="space-y-2.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={15} />
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

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={15} />
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

              {/* Action Buttons (Shop button style) */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://t.me/xurshidbahromov"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  <span>{t("beta.action") || "Xabar Berish"}</span>
                  <ArrowUpRight size={14} className="shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  {t("beta.understand") || "Tushunarli"}
                </button>
              </div>
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
          className="h-7 sm:h-8 px-2.5 sm:px-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center gap-1.5 text-xs font-bold font-fredoka transition-colors active:scale-95 cursor-pointer shrink-0 shadow-none"
          title="Tizim test rejimida ishlamoqda"
        >
          <Sparkles size={13} className="text-amber-500 shrink-0" />
          <span className="sm:hidden text-slate-800 dark:text-slate-100">Beta</span>
          <span className="hidden sm:inline text-slate-800 dark:text-slate-100">{t("beta.pill") || "Test Rejimi"}</span>
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
