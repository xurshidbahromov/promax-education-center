"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
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
 const [tests, setTests] = useState<Test[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedSubject, setSelectedSubject] = useState<Subject | "all">("all");
 const [selectedType, setSelectedType] = useState<TestType | "all">("all");

 useEffect(() => {
 async function fetchTests() {
 const filters: TestFilters = {};

 if (selectedSubject !== "all") {
 filters.subject = selectedSubject;
 }

 if (selectedType !== "all") {
 filters.test_type = selectedType;
 }

 if (searchQuery.trim()) {
 filters.search = searchQuery;
 }

 const data = await getPublishedTests(filters);
 setTests(data);
 setLoading(false);
 }

 fetchTests();
 }, [selectedSubject, selectedType, searchQuery]);

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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 lg:py-12 flex flex-col gap-8">

        {/* ── PAGE HEADER & SEARCH ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] md:text-[14px] text-brand-blue font-bold uppercase tracking-widest bg-brand-blue/10 w-fit px-3 py-1 rounded-full">
              {t('tests.subtitle')}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('tests.title')}
            </h1>
          </div>

          {/* Minimalist Search */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2.5 rounded-[24px] border border-gray-200/50 dark:border-slate-800/50 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all w-full md:max-w-md">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t('tests.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[15px] w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 py-2 px-1 outline-none font-medium"
            />
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 bg-white/40 dark:bg-slate-900/40 p-4 rounded-[28px] border border-gray-200/30 dark:border-slate-800/30 backdrop-blur-md">
          {/* Subjects */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:w-auto flex-1">
            {subjects.map((subject) => {
              const isActive = selectedSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id as any)}
                  className={`
                    px-5 py-2.5 rounded-[20px] whitespace-nowrap text-[14px] font-bold transition-all duration-300
                    ${isActive 
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20" 
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-gray-200/50 dark:border-slate-700/50"
                    }
                  `}
                >
                  {subject.label}
                </button>
              );
            })}
          </div>

          {/* Types (hidden on small mobile to avoid clutter, visible on md+) */}
          <div className="hidden md:flex items-center gap-2 shrink-0 border-l pl-6 border-gray-200 dark:border-slate-700">
            {types.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`
                    px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap text-[13px] font-bold transition-all duration-300
                    ${isActive 
                      ? "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon size={16} className={isActive ? "text-brand-blue" : "text-slate-400"} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TESTS LIST ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            // Responsive minimalist skeleton for tests
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] p-5 flex flex-col md:flex-row items-start md:items-center gap-4 border border-gray-200/50 dark:border-slate-800/50 animate-pulse">
                <div className="w-14 h-14 rounded-full shrink-0 bg-slate-200/80 dark:bg-slate-700/50" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-5 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
                  <div className="h-4 w-1/2 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                </div>
              </div>
            ))
          ) : tests.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] p-12 border border-gray-200/50 dark:border-slate-800/50 shadow-sm flex flex-col items-center gap-4 text-center mt-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
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
                  className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm border border-gray-200/50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-brand-blue/5 hover:-translate-y-1 transition-all duration-300 group block"
                >
                  {/* Icon Badge */}
                  <div className={`w-14 h-14 rounded-full ${colors.light} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <FileText size={22} className="text-brand-blue" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left min-w-0 w-full">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[17px] line-clamp-2 leading-tight mb-2">
                      {test.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="capitalize text-brand-blue bg-brand-blue/10 px-2.5 py-0.5 rounded-md">{test.subject}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><BookOpen size={14}/> {test.total_questions}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> {test.duration_minutes ? `${test.duration_minutes}m` : "∞"}</span>
                    </div>
                  </div>

                  {/* Chevron arrow (Desktop) */}
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-colors shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
