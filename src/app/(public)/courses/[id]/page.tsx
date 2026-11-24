"use client";

import { useLanguage } from "@/context/LanguageContext";
import { courses } from "@/data/courses";
import { courseDetails } from "@/data/course-details";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";

export default function CourseDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params?.id as string;

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return notFound();
  }

  const Icon = course.icon;
  const categoryLabel =
    course.type === "general"
      ? t("courses.categories.general")
      : course.type === "certificate"
      ? t("courses.cert.title")
      : t("courses.prep.title");

  return (
    <div className="w-full pt-8 sm:pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Back Link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{t("nav.courses")}</span>
        </Link>

        {/* Clean Editorial Split Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[280px] lg:min-h-full bg-slate-100 dark:bg-slate-800">
            <Image
              src={course.image}
              alt={t(`courses.${course.id}`)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <Icon size={14} className="text-brand-blue dark:text-blue-400" />
                <span>{categoryLabel}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                {t(`courses.${course.id}`)}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t(`courses.${course.id}.long_desc`)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold inline-flex items-center gap-2 active:scale-[0.97] transition-all"
              >
                <span>{t("hero.cta.primary")}</span>
                <ArrowRight size={15} />
              </Link>
              <a
                href="tel:+998955137776"
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center gap-2 transition-colors tabular-nums"
              >
                <Phone size={15} className="text-brand-blue dark:text-blue-400" />
                <span>+998 95 513 77 76</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Programs / Methodology */}
          <div className="lg:col-span-2 space-y-6">
            {courseDetails[id] ? (
              courseDetails[id].programs.map((program, index) => (
                <section
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-[26px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-start gap-3.5 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={20} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug">
                      {t(program.titleKey)}
                    </h2>
                  </div>

                  <ul className="space-y-3.5">
                    {t(program.featuresKey)
                      .split("|")
                      .map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                            {feature.trim()}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {program.priceKey && (
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        Kurs narxi:
                      </span>
                      <span className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                        {t(program.priceKey)}
                      </span>
                    </div>
                  )}
                </section>
              ))
            ) : (
              <section className="bg-white dark:bg-slate-900 rounded-[26px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                    {t("course.methodology")}
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium mb-6">
                  {t("course.methodology.desc")}
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((step) => (
                    <li
                      key={step}
                      className="flex items-start gap-3.5 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold flex-shrink-0 tabular-nums">
                        0{step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                          {t(`methodology.step${step}.title`)}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {t(`methodology.step${step}.desc`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Sidebar: Materials */}
          <div className="lg:col-span-1">
            <section className="bg-white dark:bg-slate-900 rounded-[26px] p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 sticky top-20 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                  {t("course.materials")}
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-[15px] leading-relaxed font-medium">
                {t(`courses.${course.id}.materials`)}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{t("cta.button.primary")}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
