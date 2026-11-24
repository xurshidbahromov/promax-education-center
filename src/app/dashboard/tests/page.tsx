"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileCheck,
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  Award,
  Target,
  Clock,
  Play,
  X,
} from "lucide-react";
import { getPublishedTests, type Subject, type TestType } from "@/lib/tests";
import PromaxEmptyState from "@/components/ui/PromaxEmptyState";

const SUBJECT_LABELS: Record<Subject, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy",
};

const TEST_TYPE_LABELS: Record<TestType, string> = {
  subject: "Fan testi",
  practice: "Mashq",
  progress: "Nazorat",
  mock: "Mock imtihon",
};

export default function OnlineTestsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">("all");
  const [selectedType, setSelectedType] = useState<TestType | "all">("all");

  // Fetch all published tests once (cached) for instant 0ms client-side filtering
  const { data: allTests = [], isLoading: loading } = useQuery({
    queryKey: ["publishedTestsAll"],
    queryFn: () => getPublishedTests({}),
    staleTime: 3 * 60 * 1000,
  });

  const tests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTests.filter((test) => {
      if (selectedSubject !== "all" && test.subject !== selectedSubject) return false;
      if (selectedType !== "all" && test.test_type !== selectedType) return false;
      if (!q) return true;
      const subjectLabel = (SUBJECT_LABELS[test.subject] || test.subject || "").toLowerCase();
      return (
        (test.title || "").toLowerCase().includes(q) ||
        (test.description || "").toLowerCase().includes(q) ||
        subjectLabel.includes(q)
      );
    });
  }, [allTests, selectedSubject, selectedType, searchQuery]);

  const subjects = [
    { id: "all", label: t("tests.subjects.all") },
    { id: "math", label: t("tests.subjects.math") },
    { id: "english", label: t("tests.subjects.english") },
    { id: "physics", label: t("tests.subjects.physics") },
    { id: "chemistry", label: t("tests.subjects.chemistry") },
    { id: "biology", label: t("tests.subjects.biology") },
  ];

  const types = [
    { id: "all", label: t("tests.types.all"), icon: Filter },
    { id: "subject", label: t("tests.types.subject"), icon: BookOpen },
    { id: "practice", label: t("tests.types.practice"), icon: Target },
    { id: "progress", label: t("tests.types.progress"), icon: TrendingUp },
    { id: "mock", label: t("tests.types.mock"), icon: Award },
  ];

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-12">
      <div className="relative z-10 flex flex-col gap-6 max-w-[1600px] mx-auto pt-1 sm:pt-2">
        {/* ── PAGE HEADER & SEARCH ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              {t("tests.subtitle")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
              {t("tests.title")}
            </h1>
          </div>

          {/* Minimalist Search */}
          <div className="flex items-center gap-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-white/60 dark:border-slate-800/60 shadow-none focus-within:ring-2 focus-within:ring-amber-500/20 transition-all w-full">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={t("tests.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[14px] w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 py-1.5 px-1 outline-none"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Qidiruvni tozalash"
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── FILTERS (Original clean switchers, matched palette) ── */}
        <div className="flex flex-col gap-3">
          {/* Subjects */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subjects.map((subject) => {
              const isActive = selectedSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubject(subject.id as Subject | "all")}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-[13px] font-bold transition-all duration-200 shadow-none cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-white"
                      : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-white/60 dark:border-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-800/80"
                  }`}
                >
                  {subject.label}
                </button>
              );
            })}
          </div>

          {/* Types */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {types.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id as TestType | "all")}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      isActive ? "text-amber-500" : "text-slate-400"
                    }
                  />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TESTS LIST (Compact Solid Ticket Cards matching Competitions) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full bg-white dark:bg-slate-900 rounded-[26px] border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-pulse"
              >
                <div className="h-11 bg-slate-50 dark:bg-slate-800/60 px-5 flex items-center justify-between">
                  <div className="h-3.5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="h-5 w-4/5 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-10 w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))
          ) : tests.length === 0 ? (
            <PromaxEmptyState
              variant="tests"
              compact
              className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 !bg-white dark:!bg-slate-900"
              title={t("tests.list.no_tests")}
              description={
                selectedSubject !== "all" || selectedType !== "all" || searchQuery.trim()
                  ? "Qidiruv yoki tanlangan filtrlarga mos test topilmadi. Filtrlarni tozalab qayta urinib ko'ring."
                  : "Hozircha online testlar joylanmoqda. Tez orada yangi testlar qo'shiladi."
              }
              actions={
                (selectedSubject !== "all" || selectedType !== "all" || searchQuery.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSubject("all");
                      setSelectedType("all");
                    }}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors active:scale-95 cursor-pointer"
                  >
                    Filtrlarni tozalash
                  </button>
                )
              }
            />
          ) : (
            tests.map((test) => {
              const subjectName = SUBJECT_LABELS[test.subject] || test.subject;
              const typeLabel = TEST_TYPE_LABELS[test.test_type] || "Test";

              return (
                <Link
                  key={test.id}
                  href={`/dashboard/tests/${test.id}`}
                  className="bg-white dark:bg-slate-900 rounded-[26px] border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/45 active:scale-[0.99] transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
                >
                  {/* ── COMPACT TICKET STUB ── */}
                  <div className="relative bg-slate-50 dark:bg-slate-800/60 px-5 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-0">
                      <FileCheck size={14} className="text-amber-500 shrink-0" />
                      <span className="truncate">{subjectName}</span>
                    </div>

                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                      {typeLabel}
                    </span>
                  </div>

                  {/* ── TICKET PERFORATION & NOTCHES ── */}
                  <div className="relative w-full flex items-center h-0 z-20">
                    <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3 h-5 overflow-hidden pointer-events-none">
                      <div className="w-5 h-5 rounded-full -ml-2.5 bg-[var(--background)] border border-slate-200/90 dark:border-slate-800" />
                    </div>

                    <div className="w-full px-3.5 flex items-center overflow-hidden">
                      <svg className="w-full h-[2px] text-slate-200 dark:text-slate-800" preserveAspectRatio="none">
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

                  {/* ── COMPACT SOLID BODY ── */}
                  <div className="p-4.5 sm:p-5 flex flex-col justify-between gap-4 flex-1">
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-[17px] font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
                        {test.title}
                      </h3>

                      <div className="space-y-1.5 text-xs tabular-nums">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={13} className="text-slate-400" />
                            <span>Savollar:</span>
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {test.total_questions} ta
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            <span>Davomiyligi:</span>
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {test.duration_minutes ? `${test.duration_minutes} daqiqa` : "Cheksiz"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full py-2.5 rounded-2xl bg-amber-500 group-hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors">
                      <Play size={13} className="fill-white" />
                      <span>Boshlash</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
