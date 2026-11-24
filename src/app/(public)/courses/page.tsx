"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { courses, Course } from "@/data/courses";

type CategoryFilter = "all" | "general" | "certificate" | "prep";

const CourseCard = ({ course, index }: { course: Course; index: number }) => {
  const { t } = useLanguage();
  const Icon = course.icon;

  const badgeText =
    course.type === "general"
      ? t("courses.categories.general")
      : course.type === "certificate"
      ? t("courses.cert.title")
      : t("courses.prep.title");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.35 }}
      className="h-full"
    >
      <Link
        href={`/courses/${course.id}`}
        className="group flex flex-col rounded-[24px] overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/45 active:scale-[0.99] transition-all duration-200 h-full bg-white dark:bg-slate-900"
      >
        {/* Clean 16:10 Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <Image
            src={course.image}
            alt={t(`courses.${course.id}`)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none" />

          {/* Single subtle category pill */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-semibold">
            {badgeText}
          </span>
        </div>

        {/* Clean Solid Body */}
        <div className="p-5 flex flex-col justify-between gap-4 flex-1">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-[17px] font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
                {t(`courses.${course.id}`)}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
              {t(`courses.${course.id}.desc`)}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">
              {course.type === "general"
                ? "Offline"
                : course.type === "certificate"
                ? "Sertifikat"
                : "OTM"}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
              <span>{t("courses.more")}</span>
              <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function CoursesPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const generalCourses = courses.filter((c) => c.type === "general");
  const certCourses = courses.filter((c) => c.type === "certificate");
  const prepCourses = courses.filter((c) => c.type === "prep");

  const sections: { key: Exclude<CategoryFilter, "all">; title: string; items: Course[]; cols: string }[] = [
    {
      key: "general",
      title: t("courses.categories.general"),
      items: generalCourses,
      cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    },
    {
      key: "certificate",
      title: t("courses.cert.title"),
      items: certCourses,
      cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
    {
      key: "prep",
      title: t("courses.prep.title"),
      items: prepCourses,
      cols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  ];

  const visibleSections =
    activeFilter === "all"
      ? sections
      : sections.filter((s) => s.key === activeFilter);

  const filterTabs: { id: CategoryFilter; label: string; count: number }[] = [
    { id: "all", label: t("courses.title"), count: courses.length },
    { id: "general", label: t("courses.categories.general"), count: generalCourses.length },
    { id: "certificate", label: t("courses.cert.title"), count: certCourses.length },
    { id: "prep", label: t("courses.prep.title"), count: prepCourses.length },
  ];

  return (
    <div className="w-full pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Clean Editorial Header */}
        <div className="mb-8 sm:mb-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-3">
            {t("courses.title")}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {t("courses.subtitle")}
          </p>
        </div>

        {/* Clean Category Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-10">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full tabular-nums ${
                    active
                      ? "bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Sections */}
        <div className="space-y-14">
          {visibleSections.map((section) => (
            <section key={section.key}>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {section.items.length} ta kurs
                </span>
              </div>

              <div className={`grid ${section.cols} gap-5`}>
                {section.items.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
