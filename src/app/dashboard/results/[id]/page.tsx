"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getExamResultById, type ExamResult } from "@/lib/supabase-queries";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Trophy,
  GraduationCap,
  BookOpen,
  Calendar,
  Calculator,
  Book,
  Globe
} from "lucide-react";

export default function ResultDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();

  const fetcher = async (id: string) => {
    return await getExamResultById(id);
  };

  const { data: result = null, isLoading: loading } = useSWR(
    params.id ? `result-${params.id}` : null,
    () => fetcher(params.id as string)
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse pt-4">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl mb-8"></div>
        <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]"></div>
          <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Natija topilmadi</h2>
        <button
          onClick={() => router.push('/dashboard/results')}
          className="text-brand-blue hover:underline mt-4 inline-block"
        >
          Natijalar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  const examDate = new Date(result.created_at).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isDTM = result.exam?.type === 'dtm';
  const maxScore = isDTM ? 189.0 : (result.exam?.max_score || 100);
  const percentage = Math.min(100, Math.max(0, (result.total_score / maxScore) * 100));

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto pt-4 sm:pt-6 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/results')}
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors font-medium bg-white/60 dark:bg-slate-900/60 px-4 py-2.5 rounded-2xl backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>{t('common.back') || "Ortga"}</span>
        </button>

        {/* Main Header Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white/60 dark:border-slate-700/50 shadow-lg relative overflow-hidden">
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  {isDTM ? 'DTM 2025' : (result.exam?.type || 'Quiz')}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm">
                  <Calendar size={14} />
                  {examDate}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
                {result.exam?.title || 'Imtihon natijasi'}
              </h1>

              {result.direction && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium border border-indigo-100 dark:border-indigo-800/30">
                  <GraduationCap size={18} />
                  {result.direction.title} ({result.direction.code})
                </div>
              )}
            </div>

            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700 min-w-[200px]">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Umumiy Ball</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black font-fredoka text-slate-800 dark:text-white leading-none">
                  {result.total_score.toFixed(1)}
                </span>
              </div>
              <div className="text-slate-400 text-sm font-medium mt-1">
                / {maxScore} balldan
              </div>
              
              <div className="w-full mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className={`mt-2 text-sm font-bold ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                {percentage.toFixed(1)}% o'zlashtirish
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        {isDTM ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-fredoka text-slate-800 dark:text-slate-100 ml-2">
              Fanlar kesimida tahlil
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Compulsory Block */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-brand-blue group-hover:bg-brand-blue/10 transition-all duration-300">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Majburiy fanlar</h3>
                    <p className="text-xs font-medium text-slate-500">Maksimal 31.5 ball</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Calculator size={16} className="text-indigo-500" />
                      Matematika
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{result.compulsory_math_score?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Globe size={16} className="text-orange-500" />
                      Tarix
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{result.compulsory_history_score?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Book size={16} className="text-green-500" />
                      Ona tili
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{result.compulsory_lang_score?.toFixed(1) || '0.0'}</span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center px-1">
                    <span className="text-sm font-bold text-slate-500">Jami (Majburiy)</span>
                    <span className="text-lg font-black text-brand-blue">
                      {((result.compulsory_math_score || 0) + (result.compulsory_history_score || 0) + (result.compulsory_lang_score || 0)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject 1 */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-brand-blue group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mutaxassislik fan 1</h3>
                    <p className="text-xs font-medium text-slate-500">Maksimal 93.0 ball</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center h-[180px] bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <span className="text-6xl font-black font-fredoka text-brand-blue drop-shadow-sm">
                    {result.subject_1_score?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-slate-400 font-medium mt-2">ball to'plandi</span>
                </div>
              </div>

              {/* Subject 2 */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mutaxassislik fan 2</h3>
                    <p className="text-xs font-medium text-slate-500">Maksimal 64.5 ball</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center h-[180px] bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <span className="text-6xl font-black font-fredoka text-purple-500 drop-shadow-sm">
                    {result.subject_2_score?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-slate-400 font-medium mt-2">ball to'plandi</span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm text-center">
            <GraduationCap className="w-16 h-16 text-brand-blue mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2">Qo'shimcha ma'lumot</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Ushbu test turi (DTM emas) bo'yicha batafsil fanlar tahlili biriktirilmagan. Umumiy balingiz orqali natijani baholashingiz mumkin.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
