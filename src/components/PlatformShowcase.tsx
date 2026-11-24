"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileCheck,
  Trophy,
  PlayCircle,
  Coins,
  Flame,
  Gift,
  Clock,
  BookOpen,
  Play,
  Crown,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PlatformShowcase = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <Sparkles size={13} />
              <span>{t("platform.badge")}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-3.5"
            >
              {t("platform.title")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
            >
              {t("platform.subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm active:scale-[0.97] transition-all shadow-sm"
            >
              <span>{t("platform.cta")}</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* 12-Column Bento Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ── 1. Online Tests (Ticket Card Preview) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 overflow-hidden"
          >
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full w-fit">
                  <FileCheck size={14} />
                  <span>{t("platform.tests.meta")}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                  {t("platform.tests.title")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {t("platform.tests.desc")}
                </p>
              </div>
            </div>

            {/* Mini Signature Ticket Card */}
            <div className="w-full sm:w-[235px] shrink-0 bg-slate-50/90 dark:bg-slate-800/50 rounded-[22px] border border-slate-200/80 dark:border-slate-700/70 overflow-hidden select-none">
              <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCheck size={12} className="text-amber-500" />
                  Matematika
                </span>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
                  Mock
                </span>
              </div>

              {/* Ticket Notches & Perforation */}
              <div className="relative h-0 flex items-center">
                <div className="w-2.5 h-4 -ml-1.5 rounded-r-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-700/70" />
                <div className="flex-1 border-t border-dashed border-slate-300 dark:border-slate-700 mx-1" />
                <div className="w-2.5 h-4 -mr-1.5 rounded-l-full bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-700/70" />
              </div>

              <div className="p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  DTM &amp; Milliy Sertifikat #14
                </p>
                <div className="space-y-1 text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> Savollar:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">30 ta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Vaqt:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">60 daqiqa</span>
                  </div>
                </div>
                <div className="w-full py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Play size={11} className="fill-white" />
                  <span>Boshlash</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 2. Competitions & SAT Arena (Podium Preview) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="lg:col-span-5 bg-slate-900 dark:bg-slate-900 rounded-[28px] border border-slate-800 p-6 sm:p-7 flex flex-col justify-between gap-5 text-white overflow-hidden relative"
            style={{
              backgroundImage:
                "radial-gradient(circle at 90% 10%, rgba(245,158,11,0.18) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(0,86,210,0.28) 0%, transparent 55%)",
            }}
          >
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/20 px-3 py-1 rounded-full w-fit">
                <Trophy size={13} />
                <span>{t("platform.competitions.meta")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-white">
                {t("platform.competitions.title")}
              </h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {t("platform.competitions.desc")}
              </p>
            </div>

            {/* Compact Top-3 Podium Visual */}
            <div className="grid grid-cols-3 items-end gap-2.5 pt-2 relative z-10 select-none tabular-nums">
              <div className="bg-white/10 border border-white/10 rounded-t-2xl rounded-b-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase">2-o&apos;rin</span>
                <p className="text-base font-bold text-white mt-0.5">94%</p>
                <div className="h-1.5 rounded-full bg-slate-400/50 mt-2" />
              </div>

              <div className="bg-gradient-to-b from-amber-500/25 to-amber-500/10 border border-amber-400/35 rounded-t-2xl rounded-b-xl p-3.5 text-center">
                <Crown size={15} className="text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-amber-300 uppercase">1-o&apos;rin</span>
                <p className="text-lg font-bold text-white mt-0.5">1560</p>
                <div className="h-2 rounded-full bg-amber-400 mt-2" />
              </div>

              <div className="bg-white/10 border border-white/10 rounded-t-2xl rounded-b-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase">3-o&apos;rin</span>
                <p className="text-sm font-bold text-white mt-0.5">91%</p>
                <div className="h-1.5 rounded-full bg-orange-400/60 mt-2" />
              </div>
            </div>
          </motion.div>

          {/* ── 3. Video Lessons & Progress ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between gap-5"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-blue dark:text-blue-400 bg-brand-blue/10 px-3 py-1 rounded-full w-fit">
                <PlayCircle size={14} />
                <span>{t("platform.lessons.meta")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                {t("platform.lessons.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {t("platform.lessons.desc")}
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 tabular-nums">
              {[
                { label: "Matematika", pct: 86, bar: "bg-brand-blue" },
                { label: "Ingliz tili • IELTS", pct: 74, bar: "bg-amber-500" },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">{row.label}</span>
                    <span className="text-slate-900 dark:text-white">{row.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── 4. Promax Coins, Streak & Shop ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between gap-5"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
                <Coins size={14} />
                <span>{t("platform.rewards.meta")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                {t("platform.rewards.title")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                {t("platform.rewards.desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tabular-nums">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">14 kun</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Daily Streak</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">1,250</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Promax Coins</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Gift size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">Sovg&apos;alar</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Promax Shop</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcase;
