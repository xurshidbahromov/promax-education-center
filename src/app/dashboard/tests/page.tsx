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
  X,
} from "lucide-react";
import { getPublishedTests, type Subject, type TestType } from "@/lib/tests";

const SUBJECT_LABELS: Record<Subject, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy",
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

        {/* ── TESTS LIST (Original compact single-row card, Promax palette) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-1">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-4 flex items-center gap-4 border border-white/60 dark:border-slate-800/60 shadow-none animate-pulse"
              >
                <div className="w-12 h-12 rounded-2xl shrink-0 bg-slate-200/80 dark:bg-slate-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                </div>
                <div className="w-20 h-8 rounded-full bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
              </div>
            ))
          ) : tests.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 border border-white/60 dark:border-slate-800/60 shadow-none flex flex-col items-center gap-3 text-center mt-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileCheck size={26} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
                {t("tests.list.no_tests")}
              </h2>
              {(selectedSubject !== "all" || selectedType !== "all" || searchQuery.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedType("all");
                  }}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          ) : (
            tests.map((test) => {
              const subjectName = SUBJECT_LABELS[test.subject] || test.subject;
              return (
                <Link
                  key={test.id}
                  href={`/dashboard/tests/${test.id}`}
                  className="w-full h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[26px] p-4 flex flex-col gap-3 shadow-none border border-white/60 dark:border-slate-800/60 hover:border-amber-500/35 active:scale-[0.99] transition-all duration-200 group"
                >
                  {/* Row 1: Icon + Full Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <FileCheck size={21} />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] leading-snug line-clamp-2 font-sans tracking-tight flex-1 min-w-0">
                      {test.title}
                    </h3>
                  </div>

                  {/* Row 2: Unclipped Meta + Action Pill */}
                  <div className="flex items-center justify-between gap-2 pl-0.5">
                    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums min-w-0">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {subjectName}
                      </span>
                      <span>·</span>
                      <span>{test.total_questions} savol</span>
                      <span>·</span>
                      <span>
                        {test.duration_minutes ? `${test.duration_minutes} daq` : "Cheksiz"}
                      </span>
                    </div>

                    <div className="flex items-center bg-amber-500 text-white rounded-full px-4 py-1.5 text-[12px] font-bold group-hover:bg-amber-600 transition-colors shrink-0">
                      Boshlash
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
