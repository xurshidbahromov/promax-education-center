"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[88vh] lg:min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden pt-24 lg:pt-32 pb-16 px-4 -mt-16">
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
            transition={{ duration: 0.45, delay: 0.25 }}
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
            transition={{ duration: 0.8, delay: 0.45 }}
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

      {/* Desktop Photo Collage */}
      <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[55%] xl:w-[50%] z-0 pointer-events-none overflow-visible">
        {/* Decorative Dots */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[15%] left-[5%] w-3 h-3 lg:w-5 lg:h-5 rounded-full bg-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.3)] z-10"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] left-[2%] w-4 h-4 lg:w-7 lg:h-7 rounded-full bg-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[40%] right-[5%] w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10"
        />

        {/* Column 1 */}
        <div className="absolute left-[2%] lg:left-[5%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute top-[12%] bottom-[51.5%] w-full rounded-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero1.jpeg"
              alt="Student"
              fill
              priority
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover object-top hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="absolute top-[51.5%] bottom-0 w-full rounded-t-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero2.jpeg"
              alt="Students with books"
              fill
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>

        {/* Column 2 */}
        <div className="absolute left-[35%] lg:left-[38%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="absolute top-[6%] bottom-[51.5%] w-full rounded-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero3.jpeg"
              alt="Student"
              fill
              priority
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover object-top hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="absolute top-[51.5%] bottom-[6%] w-full rounded-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero4.jpeg"
              alt="Student studying"
              fill
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover object-top hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>

        {/* Column 3 */}
        <div className="absolute left-[68%] lg:left-[71%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="absolute top-0 bottom-[51.5%] w-full rounded-b-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero5.jpeg"
              alt="Student"
              fill
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover object-top scale-[1.2] translate-y-[10%] hover:scale-[1.22] transition-transform duration-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="absolute top-[51.5%] bottom-0 w-full rounded-t-full overflow-hidden shadow-2xl"
          >
            <Image
              src="/hero_images/hero6.jpeg"
              alt="Students learning"
              fill
              sizes="(max-width: 768px) 30vw, 240px"
              className="object-cover object-top hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
