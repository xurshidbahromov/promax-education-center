"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Globe,
  Users,
  Award,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { INITIAL_INTERNATIONAL_TOURNAMENTS } from "@/lib/international-tournaments";

export function InternationalBannerTeaser() {
  const { t } = useLanguage();
  const heroItem = INITIAL_INTERNATIONAL_TOURNAMENTS[0];

  return (
    <div className="relative w-full">
      <div className="relative block w-full">
        
        {/* ── TOP ROW: DISTINCT FULLY TRANSPARENT SHELF TAB + SEAMLESS RIGHT GLASS HEADER ── */}
        <div className="flex items-stretch relative z-20">
          
          {/* Top-Left Shelf Tab (100% Fully Transparent, no background fill, no blur) */}
          <Link
            href="/dashboard/international"
            className="w-[37%] sm:w-[32%] bg-transparent backdrop-blur-none px-2.5 sm:px-6 py-2.5 sm:py-3.5 border-none flex items-center shrink-0 z-10 cursor-pointer group/step"
          >
            <h3 className="text-sm sm:text-2xl font-medium font-fredoka text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="truncate">{t("international.shelf_title") || "Jahon sinovi"}</span>
              <motion.span
                animate={{ x: [0, 3, 0], y: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex text-brand-blue dark:text-blue-400 shrink-0"
              >
                <ArrowDownRight size={18} className="stroke-[2.5] sm:w-[22px] sm:h-[22px]" />
              </motion.span>
            </h3>
          </Link>

          {/* Top-Right Header Box (Longer for full participants text) */}
          <div className="flex-1 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white px-2.5 sm:px-6 py-2.5 sm:py-3.5 rounded-t-3xl border-t border-r border-white/60 dark:border-slate-800/60 border-b-0 border-l-0 flex items-center justify-center gap-1.5 z-20 backdrop-blur-xl min-w-0">
            <Users size={14} className="text-brand-blue shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {heroItem?.participantsCount || 650}+ nafar qatnashuvchi
            </span>
          </div>
        </div>

        {/* ── MAIN CARD BODY ── */}
        <div className="relative z-10 w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white p-4.5 sm:p-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 border-b border-l border-r border-t-0 border-white/60 dark:border-slate-800/60 shadow-none">
          
          {/* Smooth Top-Left Corner Curved Border */}
          <div className="absolute top-0 left-0 w-[37%] sm:w-[32%] h-6 rounded-tl-3xl border-t border-l border-white/60 dark:border-slate-800/60 pointer-events-none z-10" />
          
          {/* Left Text Content Area */}
          <div className="relative z-10 space-y-1 min-w-0 flex-1 w-full xs:w-auto">
            <h4 className="text-base sm:text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight truncate tracking-tight">
              Xalqaro musobaqalar
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 truncate">
              <Award size={14} className="text-amber-500 shrink-0" />
              <span>SAT 1600 shkalasi, AMC va xalqaro sertifikatlar</span>
            </p>
          </div>

          {/* Right Recessed Glassy Button */}
          <div className="relative z-10 shrink-0 w-full xs:w-auto flex justify-end">
            <Link
              href="/dashboard/international"
              className="group/btn w-full xs:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-none active:scale-95 transition-all cursor-pointer"
            >
              <span>{t("olympiad.btn_details") || "Qatnashish"}</span>
              <ArrowUpRight size={15} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
