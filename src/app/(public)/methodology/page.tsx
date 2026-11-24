"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, TrendingUp, Award, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MethodologyPage = () => {
  const { t } = useLanguage();

  const steps = [
    {
      id: "step1",
      icon: ClipboardList,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "step2",
      icon: CheckCircle2,
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "step3",
      icon: TrendingUp,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: "step4",
      icon: Award,
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    },
  ];

  return (
    <div className="w-full pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Clean Editorial Header */}
        <div className="mb-12 sm:mb-16 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-3.5">
            {t("methodology.title")}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {t("methodology.subtitle")}
          </p>
        </div>

        {/* Clean Structured Step Cards */}
        <section className="space-y-6 sm:space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
              >
                {/* Text Column */}
                <div
                  className={`lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-center gap-4 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 tabular-nums">
                      0{index + 1} / 04
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug">
                    {t(`methodology.${step.id}.title`)}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {t(`methodology.${step.id}.desc`)}
                  </p>
                </div>

                {/* Clean Photo Column */}
                <div
                  className={`lg:col-span-6 relative min-h-[220px] sm:min-h-[280px] bg-slate-100 dark:bg-slate-800 ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <Image
                    src={step.image}
                    alt={t(`methodology.${step.id}.title`)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* Quiet Bottom CTA */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
              {t("cta.title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t("cta.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-colors"
            >
              {t("nav.courses")}
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold inline-flex items-center gap-2 active:scale-[0.97] transition-all"
            >
              <span>{t("hero.cta.primary")}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
