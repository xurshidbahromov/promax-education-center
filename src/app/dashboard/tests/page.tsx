"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  FileText,
  Clock,
  Zap,
  BookOpen,
  CheckCircle2,
  BarChart,
  Search,
  Filter,
  TrendingUp,
  Award,
  Target
} from "lucide-react";
import { getPublishedTests, type Test, type TestFilters, Subject, TestType } from "@/lib/tests";
import { TestCardSkeleton } from "@/components/ui/Skeleton";

export default function OnlineTestsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">("all");
  const [selectedType, setSelectedType] = useState<TestType | "all">("all");

  const fetcher = async ([url, filters]: [string, TestFilters]) => {
    return getPublishedTests(filters);
  };

  const currentFilters: TestFilters = {};
  if (selectedSubject !== "all") currentFilters.subject = selectedSubject;
  if (selectedType !== "all") currentFilters.test_type = selectedType;
  if (searchQuery.trim()) currentFilters.search = searchQuery;

  const { data: tests = [], isLoading: loading } = useSWR(
    ['/api/tests/published', currentFilters],
    fetcher
  );

  const subjects = [
    { id: "all", label: t('tests.subjects.all'), color: "bg-gray-500" },
    { id: "math", label: t('tests.subjects.math'), color: "bg-blue-500" },
    { id: "english", label: t('tests.subjects.english'), color: "bg-green-500" },
    { id: "physics", label: t('tests.subjects.physics'), color: "bg-purple-500" },
    { id: "chemistry", label: t('tests.subjects.chemistry'), color: "bg-orange-500" },
    { id: "biology", label: t('tests.subjects.biology'), color: "bg-teal-500" },
  ];

  const types = [
    { id: "all", label: t('tests.types.all'), icon: Filter },
    { id: "subject", label: t('tests.types.subject'), icon: BookOpen },
    { id: "practice", label: t('tests.types.practice'), icon: Target },
    { id: "progress", label: t('tests.types.progress'), icon: TrendingUp },
    { id: "mock", label: t('tests.types.mock'), icon: Award },
  ];

  const getSubjectColor = (subject: Subject) => {
    const subjectConfig: Record<Subject, { gradient: string; light: string }> = {
      math: { gradient: "from-blue-500 to-cyan-500", light: "bg-blue-50 dark:bg-blue-900/20" },
      english: { gradient: "from-green-500 to-emerald-500", light: "bg-green-50 dark:bg-green-900/20" },
      physics: { gradient: "from-purple-500 to-pink-500", light: "bg-purple-50 dark:bg-purple-900/20" },
      chemistry: { gradient: "from-orange-500 to-red-500", light: "bg-orange-50 dark:bg-orange-900/20" },
      biology: { gradient: "from-teal-500 to-green-500", light: "bg-teal-50 dark:bg-teal-900/20" },
      general: { gradient: "from-gray-500 to-slate-500", light: "bg-gray-50 dark:bg-gray-900/20" },
    };
    return subjectConfig[subject] || subjectConfig.general;
  };

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-[1600px] mx-auto pt-4 sm:pt-6">

        {/* ── PAGE HEADER & SEARCH ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              {t('tests.subtitle')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('tests.title')}
            </h1>
          </div>

          {/* Minimalist Search */}
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-[20px] border border-gray-200/50 dark:border-slate-800/50 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all w-full">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={t('tests.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[14px] w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 py-1.5 px-1 outline-none"
            />
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col gap-3">
          {/* Subjects */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subjects.map((subject) => {
              const isActive = selectedSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id as any)}
                  className={`
                    px-4 py-2 rounded-[18px] whitespace-nowrap text-[13px] font-medium transition-all duration-300
                    ${isActive 
                      ? "bg-brand-blue text-white shadow-sm" 
                      : "bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    }
                  `}
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
                  onClick={() => setSelectedType(type.id as any)}
                  className={`
                    px-3 py-1.5 rounded-full flex items-center gap-2 whitespace-nowrap text-[12px] font-medium transition-all duration-300
                    ${isActive 
                      ? "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon size={14} className={isActive ? "text-brand-blue" : "text-slate-400"} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TESTS LIST ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
          {loading ? (
            // Inline minimalist skeleton for tests
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex items-center gap-4 border border-white/60 dark:border-slate-700/50 shadow-sm animate-pulse">
                <div className="w-12 h-12 rounded-2xl shrink-0 bg-slate-200/80 dark:bg-slate-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                </div>
                <div className="w-5 h-5 rounded bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
              </div>
            ))
          ) : tests.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-10 border border-white/60 dark:border-slate-700/50 shadow-sm flex flex-col items-center gap-4 text-center mt-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText size={28} className="text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {t('tests.list.no_tests')}
              </h2>
            </div>
          ) : (
            tests.map((test) => {
              const colors = getSubjectColor(test.subject);
              
              return (
                <Link
                  key={test.id}
                  href={`/dashboard/tests/${test.id}`}
                  className="w-full h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm border border-white/60 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-2xl ${colors.light} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    <FileText size={20} className="text-brand-blue" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate leading-tight">
                      {test.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      <span className="capitalize text-brand-blue shrink-0">{test.subject}</span>
                      <span className="shrink-0">·</span>
                      <span className="shrink-0">{test.total_questions} savol</span>
                      <span className="shrink-0">·</span>
                      <span className="shrink-0">{test.duration_minutes ? `${test.duration_minutes} daq` : "Cheksiz"}</span>
                    </div>
                  </div>

                  {/* Chevron arrow */}
                  <div className="flex items-center text-brand-blue bg-brand-blue/10 rounded-full px-3 py-1.5 text-[12px] font-bold group-hover:bg-brand-blue group-hover:text-white transition-colors shrink-0">
                    Boshlash
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
