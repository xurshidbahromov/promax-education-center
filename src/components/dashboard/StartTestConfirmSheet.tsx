"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, FileText, Play, Trophy, X, AlertCircle } from "lucide-react";

export interface StartTestConfirmItem {
  id: string;
  title: string;
  durationMinutes?: number;
  totalQuestions?: number;
}

interface StartTestConfirmSheetProps {
  item: StartTestConfirmItem | null;
  onClose: () => void;
  onConfirm: (item: StartTestConfirmItem) => void;
  heading?: string;
}

export default function StartTestConfirmSheet({
  item,
  onClose,
  onConfirm,
  heading = "Musobaqani boshlaysizmi?",
}: StartTestConfirmSheetProps) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!portalReady) return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          key="start-test-confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/55 backdrop-blur-[3px]"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl relative flex flex-col max-h-[88vh] overflow-hidden text-left text-slate-800 dark:text-white"
          >
            {/* Header (Shop / Streak sheet style) */}
            <div className="px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight">
                      {heading}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {item.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Yopish"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Info boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={11} />
                    Vaqti
                  </span>
                  <p className="text-xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {item.durationMinutes || 60}{" "}
                    <span className="text-xs font-bold text-amber-500">daqiqa</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={11} />
                    Savollar
                  </span>
                  <p className="text-xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {item.totalQuestions || 30}{" "}
                    <span className="text-xs font-bold text-slate-400">ta</span>
                  </p>
                </div>
              </div>

              {/* Amber warning note */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Boshlaganingizdan so&apos;ng vaqt darhol hisoblanadi va uni to&apos;xtatib bo&apos;lmaydi. Internet aloqangiz barqaror ekaniga ishonch hosil qiling.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onConfirm(item)}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Play size={14} className="fill-white" />
                  <span>Ha, boshlash</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
