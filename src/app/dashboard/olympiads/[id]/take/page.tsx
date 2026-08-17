"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Award,
  Send,
  Flag,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Sparkles
} from "lucide-react";
import {
  AdminTournament,
  TournamentQuestion,
  getTournamentById,
  submitTournamentAttempt,
  TournamentLeaderboardEntry,
  SAMPLE_MATH_QUESTIONS
} from "@/lib/tournaments";
import MathRenderer from "@/components/MathRenderer";
import { useCurrentUser } from "@/hooks/useDashboardData";
import { useLanguage } from "@/context/LanguageContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentRunnerPage({ params }: PageProps) {
  const { id: tournamentId } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();

  const [tournament, setTournament] = useState<AdminTournament | null>(null);
  const [questions, setQuestions] = useState<TournamentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [finalResult, setFinalResult] = useState<TournamentLeaderboardEntry | null>(null);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    setLoading(true);
    try {
      const data = await getTournamentById(tournamentId);
      if (!data) {
        toast.error("Musobaqa topilmadi");
        router.push("/dashboard/olympiads");
        return;
      }
      setTournament(data);
      const qList = data.questions && data.questions.length > 0 ? data.questions : SAMPLE_MATH_QUESTIONS;
      setQuestions(qList);

      const durationSeconds = (data.durationMinutes || 60) * 60;
      setTimeRemaining(durationSeconds);
      startTimeRef.current = Date.now();
    } catch (e) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (loading || submitting || finalResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, finalResult]);

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey
    }));
  };

  const handleAutoSubmit = async () => {
    toast("Vaqt tugadi! Natijangiz hisoblanmoqda...", { icon: "⏰" });
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (submitting || !tournament) return;
    setSubmitting(true);

    try {
      const timeSpent = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
      const res = await submitTournamentAttempt({
        tournamentId: tournament.id,
        userId: user?.id || `anon_${Date.now()}`,
        studentName: user?.user_metadata?.full_name || "O'quvchi",
        studentAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.full_name || 'Student'}`,
        answers,
        timeSpentSeconds: timeSpent
      });

      if (res.success) {
        setFinalResult(res.result);
        setShowFinishConfirm(false);
      }
    } catch (e) {
      toast.error("Natijani yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Musobaqa yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen text-slate-800 dark:text-white font-sans pb-20 select-none">
      
      {/* ── TOP STICKY BAR ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all"
              title="Musobaqadan chiqish"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                {tournament?.subject || "Musobaqa"}
              </span>
              <h2 className="text-sm sm:text-base font-black font-fredoka text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {tournament?.title}
              </h2>
            </div>
          </div>

          {/* Right Timer & Submit */}
          <div className="flex items-center gap-3">
            {/* Live CountDown Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-mono font-bold text-xs sm:text-sm border transition-all ${
                timeRemaining < 300
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              }`}
            >
              <Clock size={16} className={timeRemaining < 300 ? "text-rose-500" : "text-brand-blue"} />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setShowFinishConfirm(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Yakunlash
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN RUNNER CONTAINER ── */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Progress Bar & Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Savol {currentIndex + 1} / {questions.length}</span>
            <span>Javob berildi: {answeredCount} ta</span>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-blue to-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── QUESTION CARD ── */}
        {currentQ && (
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-slate-800/80 shadow-none space-y-6">
            
            {/* Question Header & Points */}
            <div className="flex items-center justify-between gap-3">
              <span className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center text-sm">
                #{currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
                {currentQ.points || 3.1} ball
              </span>
            </div>

            {/* Question Image (if any) */}
            {currentQ.image_url && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-72 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <img
                  src={currentQ.image_url}
                  alt={`Savol ${currentIndex + 1}`}
                  className="max-h-72 object-contain"
                />
              </div>
            )}

            {/* Question Text with KaTeX */}
            <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
              <MathRenderer content={currentQ.question_text} />
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {(["A", "B", "C", "D"] as const).map((key) => {
                const optText = currentQ.options[key];
                if (!optText && optText !== "") return null;
                const isSelected = answers[currentQ.id] === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectAnswer(key)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all active:scale-[0.99] ${
                      isSelected
                        ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20 ring-2 ring-brand-blue/30"
                        : "bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 transition-all ${
                        isSelected
                          ? "bg-white text-brand-blue"
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {key}
                    </span>

                    <div className="flex-1 font-medium text-sm sm:text-base">
                      <MathRenderer content={optText} />
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* ── QUESTION NAVIGATION GRID & CONTROLS ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 space-y-4">
          
          {/* Circular Question Bubbles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 flex items-center justify-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-brand-blue ring-offset-2 dark:ring-offset-slate-900 bg-brand-blue text-white shadow-sm"
                      : isAnswered
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Prev / Next Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 active:scale-95 transition-all"
            >
              <ChevronLeft size={16} />
              <span>Oldingi</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-blue text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-blue-600 active:scale-95 transition-all"
              >
                <span>Keyingi</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowFinishConfirm(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <span>Musobaqani Yakunlash</span>
                <Send size={14} />
              </button>
            )}
          </div>

        </div>

      </main>

      {/* ── EXIT CONFIRM MODAL ── */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-white/80 dark:border-slate-800 max-w-sm w-full space-y-4 shadow-xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-black font-fredoka text-lg text-slate-900 dark:text-white">
                Musobaqadan chiqmoqchimisiz?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Chiqsangiz vaqt hisoblash davom etadi. Xohlagan paytingizda qaytib kelib davom ettirishingiz mumkin.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  Davom etish
                </button>
                <button
                  onClick={() => router.push("/dashboard/olympiads")}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
                >
                  Chiqish
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FINISH CONFIRM MODAL ── */}
      <AnimatePresence>
        {showFinishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-white/80 dark:border-slate-800 max-w-sm w-full space-y-4 shadow-xl text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Trophy size={24} />
              </div>
              <h3 className="font-black font-fredoka text-lg text-slate-900 dark:text-white">
                Musobaqani yakunlaysizmi?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Siz <strong>{questions.length}</strong> ta savoldan <strong>{answeredCount}</strong> tasiga javob berdingiz. Natijangiz hisoblanib, reytingga qo'shiladi.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? "Saqlanmoqda..." : "Ha, Yakunlash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FINAL CELEBRATION & RESULT MODAL ── */}
      <AnimatePresence>
        {finalResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-slate-800 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-md">
                <Trophy size={36} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                  Musobaqa Yakunlandi! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {tournament?.title}
                </p>
              </div>

              {/* Score breakdown metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">To'plangan Ball</p>
                  <p className="text-lg font-black text-brand-blue mt-0.5">
                    {finalResult.score} / {finalResult.max_score}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Natija</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {finalResult.percentage}%
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Reyting O'rni</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    #{finalResult.rank}
                  </p>
                </div>
              </div>

              {finalResult.prize && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  🎁 Sizning yutug'ingiz: {finalResult.prize}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() =>
                  router.push(`/dashboard/olympiads?tab=leaderboard&id=${tournament?.id}`)
                }
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
              >
                <Award size={18} />
                <span>Reyting va Natijalar Jadvaliga O'tish</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
