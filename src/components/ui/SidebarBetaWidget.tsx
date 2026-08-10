"use client";

import { MessageSquare, AlertTriangle, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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

  // Centered Floating Card (No full black backdrop overlay, centered horizontally)
  const popoverCard = (
    <AnimatePresence>
      {expanded && (
        <div ref={containerRef}>
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 shadow-2xl z-[99999] text-left space-y-3 overflow-hidden pointer-events-auto"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

            <div className="flex items-start justify-between gap-2 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl shrink-0 border border-amber-500/20">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {t('beta.title') || "Tizim Test Rejimida"}
                  </h4>
                  <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">
                    Promax Platform v2.0
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {t('beta.sidebar_message') || "Platformamiz test rejimida ishlamoqda. Xatoliklar yoki kamchiliklar sezsangiz, bizga Telegram orqali xabar bering!"}
            </p>

            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://t.me/xurshidbahromov"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExpanded(false)}
                className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-blue/20"
              >
                <MessageSquare size={14} />
                <span>{t('beta.action') || "Telegram'da Xabar Berish"}</span>
              </a>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Tushunarli
              </button>
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
          className="h-8 px-3 bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-500/40 rounded-full flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          title="Tizim test rejimida ishlamoqda"
        >
          <Sparkles size={13} className="animate-pulse text-amber-500 shrink-0" />
          <span>Test Rejimi</span>
        </button>

        {mounted && createPortal(popoverCard, document.body)}
      </>
    );
  }

  return (
    <>
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                {t('beta.title') || "Test Rejimi"}
              </h4>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                BETA
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5 leading-relaxed font-medium">
              {t('beta.sidebar_message') || "Tizim test rejimida ishlamoqda. Xatolik topsangiz xabar bering."}
            </p>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-bold text-brand-blue hover:text-blue-600 active:text-brand-blue/80 flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={14} />
              <span>{t('beta.action') || "Xabar berish"}</span>
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
