"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import useSWR from "swr";
import {
 Search,
 Filter,
 CheckCircle2,
 XCircle,
 Clock,
 ChevronDown,
 FileText,
 Eye,
 BookOpen,
 GraduationCap
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getStudentResults, type ExamResult } from "@/lib/supabase-queries";
import Link from "next/link";
import { ResultRowSkeleton } from "@/components/ui/Skeleton";

export default function ResultsPage() {
 const { t } = useLanguage();
 const [searchQuery, setSearchQuery] = useState("");
 const [filterStatus, setFilterStatus] = useState("all");
 const [filterSubject, setFilterSubject] = useState("all");
 const [filterTestType, setFilterTestType] = useState("all");
  const fetcher = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return getStudentResults(user.id);
  };

  const { data: results = [], isLoading: loading } = useSWR('studentResults', fetcher);

 const filteredResults = results.filter(result => {
 const examTitle = result.exam?.title || "";
 // @ts-ignore - subject property might be missing in type but present in data or legacy
 const examSubject = (result.exam as any)?.subject || "";
 const examType = result.exam?.type || "";
 const score = result.total_score || 0;
 const maxScore = result.exam?.max_score || 100;
 const percentage = (score / maxScore) * 100;

 // Search filter
 const matchesSearch = examTitle.toLowerCase().includes(searchQuery.toLowerCase());

 // Subject filter
 const matchesSubject = filterSubject === "all" || examSubject === filterSubject;

 // Test type filter
 const matchesTestType = filterTestType === "all" || examType === filterTestType;

 // Status filter
 const matchesStatus =
 filterStatus === "all" ||
 (filterStatus === "passed" && percentage >= 60) ||
 (filterStatus === "failed" && percentage < 60);

 return matchesSearch && matchesSubject && matchesTestType && matchesStatus;
 });

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
              {t('results.subtitle')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('results.title')}
            </h1>
          </div>

          <div className="flex flex-col xl:flex-row gap-3">
            {/* Minimalist Search */}
            <div className="flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-[20px] border border-gray-200/50 dark:border-slate-800/50 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all flex-1">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Imtihon nomini qidiring..."
                className="bg-transparent border-none focus:ring-0 text-[14px] w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 py-1.5 px-1 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <div className="relative min-w-[140px]">
                <select
                  className="w-full appearance-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-[18px] pl-4 pr-10 py-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer shadow-sm transition-all h-full"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <option value="all">Barcha fanlar</option>
                  <option value="matematika">Matematika</option>
                  <option value="ingliz_tili">Ingliz tili</option>
                  <option value="ona_tili">Ona tili</option>
                  <option value="tarix">Tarix</option>
                  <option value="biologiya">Biologiya</option>
                  <option value="fizika">Fizika</option>
                  <option value="kimyo">Kimyo</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px]">
                <select
                  className="w-full appearance-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-[18px] pl-4 pr-10 py-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer shadow-sm transition-all h-full"
                  value={filterTestType}
                  onChange={(e) => setFilterTestType(e.target.value)}
                >
                  <option value="all">Barcha turlar</option>
                  <option value="dtm">DTM</option>
                  <option value="quiz">Quiz</option>
                  <option value="topic">Mavzu</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px]">
                <select
                  className="w-full appearance-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-[18px] pl-4 pr-10 py-3 text-[13px] font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer shadow-sm transition-all h-full"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Barcha holatlar</option>
                  <option value="passed">O'tgan</option>
                  <option value="failed">O'tmagan</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── RESULTS LIST ── */}
        <div className="flex flex-col gap-4 mt-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <ResultRowSkeleton key={i} />)}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 p-12 flex flex-col items-center gap-4 text-center mt-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText size={28} className="text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{t('dashboard.no_results')}</p>
            </div>
          ) : (
            filteredResults.map((result) => {
              const examDate = new Date(result.created_at).toLocaleDateString('uz-UZ', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
              const examType = result.exam?.type || 'quiz';
              const isDTM = examType === 'dtm';
              const maxScore = isDTM ? 189.0 : (result.exam?.max_score || 100);

              return (
                <div key={result.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Left Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            <Clock size={14} />
                            {examDate}
                          </div>
                          {isDTM && (
                            <span className="px-2.5 py-0.5 bg-brand-orange/10 text-brand-orange rounded-md text-[10px] font-bold uppercase tracking-wider">
                              DTM 2025
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {result.exam?.title || 'Unknown Exam'}
                        </h3>

                        {isDTM && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Compulsory Subjects Total */}
                            <div className="px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 rounded-xl text-[12px] font-medium border border-gray-100 dark:border-slate-700 flex items-center gap-1.5 shadow-sm">
                              <BookOpen size={14} className="text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Majburiy:</span>
                              <span className="text-slate-800 dark:text-slate-100 font-bold">
                                {((result.compulsory_math_score || 0) + (result.compulsory_history_score || 0) + (result.compulsory_lang_score || 0)).toFixed(1)}
                              </span>
                            </div>
                            
                            {/* Subject 1 */}
                            {result.subject_1_score !== undefined && result.subject_1_score !== null && (
                              <div className="px-3 py-1.5 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl text-[12px] font-medium border border-blue-100 dark:border-blue-800/50 flex items-center gap-1.5 shadow-sm">
                                <GraduationCap size={14} className="text-brand-blue" />
                                <span className="text-slate-500 dark:text-slate-400">Fan 1:</span>
                                <span className="text-brand-blue font-bold">{result.subject_1_score.toFixed(1)}</span>
                              </div>
                            )}
                            
                            {/* Subject 2 */}
                            {result.subject_2_score !== undefined && result.subject_2_score !== null && (
                              <div className="px-3 py-1.5 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl text-[12px] font-medium border border-blue-100 dark:border-blue-800/50 flex items-center gap-1.5 shadow-sm">
                                <GraduationCap size={14} className="text-brand-blue" />
                                <span className="text-slate-500 dark:text-slate-400">Fan 2:</span>
                                <span className="text-brand-blue font-bold">{result.subject_2_score.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Direction Info */}
                        {result.direction && (
                          <div className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                            {result.direction.title} ({result.direction.code})
                          </div>
                        )}
                      </div>

                      {/* Right Score & Actions */}
                      <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-none">
                            {result.total_score.toFixed(1)}
                          </span>
                          <span className="text-[16px] text-slate-400 font-medium">
                            / {maxScore}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/results/${result.id}`}
                            className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[14px] text-[13px] font-bold transition-colors border border-gray-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-2"
                          >
                            <Eye size={16} />
                            Ko'rish
                          </Link>
                          <Link
                            href={`/dashboard/results/${result.id}`}
                            className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-[14px] text-[13px] font-bold transition-colors flex items-center gap-2"
                          >
                            Tahlil
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (Integrated sleekly at the bottom) */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50">
                    <div
                      className="h-full bg-brand-blue rounded-r-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, (result.total_score / maxScore) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
