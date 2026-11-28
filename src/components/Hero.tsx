"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Crown,
  Trophy,
  FileCheck,
  Play,
  GraduationCap,
  BookOpen,
  Clock,
} from "lucide-react";
import Image from "next/image";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[88vh] lg:min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden pt-24 lg:pt-28 pb-16 px-4 -mt-16">
      <div className="max-w-7xl mx-auto relative z-20 grid lg:grid-cols-2 gap-12 items-center justify-center w-full">
        {/* Left Column: Text & CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left relative z-10">
          {/* Welcome Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-6 sm:mb-7 mt-4 sm:mt-0"
          >
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-[13px] font-semibold tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>{t("hero.welcome")}</span>
            </span>
          </motion.div>

          {/* Headline (Immediate paint for Core Web Vitals, smooth DM Sans) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.06] mb-5 max-w-2xl">
            {t("hero.headline")
              .split(",")
              .map(
                (part, i) =>
                  part.trim() && (
                    <span
                      key={i}
                      className={`block ${
                        i === 1
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                          : ""
                      }`}
                    >
                      {part.trim()}
                    </span>
                  )
              )}
          </h1>

          {/* Slogan */}
          <p className="text-base sm:text-lg md:text-xl font-medium text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed mx-auto lg:mx-0">
            {t("hero.subheadline") || t("hero.slogan")}
          </p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto justify-center lg:justify-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <Link
              href="/register"
              className="bg-amber-500 hover:bg-amber-600 text-white px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base shadow-lg shadow-amber-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 outline-none"
            >
              <span>{t("hero.cta.primary")}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              href="/dashboard/tests"
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base shadow-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none"
            >
              <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span>{t("hero.cta.tests")}</span>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-10 pt-7 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-3.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{t("hero.trust.cert")}</span>
            </div>
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-brand-blue dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{t("hero.trust.exam")}</span>
            </div>
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{t("hero.trust.mock")}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── DESKTOP 3-COLUMN HYBRID EDITORIAL MOSAIC (Large & Flush Kissing Capsules) ── */}
      <div className="hidden lg:grid grid-cols-3 gap-0 absolute top-0 bottom-0 right-0 w-[53%] xl:w-[51%] z-0 pointer-events-none overflow-hidden">
        {/* Column 1 */}
        <div className="flex flex-col gap-0 pt-[9%] h-full pointer-events-auto">
          {/* Col 1 Top: Deep Slate SAT & IELTS Score Capsule */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="flex-1 w-full rounded-full overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/15 flex flex-col items-center justify-center text-center px-5 py-6 text-white select-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 18%, rgba(245,158,11,0.22) 0%, transparent 58%), radial-gradient(circle at 50% 95%, rgba(0,86,210,0.28) 0%, transparent 55%)",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest mb-4">
              <Crown size={12} />
              <span>Top Natija</span>
            </div>

            <div className="space-y-3.5 w-full tabular-nums">
              <div>
                <p className="text-4xl xl:text-5xl font-bold font-sans tracking-tight leading-none text-white">
                  1560
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                  SAT Digital
                </p>
              </div>

              <div className="w-14 h-px bg-white/15 mx-auto" />

              <div>
                <p className="text-4xl xl:text-5xl font-bold font-sans tracking-tight leading-none text-amber-400">
                  8.0
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">
                  IELTS Band
                </p>
              </div>
            </div>
          </motion.div>

          {/* Col 1 Bottom: Editorial Photo #1 (Library Student) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative w-full rounded-t-full overflow-hidden border border-white/70 dark:border-slate-800 shadow-2xl shadow-slate-900/12 bg-slate-900"
          >
            <Image
              src="/hero_images/editorial-1.jpg"
              alt="Promax kutubxona o'quvchisi"
              fill
              priority
              sizes="(max-width: 1280px) 260px, 320px"
              className="object-cover object-[50%_22%] hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>

        {/* Column 2 (Center Hero Focal Column) */}
        <div className="flex flex-col gap-0 pt-[3%] pb-[3%] h-full pointer-events-auto">
          {/* Col 2 Top: Editorial Photo #2 (Campus Atrium Student) */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex-1 relative w-full rounded-full overflow-hidden border border-white/70 dark:border-slate-800 shadow-2xl shadow-slate-900/15 bg-slate-900"
          >
            <Image
              src="/hero_images/editorial-2.jpg"
              alt="Promax talabasi"
              fill
              priority
              sizes="(max-width: 1280px) 260px, 320px"
              className="object-cover object-[50%_18%] hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Col 2 Bottom: Brand Blue 98% Acceptance Capsule */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="flex-1 w-full rounded-full overflow-hidden bg-brand-blue border border-blue-400/30 shadow-2xl shadow-brand-blue/25 flex flex-col items-center justify-center text-center px-5 py-6 text-white select-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 15%, rgba(255,255,255,0.22) 0%, transparent 55%), linear-gradient(180deg, #0056D2 0%, #093580 100%)",
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
              <Trophy size={22} className="text-amber-300" />
            </div>

            <p className="text-5xl xl:text-6xl font-bold font-sans tracking-tight tabular-nums leading-none">
              98%
            </p>
            <p className="text-xs sm:text-[13px] font-semibold text-blue-100 mt-2.5 leading-snug max-w-[160px]">
              {t("home.stats.acceptance")}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold tabular-nums">
              <GraduationCap size={14} className="text-amber-300" />
              <span>5,000+</span>
            </div>
          </motion.div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-0 h-full pointer-events-auto">
          {/* Col 3 Top: Dashboard-Style Solid Ticket Capsule */}
          <motion.div
            initial={{ opacity: 0, y: -36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex-1 w-full rounded-b-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/10 flex flex-col justify-between relative"
          >
            {/* ── TICKET TOP STUB ── */}
            <div className="relative bg-slate-50 dark:bg-slate-800/60 pt-20 pb-3.5 px-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-0">
                <FileCheck size={14} className="text-amber-500 shrink-0" />
                <span className="truncate">Matematika</span>
              </div>

              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                Mock
              </span>
            </div>

            {/* ── TICKET PERFORATION & CUTOUT NOTCHES ── */}
            <div className="relative w-full flex items-center h-0 z-20">
              <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3 h-5 overflow-hidden pointer-events-none">
                <div className="w-5 h-5 rounded-full -ml-2.5 bg-[var(--background)] border border-slate-200/90 dark:border-slate-800" />
              </div>

              <div className="w-full px-3.5 flex items-center overflow-hidden">
                <svg className="w-full h-[2px] text-slate-200 dark:text-slate-700" preserveAspectRatio="none">
                  <line
                    x1="0"
                    y1="1"
                    x2="100%"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-3 h-5 overflow-hidden pointer-events-none">
                <div className="w-5 h-5 rounded-full bg-[var(--background)] border border-slate-200/90 dark:border-slate-800" />
              </div>
            </div>

            {/* ── COMPACT SOLID TICKET BODY ── */}
            <div className="flex-1 px-5 pt-4 pb-8 flex flex-col justify-between items-center text-left gap-3.5">
              <div className="w-full space-y-3">
                <p className="text-[15px] xl:text-base font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug text-center">
                  Online Test &amp; SAT
                </p>

                <div className="space-y-1.5 text-xs tabular-nums">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-slate-400" />
                      <span>Savollar:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      30 ta
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>Davomiyligi:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      60 daqiqa
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/tests"
                className="w-full max-w-[160px] py-2.5 px-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <Play size={12} className="fill-white" />
                <span>Boshlash</span>
              </Link>
            </div>
          </motion.div>

          {/* Col 3 Bottom: Editorial Photo #3 (Golden-Hour University Campus) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48 }}
            className="flex-1 relative w-full rounded-t-full overflow-hidden border border-white/70 dark:border-slate-800 shadow-2xl shadow-slate-900/12 bg-slate-900"
          >
            <Image
              src="/hero_images/editorial-3.jpg"
              alt="Xalqaro universitet kampusi"
              fill
              sizes="(max-width: 1280px) 260px, 320px"
              className="object-cover object-center hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
