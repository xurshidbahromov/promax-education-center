"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  Save,
  Send,
  Trophy,
  Globe,
  BookOpen,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  FileText,
  RotateCcw,
  ListChecks,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
 getTestById,
 startTestAttempt,
 submitAnswer,
 completeTestAttempt,
 getActiveAttempt,
 getAttemptResponses,
 type Test,
 type Question
} from "@/lib/tests";
import {
  getTournamentById,
  submitTournamentAttempt,
  getUserCompletedTournamentIds,
  type TournamentQuestion
} from "@/lib/tournaments";
import {
  getInternationalTournamentById,
  submitInternationalAttempt,
  getUserCompletedInternationalTournamentIds,
  type InternationalQuestion
} from "@/lib/international-tournaments";
import MathRenderer from "@/components/MathRenderer";
import { TakeTestSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function TakeTestPage() {
 const params = useParams();
 const router = useRouter();
 const searchParams = useSearchParams();
 const { t } = useLanguage();
 const testId = params.id as string;
 const isOlympiadParam = searchParams?.get("type") === "olympiad";
 const isInternationalParam = searchParams?.get("type") === "international";

 const [test, setTest] = useState<any>(null);
 const [isOlympiad, setIsOlympiad] = useState<boolean>(isOlympiadParam);
 const [isInternational, setIsInternational] = useState<boolean>(isInternationalParam);
 const [tournamentData, setTournamentData] = useState<any>(null);
 const [questions, setQuestions] = useState<Question[]>([]);
 const [attemptId, setAttemptId] = useState<string | null>(null);
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const [answers, setAnswers] = useState<Record<string, string>>({});
 const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
 const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [autoSaving, setAutoSaving] = useState(false);
 const [showConfirmModal, setShowConfirmModal] = useState(false);
 const [showFormulaModal, setShowFormulaModal] = useState(false);
 const [zoomedImage, setZoomedImage] = useState<string | null>(null);
 const [zoomScale, setZoomScale] = useState<number>(1);

 // Minimalist Checking Animation & Detailed Results state
 const [isCheckingResults, setIsCheckingResults] = useState(false);
 const [checkingStep, setCheckingStep] = useState(1);
 const [checkingProgress, setCheckingProgress] = useState(0);
 const [showDetailedResults, setShowDetailedResults] = useState(false);
 const [isPracticeMode, setIsPracticeMode] = useState(false);
 const [resultsFilter, setResultsFilter] = useState<"all" | "correct" | "wrong">("all");
 const [calculatedSummary, setCalculatedSummary] = useState<{
   totalScore: number;
   maxScore: number;
   percentage: number;
   timeSpent: number;
   correctCount: number;
   wrongCount: number;
   unansweredCount: number;
   scaledScore?: string;
 } | null>(null);

 const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
 const questionStartTime = useRef<number>(Date.now());

 // Close image zoom modal with Escape key
 useEffect(() => {
   const handleKeyDown = (e: KeyboardEvent) => {
     if (e.key === "Escape" && zoomedImage) {
       setZoomedImage(null);
       setZoomScale(1);
     }
   };
   window.addEventListener("keydown", handleKeyDown);
   return () => window.removeEventListener("keydown", handleKeyDown);
 }, [zoomedImage]);

 // Load test and start attempt
 useEffect(() => {
   async function loadTestAndStart() {
     try {
       const supabase = createClient();

       // 1. Check if it's an International Competition (SAT, AMC, IELTS, etc.)
       if (isInternationalParam || testId.startsWith("sat-") || testId.startsWith("amc-") || testId.startsWith("ielts-") || testId.startsWith("intl-")) {
         setIsInternational(true);
         const currentUser = (await supabase.auth.getUser()).data.user;
         const completedIntl = await getUserCompletedInternationalTournamentIds(currentUser?.id);
         const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
         if (completedIntl.includes(testId) && !isPractice) {
           toast.success("Siz ushbu xalqaro musobaqani allaqachon topshirgansiz! Natijangiz saqlangan.");
           router.replace(`/dashboard/international?tab=leaderboard&id=${testId}`);
           return;
         }

         const intlData = await getInternationalTournamentById(testId);
         if (intlData) {
           setTournamentData(intlData);
           setTest({
             id: intlData.id,
             title: intlData.title,
             duration_minutes: intlData.durationMinutes || 70,
             subject: intlData.subject
           });
           const rawQs = intlData.questions && intlData.questions.length > 0 ? intlData.questions : [];
           const formattedQs: Question[] = rawQs.map((q: any, idx: number) => ({
             id: q.id || `intl_q_${idx}`,
             test_id: testId,
             question_text: q.question_text,
             question_type: (q.question_type || "multiple_choice") as any,
             options: q.options || { A: "", B: "", C: "", D: "" },
             correct_answer: q.correct_answer || "",
             explanation: q.explanation || "",
             points: q.points || 10,
             image_url: q.image_url || null,
             order_index: idx
           }));
           setQuestions(formattedQs);
           setAttemptId(`attempt_intl_${testId}`);
           setTimeRemaining((intlData.durationMinutes || 70) * 60);
           setLoading(false);
           return;
         }
       }

       // 2. Check if it's an Olympiad / Tournament
       if (isOlympiadParam || testId.startsWith("tournament_") || testId.startsWith("olympiad_") || testId.startsWith("grand_") || testId.startsWith("t_")) {
         setIsOlympiad(true);
         const currentUser = (await supabase.auth.getUser()).data.user;
         const completedOlympiads = await getUserCompletedTournamentIds(currentUser?.id);
         const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
         if (completedOlympiads.includes(testId) && !isPractice) {
           toast.success("Siz ushbu musobaqani allaqachon topshirgansiz! Natijangiz saqlangan.");
           router.replace(`/dashboard/olympiads?tab=leaderboard&id=${testId}`);
           return;
         }

         const tData = await getTournamentById(testId);
         if (tData) {
           setTournamentData(tData);
           setTest({
             id: tData.id,
             title: tData.title,
             duration_minutes: tData.durationMinutes || 60,
             subject: tData.subject
           });
           const rawQs = tData.questions && tData.questions.length > 0 ? tData.questions : [];
           const formattedQs: Question[] = rawQs.map((q: any, idx: number) => ({
             id: q.id || `q_${idx}`,
             test_id: testId,
             question_text: q.question_text,
             question_type: (q.question_type || "multiple_choice") as any,
             options: q.options || { A: "", B: "", C: "", D: "" },
             correct_answer: q.correct_answer || "A",
             explanation: q.explanation || "",
             points: q.points || 3.1,
             image_url: q.image_url || null,
             order_index: idx
           }));
           setQuestions(formattedQs);
           setAttemptId(`attempt_olympiad_${testId}`);
           setTimeRemaining((tData.durationMinutes || 60) * 60);
           setLoading(false);
           return;
         }
       }

   // Standard test DB lookup
   const testData = await getTestById(testId);
   if (!testData) {
     // Fallback check if testId is in tournaments
     const tData = await getTournamentById(testId);
     if (tData) {
       setIsOlympiad(true);
       setTournamentData(tData);
       setTest({
         id: tData.id,
         title: tData.title,
         duration_minutes: tData.durationMinutes || 60,
         subject: tData.subject
       });
       const rawQs = tData.questions && tData.questions.length > 0 ? tData.questions : [];
       const formattedQs: Question[] = rawQs.map((q: any, idx: number) => ({
         id: q.id || `q_${idx}`,
         test_id: testId,
         question_text: q.question_text,
         question_type: (q.question_type || "multiple_choice") as any,
         options: q.options || { A: "", B: "", C: "", D: "" },
         correct_answer: q.correct_answer || "A",
         explanation: q.explanation || "",
         points: q.points || 3.1,
         image_url: q.image_url || null,
         order_index: idx
       }));
       setQuestions(formattedQs);
       setAttemptId(`attempt_olympiad_${testId}`);
       setTimeRemaining((tData.durationMinutes || 60) * 60);
       setLoading(false);
       return;
     }

     router.push('/dashboard/tests');
     return;
   }
   setTest(testData);

   // Get questions
   const { data: questionsData } = await supabase
   .from('questions')
   .select('*')
   .eq('test_id', testId)
   .order('order_index', { ascending: true });

   setQuestions(questionsData || []);

   // Check for active attempt or create new one
   const activeAttempt = await getActiveAttempt(testId);
   if (activeAttempt) {
   setAttemptId(activeAttempt.id);
   // Load saved responses
   const savedResponses = await getAttemptResponses(activeAttempt.id);
   const savedAnswers: Record<string, string> = {};
   savedResponses.forEach(r => {
   if (r.student_answer) {
   savedAnswers[r.question_id] = r.student_answer;
   }
   });
   setAnswers(savedAnswers);

   // Calculate remaining time if timed test
   if (testData.duration_minutes) {
   const elapsed = Math.floor(
   (Date.now() - new Date(activeAttempt.started_at).getTime()) / 1000
   );
   const remaining = (testData.duration_minutes * 60) - elapsed;
   setTimeRemaining(Math.max(0, remaining));
   }
   } else {
   // Start new attempt
   const attemptData = await startTestAttempt(testId);
   if (!attemptData) {
   alert(t('tests.take.error.start'));
   router.push('/dashboard/tests');
   return;
   }
   setAttemptId(attemptData.id);

   // Set initial time
   if (testData.duration_minutes) {
   setTimeRemaining(testData.duration_minutes * 60);
   }
   }
 } catch (error) {
   console.error("Error loading test:", error);
 } finally {
   setLoading(false);
 }
 }

 loadTestAndStart();
 }, [testId, router, isOlympiadParam]);

 // Timer countdown
 useEffect(() => {
 if (timeRemaining === null || timeRemaining <= 0) return;

 const interval = setInterval(() => {
 setTimeRemaining(prev => {
 if (prev === null || prev <= 0) {
 handleAutoSubmit();
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(interval);
 }, [timeRemaining]);

 // Auto-save answers
 useEffect(() => {
 if (!attemptId || submitting) return;

 autoSaveInterval.current = setInterval(() => {
 saveAnswers();
 }, 5000); // Save every 5 seconds

 return () => {
 if (autoSaveInterval.current) {
 clearInterval(autoSaveInterval.current);
 }
 };
 }, [attemptId, answers, submitting]);

 const saveAnswers = useCallback(async () => {
  if (!attemptId || Object.keys(answers).length === 0) return;

  setAutoSaving(true);
  try {
    if (isOlympiad) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`promax_answers_${testId}`, JSON.stringify(answers));
      }
    } else {
      for (const [questionId, answer] of Object.entries(answers)) {
        await submitAnswer(attemptId, questionId, answer);
      }
    }
  } catch (error) {
    console.error("Error auto-saving:", error);
  } finally {
    setAutoSaving(false);
  }
  }, [attemptId, answers, isOlympiad, testId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
  setAnswers(prev => ({
  ...prev,
  [questionId]: answer
  }));
  };

  const handleMarkForReview = (questionId: string) => {
  setMarkedForReview(prev => {
  const newSet = new Set(prev);
  if (newSet.has(questionId)) {
  newSet.delete(questionId);
  } else {
  newSet.add(questionId);
  }
  return newSet;
  });
  };

  const runEvaluationAndShowResults = async (timeSpent: number) => {
    setSubmitting(true);
    setIsCheckingResults(true);
    setCheckingStep(1);
    setCheckingProgress(25);

    try {
      await saveAnswers();
    } catch (e) {}

    // 1. Calculate scores and counts
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const pts = q.points || (isInternational ? 10 : 3.1);
      maxScore += pts;
      const studentAns = (answers[q.id] || "").trim().toLowerCase();
      const correctAns = (q.correct_answer || "").trim().toLowerCase();

      if (!studentAns) {
        unansweredCount++;
      } else if (studentAns === correctAns || (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns)) {
        totalScore += pts;
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    let scaledScoreStr: string | undefined = undefined;
    if (isInternational && testId.startsWith("sat-")) {
      scaledScoreStr = `${Math.min(1600, Math.max(400, Math.round(400 + (percentage / 100) * 1200)))} / 1600`;
    }

    setCalculatedSummary({
      totalScore: Number(totalScore.toFixed(1)),
      maxScore: Number(maxScore.toFixed(1)),
      percentage,
      timeSpent: Math.max(1, timeSpent),
      correctCount,
      wrongCount,
      unansweredCount,
      scaledScore: scaledScoreStr
    });

    // 2. Submit to backend in background (only for official attempts, not practice mode)
    if (!isPracticeMode) {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', userData?.user?.id)
          .maybeSingle();

        const studentName = profileData?.full_name || userData?.user?.user_metadata?.full_name || "O'quvchi";
        const studentAvatar = profileData?.avatar_url || userData?.user?.user_metadata?.avatar_url || null;

        if (isInternational) {
          await submitInternationalAttempt(
            testId,
            userData?.user?.id || `anon_${Date.now()}`,
            studentName,
            studentAvatar,
            totalScore,
            maxScore || (questions.length * 10),
            timeSpent
          );
        } else if (isOlympiad) {
          await submitTournamentAttempt({
            tournamentId: testId,
            userId: userData?.user?.id || `anon_${Date.now()}`,
            studentName,
            studentAvatar,
            answers,
            timeSpentSeconds: timeSpent
          });
        } else {
          await completeTestAttempt(attemptId || `attempt_${testId}`, timeSpent);
        }
      } catch (error) {
        console.error("Backend submission error:", error);
      }
    }

    // Smooth, polished transition (1200ms)
    await new Promise((r) => setTimeout(r, 1200));
    setIsCheckingResults(false);
    setShowDetailedResults(true);
    setSubmitting(false);
  };

  const handleAutoSubmit = async () => {
    if (!attemptId || submitting || isCheckingResults || showDetailedResults) return;
    toast("Vaqt tugadi! Natijalar tekshirilmoqda...", { icon: "⏱️" });
    const timeSpent = test?.duration_minutes ? test.duration_minutes * 60 : 0;
    await runEvaluationAndShowResults(timeSpent);
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId) return;
    setShowConfirmModal(false);
    const timeSpent = test?.duration_minutes ? (test.duration_minutes * 60 - (timeRemaining || 0)) : 0;
    await runEvaluationAndShowResults(timeSpent);
  };

  const handlePracticeRetake = () => {
    setIsPracticeMode(true);
    setAnswers({});
    setMarkedForReview(new Set());
    setCurrentQuestionIndex(0);
    setShowDetailedResults(false);
    setCalculatedSummary(null);
    setTimeRemaining(test?.duration_minutes ? test.duration_minutes * 60 : null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.success("Mashq rejimi boshlandi! O'zingizni sinab ko'ring.", { icon: "🎯" });
  };


  const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
  if (!timeRemaining || !test?.duration_minutes) return "text-gray-700 dark:text-gray-300";
  const totalSeconds = test.duration_minutes * 60;
  const percentage = (timeRemaining / totalSeconds) * 100;

  if (percentage <= 10) return "text-red-600 dark:text-red-400 animate-pulse";
  if (percentage <= 25) return "text-orange-600 dark:text-orange-400";
  return "text-gray-700 dark:text-gray-300";
  };

  if (loading) {
  return <TakeTestSkeleton />;
  }

  if (!test || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-2">{t('tests.take.error.title')}</h2>
        <Link href={isInternational ? "/dashboard/international" : isOlympiad ? "/dashboard/olympiads" : "/dashboard/tests"} className="text-brand-blue active:underline font-bold">
          {isInternational ? "Xalqaro musobaqalarga qaytish" : isOlympiad ? "Musobaqalarga qaytish" : t('tests.take.back_to_list')}
        </Link>
      </div>
    );
  }

  const renderDetailedResults = () => {
    if (!calculatedSummary) return null;

    const isExcellent = calculatedSummary.percentage >= 80;
    const isGood = calculatedSummary.percentage >= 60 && calculatedSummary.percentage < 80;

    const filteredQuestions = questions.filter((q) => {
      const studentAns = (answers[q.id] || "").trim().toLowerCase();
      const correctAns = (q.correct_answer || "").trim().toLowerCase();
      const isCorrect = studentAns && (studentAns === correctAns || (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns));
      
      if (resultsFilter === "correct") return isCorrect;
      if (resultsFilter === "wrong") return !isCorrect;
      return true;
    });

    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (calculatedSummary.percentage / 100) * circumference;

    return (
      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/tests')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer group self-start"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span className="truncate">{isInternational ? "Xalqaro musobaqalarga qaytish" : isOlympiad ? "Musobaqalarga qaytish" : "Testlar ro'yxatiga qaytish"}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePracticeRetake}
              className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={14} className="shrink-0" />
              <span>Qayta yechish</span>
            </button>
            <button
              type="button"
              onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/results')}
              className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <Trophy size={14} className="shrink-0" />
              <span>Reyting</span>
            </button>
          </div>
        </div>

        {/* Hero Performance Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] border border-slate-200/70 dark:border-slate-800/80 p-5 sm:p-8 lg:p-12 shadow-sm relative overflow-hidden">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1 space-y-2.5 sm:space-y-3.5 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isInternational ? (tournamentData?.categoryLabel || "Xalqaro Musobaqa") : isOlympiad ? (tournamentData?.subject || "Olimpiada") : "Test"}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                  isExcellent
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : isGood
                    ? "bg-blue-500/10 text-brand-blue border border-blue-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}>
                  {isExcellent ? "A'lo natija 🔥" : isGood ? "Yaxshi natija 👏" : "Mashq qilish kerak 💪"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                {test.title}
              </h1>

              <div className="flex items-baseline justify-center md:justify-start gap-2 pt-0.5 sm:pt-1">
                <span className="font-fredoka text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {calculatedSummary.totalScore}
                </span>
                <span className="text-base sm:text-xl lg:text-2xl font-bold text-slate-400 dark:text-slate-500">
                  / {calculatedSummary.maxScore} ball
                </span>
              </div>

              {calculatedSummary.scaledScore && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Digital SAT balli:</span>
                  <span className="font-black text-slate-900 dark:text-white">{calculatedSummary.scaledScore}</span>
                </div>
              )}
            </div>

            {/* Circular Percentage Dial */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
                <svg className="w-28 h-28 sm:w-36 sm:h-36 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-100 dark:text-slate-800"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={isExcellent ? "text-emerald-500" : isGood ? "text-brand-blue" : "text-amber-500"}
                    fill="none"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-fredoka text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-none">
                    {calculatedSummary.percentage}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">
                    Natija
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats 4-Column Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">To'g'ri</span>
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculatedSummary.correctCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Noto'g'ri</span>
                <XCircle size={14} className="text-rose-500 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                {calculatedSummary.wrongCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">O'tkazilgan</span>
                <HelpCircle size={14} className="text-slate-400 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300">
                {calculatedSummary.unansweredCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Vaqt</span>
                <Clock size={14} className="text-brand-blue shrink-0" />
              </div>
              <span className="font-fredoka text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
                {formatTime(calculatedSummary.timeSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Strip & Fast Jump */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[20px] sm:rounded-[28px] border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListChecks size={18} className="text-brand-blue shrink-0" />
              <span>Savollar tahlili</span>
            </h2>

            {/* Responsive Filter Segmented Control */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setResultsFilter("all")}
                className={`px-2 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "all"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Barchasi ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter("correct")}
                className={`px-2 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "correct"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                To'g'ri ({calculatedSummary.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter("wrong")}
                className={`px-2 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "wrong"
                    ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                }`}
              >
                Xatolar ({calculatedSummary.wrongCount + calculatedSummary.unansweredCount})
              </button>
            </div>
          </div>

          {/* Jump To Question Numbers */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {questions.map((q, idx) => {
              const studentAns = (answers[q.id] || "").trim().toLowerCase();
              const correctAns = (q.correct_answer || "").trim().toLowerCase();
              const isCorrect = studentAns && (studentAns === correctAns || (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns));
              const isUnanswered = !studentAns;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`review-q-${q.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${
                    isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                      : isUnanswered
                      ? "bg-slate-50 dark:bg-slate-800/60 text-slate-400 border border-slate-200/80 dark:border-slate-700/60"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60"
                  }`}
                  title={`Savol #${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredQuestions.map((q) => {
            const studentAns = (answers[q.id] || "").trim().toLowerCase();
            const correctAns = (q.correct_answer || "").trim().toLowerCase();
            const isCorrect = studentAns && (studentAns === correctAns || (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns));
            const isUnanswered = !studentAns;
            const isWrong = !isCorrect && !isUnanswered;
            const qPoints = q.points || (isInternational ? 10 : 3.1);
            const originalIndex = questions.findIndex(item => item.id === q.id);

            return (
              <div
                key={q.id}
                id={`review-q-${q.id}`}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[20px] sm:rounded-[28px] border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-7 lg:p-9 space-y-4 sm:space-y-5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shadow-xs">
                      #{originalIndex + 1}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-500">
                      {qPoints} ball
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={13} />
                        <span>To'g'ri</span>
                      </span>
                    )}
                    {isWrong && (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle size={13} />
                        <span>Noto'g'ri</span>
                      </span>
                    )}
                    {isUnanswered && (
                      <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <span>Javobsiz</span>
                      </span>
                    )}

                    {q.image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setZoomedImage(q.image_url);
                          setZoomScale(1);
                        }}
                        className="p-1.5 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Rasmni kattalashtirish"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Image (if any) */}
                {q.image_url && (
                  <div className="pt-1">
                    <div
                      onClick={() => {
                        setZoomedImage(q.image_url);
                        setZoomScale(1);
                      }}
                      className="w-full flex items-center justify-center cursor-zoom-in bg-slate-50 dark:bg-slate-950/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800"
                    >
                      <img
                        src={q.image_url}
                        alt={`Savol #${originalIndex + 1}`}
                        className="w-auto max-w-full max-h-[300px] sm:max-h-[460px] rounded-lg sm:rounded-xl object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div className="text-[15px] sm:text-[17px] font-medium text-slate-900 dark:text-slate-100 leading-relaxed overflow-x-auto">
                  <MathRenderer content={q.question_text} />
                </div>

                {/* Options Review */}
                {q.options && typeof q.options === "object" && (
                  <div className="space-y-2 sm:space-y-2.5 pt-1">
                    {Object.entries(q.options).map(([optKey, optVal]) => {
                      const isUserChoice = (answers[q.id] || "").toLowerCase() === optKey.toLowerCase();
                      const isAnswerCorrectKey = (q.correct_answer || "").toLowerCase() === optKey.toLowerCase();

                      let containerStyle = "border-slate-200/70 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300";
                      let badge = null;

                      if (isUserChoice && isAnswerCorrectKey) {
                        containerStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-xs";
                        badge = (
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={13} />
                            <span>Sizning javobingiz</span>
                          </span>
                        );
                      } else if (isUserChoice && !isAnswerCorrectKey) {
                        containerStyle = "border-rose-400/80 dark:border-rose-600/80 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs";
                        badge = (
                          <span className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0">
                            <XCircle size={13} />
                            <span>Sizning javobingiz</span>
                          </span>
                        );
                      } else if (!isUserChoice && isAnswerCorrectKey) {
                        containerStyle = "border-emerald-500/70 border-dashed bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200";
                        badge = (
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={13} />
                            <span>To'g'ri javob</span>
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optKey}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-colors ${containerStyle}`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                            <div
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0 ${
                                isUserChoice && isAnswerCorrectKey
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : isUserChoice && !isAnswerCorrectKey
                                  ? "bg-rose-500 text-white shadow-xs"
                                  : isAnswerCorrectKey
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {optKey.toUpperCase()}
                            </div>
                            <div className="text-sm sm:text-[15px] font-medium leading-normal break-words min-w-0 overflow-x-auto">
                              <MathRenderer content={String(optVal || "")} inline />
                            </div>
                          </div>
                          {badge && (
                            <div className="self-end sm:self-auto pl-8 sm:pl-0">
                              {badge}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text input comparison (if no options) */}
                {!q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-400 block mb-0.5 sm:mb-1">Sizning javobingiz:</span>
                      <span className={`text-xs sm:text-sm font-bold break-all ${isCorrect ? "text-emerald-600" : isUnanswered ? "text-slate-400 italic" : "text-rose-500"}`}>
                        {studentAns || "(Javob berilmagan)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5 sm:mb-1">To'g'ri javob:</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 break-all">
                        {q.correct_answer}
                      </span>
                    </div>
                  </div>
                )}

                {/* Explanation / Solution */}
                {q.explanation && (
                  <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <Lightbulb size={14} className="text-amber-500 shrink-0" />
                      <span>Yechim va tushuntirish</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans overflow-x-auto">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex+ 1) / questions.length) * 100;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans bg-transparent pb-24 md:pb-0">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      {showDetailedResults && calculatedSummary ? (
        renderDetailedResults()
      ) : (
        <>
          {/* Floating Header Island */}
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-1/2 md:translate-x-1/2 md:w-full md:max-w-3xl z-50 pointer-events-none">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-[32px] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 sm:gap-3 truncate flex-1 pr-4">
              <button
                onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/tests')}
                className="w-9 h-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Chiqish"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="w-9 h-9 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {currentQuestionIndex+ 1}/{questions.length}
              </span>
              <div className="truncate hidden sm:flex items-center gap-2">
                {isInternational && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 border border-indigo-500/20">
                    <Globe size={11} />
                    {tournamentData?.categoryLabel || "Xalqaro"}
                  </span>
                )}
                {isOlympiad && !isInternational && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                    <Trophy size={11} />
                    {tournamentData?.subject || "Musobaqa"}
                  </span>
                )}
                <h1 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {test.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* SAT / Math Reference Sheet Trigger Button */}
              {(isInternational || test.subject?.toLowerCase().includes("matematika") || test.subject?.toLowerCase().includes("math") || test.subject?.toLowerCase().includes("sat")) && (
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(true)}
                  className="h-9 px-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 group"
                  title="Formulalar to'plami"
                >
                  <span className="font-serif italic font-bold text-xs bg-indigo-100 dark:bg-indigo-900/60 group-hover:bg-white/20 text-indigo-700 dark:text-indigo-300 group-hover:text-white w-5 h-5 rounded-md flex items-center justify-center transition-colors">
                    fx
                  </span>
                  <span className="font-semibold text-xs hidden xs:inline">Formulalar</span>
                </button>
              )}
 {autoSaving && (
 <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-slate-500">
 <Save size={16} className="animate-pulse text-brand-blue" />
 {t('tests.take.saving')}
 </div>
 )}

 {timeRemaining !== null && (
 <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full font-mono text-[14px] md:text-[15px] font-bold border border-slate-200/50 dark:border-slate-700/50 ${getTimerColor()}`}>
 <Clock size={16} />
 {formatTime(timeRemaining)}
 </div>
 )}

 <button
 onClick={handleSubmitClick}
 disabled={submitting}
 className="hidden md:flex items-center gap-2 px-5 py-2 bg-emerald-500 active:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full font-bold transition-all shadow-sm text-[14px]"
 >
 <Send size={16} />
 {submitting ? "..." : "Yakunlash"}
 </button>
 </div>
 </div>
 
 <div className="px-3 pb-1 w-full">
 <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
 <div
 className="bg-brand-blue h-1.5 rounded-full transition-all duration-300"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 pt-32 pb-32 md:pb-8">
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 
 {/* ── QUESTION DISPLAY ── */}
 <div className="lg:col-span-3 flex flex-col gap-6">
 <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] border border-white/60 dark:border-slate-800/60 p-6 sm:p-8 shadow-none">
 {/* Question Header */}
 <div className="flex items-center gap-3 mb-6">
 <span className="w-10 h-10 flex items-center justify-center bg-brand-blue text-white rounded-full font-bold text-lg shadow-sm shrink-0">
 {currentQuestionIndex+ 1}
 </span>
 <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[10px] text-[13px] font-bold tracking-wide uppercase">
 {t('tests.take.points', { points: currentQuestion.points })}
 </span>
 <div className="flex-1" />

  {/* Enlarge Image button in toolbar: NEVER overlaps with image content */}
  {currentQuestion.image_url && (
    <button
      type="button"
      onClick={() => {
        setZoomedImage(currentQuestion.image_url);
        setZoomScale(1);
      }}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer shadow-xs"
      title="Rasmni kattalashtirib ko'rish"
    >
      <Maximize2 size={18} />
    </button>
  )}

 <button
 onClick={() => handleMarkForReview(currentQuestion.id)}
 className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
 markedForReview.has(currentQuestion.id)
 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
 : "bg-slate-100 text-slate-400 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
 }`}
 title={markedForReview.has(currentQuestion.id) ? t('tests.take.marked') : t('tests.take.mark')}
 >
 <Flag size={18} className={markedForReview.has(currentQuestion.id) ? "fill-amber-500/20" : ""} />
 </button>
 </div>

            {/* Question Image (BORDER-FREE, MAXIMUM SIZE & RESPONSIVENESS, NO OVERLAPPING ICONS) */}
            {currentQuestion.image_url && (
              <div className="mb-6">
                <div
                  onClick={() => {
                    setZoomedImage(currentQuestion.image_url);
                    setZoomScale(1);
                  }}
                  className="w-full flex items-center justify-center cursor-zoom-in group"
                  title="Kattalashtirib ko'rish uchun bosing"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.image_url}
                    alt="Savol rasmi"
                    className="w-auto max-w-full max-h-[640px] sm:max-h-[750px] rounded-2xl object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="mb-8">
              <div className="text-[18px] sm:text-[20px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                <MathRenderer content={currentQuestion.question_text} />
              </div>
            </div>

 {/* Answer Options */}
 <div className="flex flex-col gap-3">
 {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
 <>
 {Object.entries(currentQuestion.options).map(([key, value]) => {
 const isSelected = answers[currentQuestion.id] === key;
 return (
 <label
 key={key}
 className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all border ${
 isSelected
 ? "border-brand-blue bg-brand-blue/5 shadow-sm"
 : "border-white/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/60 active:border-brand-blue/30"
 }`}
 >
 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
 isSelected ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-slate-600 bg-transparent"
 }`}>
 {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
 </div>
 <input
 type="radio"
 name={currentQuestion.id}
 value={key}
 checked={isSelected}
 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
 className="hidden"
 />
 <div className="flex-1 text-[15px]">
 <span className="font-bold text-slate-700 dark:text-slate-300 mr-2 uppercase">
 {key}.
 </span>
 <span className={`font-medium ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
 <MathRenderer content={String(value || '')} inline />
 </span>
 </div>
 </label>
 );
 })}
 </>
 )}

 {currentQuestion.question_type === "true_false" && (
 <>
 {["true", "false"].map((option) => {
 const isSelected = answers[currentQuestion.id] === option;
 return (
 <label
 key={option}
 className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all border ${
 isSelected
 ? "border-brand-blue bg-brand-blue/5 shadow-sm"
 : "border-white/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/60 active:border-brand-blue/30"
 }`}
 >
 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
 isSelected ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-slate-600 bg-transparent"
 }`}>
 {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
 </div>
 <input
 type="radio"
 name={currentQuestion.id}
 value={option}
 checked={isSelected}
 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
 className="hidden"
 />
 <span className={`font-bold text-[15px] ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
 {option === "true" ? t('tests.take.true') : t('tests.take.false')}
 </span>
 </label>
 );
 })}
 </>
 )}

  {((currentQuestion.question_type as string) === "grid_in" || (currentQuestion.question_type as string) === "closed") && (
    <div className="space-y-4 p-5 rounded-[22px] bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-800/60">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          Javobingizni son yoki kasr ko'rinishida kiriting
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={answers[currentQuestion.id] || ""}
          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
          placeholder="Masalan: 24 yoki 3/4 yoki 0.75"
          className="w-full text-lg sm:text-2xl font-bold font-mono px-5 py-4 border-2 border-indigo-500/30 focus:border-indigo-600 rounded-2xl bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none transition-all placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 shadow-inner"
        />
        {answers[currentQuestion.id] && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Kiritildi: {answers[currentQuestion.id]}
            </span>
          </div>
        )}
      </div>

      {/* Quick numeric & symbol keypad buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Tezkor tugmalar:</span>
        {["/", ".", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => handleAnswerChange(currentQuestion.id, (answers[currentQuestion.id] || "") + char)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95 transition-all"
          >
            {char}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleAnswerChange(currentQuestion.id, "")}
          className="px-3 h-8 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-bold hover:bg-rose-500 hover:text-white active:scale-95 transition-all ml-auto"
        >
          Tozalash
        </button>
      </div>
    </div>
  )}

 {currentQuestion.question_type === "short_answer" && (
 <textarea
 value={answers[currentQuestion.id] || ""}
 onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
 placeholder={t('tests.take.placeholder')}
 rows={4}
 className="w-full px-5 py-4 border border-white/60 dark:border-slate-800/60 rounded-[20px] bg-white/40 dark:bg-slate-800/40 text-[15px] font-medium text-slate-800 dark:text-slate-100 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
 />
 )}
 </div>
 </div>

 {/* Navigation Buttons - Desktop Only */}
 <div className="hidden md:flex items-center justify-between mt-2">
 <button
 onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
 disabled={currentQuestionIndex === 0}
 className="px-6 py-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 rounded-[20px] font-bold flex items-center gap-2 active:bg-slate-100 dark:active:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-none"
 >
 <ArrowLeft size={18} />
 {t('tests.take.prev')}
 </button>

 {currentQuestionIndex === questions.length - 1 ? (
 <button
 onClick={handleSubmitClick}
 disabled={submitting}
 className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[20px] font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
 >
 <Send size={18} />
 {submitting ? t('tests.take.submitting') : t('tests.take.finish')}
 </button>
 ) : (
 <button
 onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev+ 1))}
 className="px-8 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-[20px] font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm"
 >
 {t('tests.take.next')}
 <ArrowRight size={18} />
 </button>
 )}
 </div>
 </div>

 {/* ── QUESTION NAVIGATOR ── */}
 <div className="lg:col-span-1">
 {/* Desktop Sidebar */}
 <div className="hidden lg:flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] border border-white/60 dark:border-slate-800/60 p-6 sticky top-28 shadow-none">
 <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('tests.take.questions_list')}</h3>
 <div className="grid grid-cols-4 gap-2">
 {questions.map((q, index) => {
 const isAnswered = !!answers[q.id];
 const isMarked = markedForReview.has(q.id);
 const isCurrent = index === currentQuestionIndex;

 let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 border-transparent";
 if (isCurrent) {
 btnClass = "bg-brand-blue text-white shadow-md border-brand-blue";
 } else if (isMarked) {
 btnClass = "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-transparent";
 } else if (isAnswered) {
 btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent";
 }

 return (
 <button
 key={q.id}
 onClick={() => setCurrentQuestionIndex(index)}
 className={`aspect-square rounded-xl font-bold text-[14px] flex items-center justify-center transition-all border cursor-pointer ${btnClass}`}
 >
 {index+ 1}
 </button>
 );
 })}
 </div>

 {/* Legend */}
 <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
 <span>{t('tests.take.status.answered')}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
 <span>{t('tests.take.status.marked')}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
 <span>{t('tests.take.status.no_answer')}</span>
 </div>
 </div>
 </div>

 {/* Mobile Horizontal Question Navigator */}
 <div className="lg:hidden mt-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-slate-800/60 p-4 shadow-none">
 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
 {questions.map((q, index) => {
 const isAnswered = !!answers[q.id];
 const isMarked = markedForReview.has(q.id);
 const isCurrent = index === currentQuestionIndex;

 let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
 if (isCurrent) btnClass = "bg-brand-blue text-white shadow-md";
 else if (isMarked) btnClass = "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
 else if (isAnswered) btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";

 return (
 <button
 key={q.id}
 onClick={() => setCurrentQuestionIndex(index)}
 className={`shrink-0 w-11 h-11 rounded-xl font-bold text-[14px] flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
 >
 {index+ 1}
 </button>
 );
 })}
 </div>
 </div>
 </div>
 </div>
 </div>

  {/* ── SAT / MATH FORMULA REFERENCE SHEET MODAL ── */}
  {showFormulaModal && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 max-w-lg w-full border border-white/80 dark:border-slate-800/80 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-serif italic font-black text-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center">
              fx
            </span>
            <div>
              <h3 className="text-base font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
                Digital SAT & Math Formulalar
              </h3>
              <p className="text-[11px] text-slate-400">Rasmiy formulalar spravochnigi</p>
            </div>
          </div>
          <button
            onClick={() => setShowFormulaModal(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulas Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Aylana (Circle):</span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"A = πr²"}</p>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"C = 2πr = πd"}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">To'g'ri to'rtburchak:</span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"A = l × w"}</p>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"P = 2(l + w)"}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Uchburchak (Triangle):</span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"A = ½ b × h"}</p>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"a² + b² = c² (Pifagor)"}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Maxsus Uchburchaklar:</span>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"30°-60°-90°: x, x√3, 2x"}</p>
            <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{"45°-45°-90°: x, x, x√2"}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 sm:col-span-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Hajm Formulalari (Volumes):</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <div>{"V = lwh"}</div>
              <div>{"V = πr²h"}</div>
              <div>{"V = 4/3 πr³"}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFormulaModal(false)}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
        >
          Tushunarli (Yopish)
        </button>
      </div>
    </div>
  )}

 {/* ── CONFIRMATION MODAL ── */}
 {showConfirmModal && (
 <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
 <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] p-8 max-w-md w-full border border-white/80 dark:border-slate-800/80 shadow-2xl">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
 <AlertCircle className="text-amber-500" size={28} />
 </div>
 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-fredoka">Testni yakunlash</h3>
 </div>

 <div className="flex flex-col gap-4 mb-8">
 <p className="text-[15px] text-slate-600 dark:text-slate-300 font-medium">
 Siz <span className="font-bold text-brand-blue px-2 py-1 bg-brand-blue/10 rounded-md mx-1">{Object.keys(answers).length}/{questions.length}</span> ta savolga javob berdingiz.
 </p>
 {Object.keys(answers).length < questions.length && (
 <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-[20px] border border-amber-200/50 dark:border-amber-500/20">
 <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
 <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
 <span className="font-bold">{questions.length - Object.keys(answers).length}</span> ta savol javobsiz qoldi! Agar ishonchingiz komil bo'lsa, yakunlashingiz mumkin.
 </p>
 </div>
 )}
 <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
 Testni yakunlagandan keyin qayta tahrirlash imkoniyati bo'lmaydi.
 </p>
 </div>

 <div className="flex gap-3">
 <button
 onClick={() => setShowConfirmModal(false)}
 disabled={submitting}
 className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-[20px] font-bold transition-all"
 >
 Bekor qilish
 </button>
 <button
 onClick={handleConfirmSubmit}
 disabled={submitting}
 className="flex-1 py-3.5 px-4 bg-emerald-500 active:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-[20px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
 >
 <CheckCircle size={18} />
 {submitting ? "Yuklanmoqda..." : "Yakunlash"}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ── MOBILE FLOATING BOTTOM NAVIGATION ── */}
 <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-full p-2 shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] pointer-events-auto flex items-center justify-between gap-2 max-w-sm mx-auto safe-area-pb">
 <button
 onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
 disabled={currentQuestionIndex === 0}
 className="w-12 h-12 flex items-center justify-center shrink-0 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-full font-bold active:bg-slate-200 dark:active:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ArrowLeft size={20} />
 </button>

 {currentQuestionIndex === questions.length - 1 ? (
 <button
 onClick={handleSubmitClick}
 disabled={submitting}
 className="flex-1 h-12 px-6 bg-emerald-500 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm"
 >
 <Send size={18} />
 <span className="text-[15px]">{submitting ? "..." : "Yakunlash"}</span>
 </button>
 ) : (
 <button
 onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev+ 1))}
 className="flex-1 h-12 px-6 bg-brand-blue text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
 >
 <span className="text-[15px]">Keyingi</span>
 <ArrowRight size={18} />
 </button>
 )}
 </div>
 </div>
 </>
 )}

      {/* ── IMAGE ZOOM LIGHTBOX MODAL ── */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setZoomedImage(null);
            setZoomScale(1);
          }}
        >
          {/* Top Header Controls */}
          <div
            className="w-full max-w-4xl flex items-center justify-between z-10 py-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-white/90">
                Savol rasmi
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/70">
                Savol #{currentQuestionIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.75, prev - 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Kichiklashtirish"
              >
                <ZoomOut size={18} />
              </button>

              {/* Scale % */}
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
                title="Asl o'lchamga qaytarish"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(3, prev + 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Kattalashtirish"
              >
                <ZoomIn size={18} />
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setZoomedImage(null);
                  setZoomScale(1);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors ml-2 cursor-pointer"
                title="Yopish (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Zoomable Image Content */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setZoomedImage(null);
                setZoomScale(1);
              }
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage}
              alt="Kattalashtirilgan savol rasmi"
              style={{ transform: `scale(${zoomScale})` }}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-200 select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale((prev) => (prev > 1.2 ? 1 : 1.5));
              }}
            />
          </div>

          {/* Footer hint */}
          <div
            className="text-xs text-white/60 text-center py-1 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            Yopish uchun tashqariga bosing yoki Esc tugmasidan foydalaning
          </div>
        </div>
      )}

      {/* ── PROMAX SIGNATURE CHECKING OVERLAY ── */}
      <AnimatePresence>
        {isCheckingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md select-none"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[320px] sm:max-w-sm bg-white dark:bg-slate-900/95 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center text-center overflow-hidden"
            >
              {/* Subtle Ambient Radial Glows inside card */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-orange/10 dark:bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />

              {/* Promax Logo Emblem */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-1 drop-shadow-[0_6px_16px_rgba(0,86,210,0.2)]">
                <Image
                  src="/Logo_without_sentence.png"
                  alt="Promax"
                  width={64}
                  height={64}
                  priority
                  className="object-contain"
                />
              </div>

              {/* Smooth Stylus Ink Wave Canvas */}
              <div className="w-full max-w-[220px] sm:max-w-[260px] h-16 sm:h-20 relative flex items-center justify-center my-1 sm:my-2">
                <svg viewBox="0 0 250 70" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="checkPenInk" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0056D2" />
                      <stop offset="60%" stopColor="#0284C7" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>

                  {/* Clean Guidelines */}
                  <line x1="10" y1="14" x2="240" y2="14" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="10" y1="35" x2="240" y2="35" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1.5" />
                  <line x1="10" y1="56" x2="240" y2="56" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Drawn Ink Wave */}
                  <motion.path
                    d="M 15 35 Q 45 15, 80 35 T 150 35 T 205 35 Q 220 22, 230 35"
                    fill="none"
                    stroke="url(#checkPenInk)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 0.25, 0.55, 0.85, 1, 1, 0] }}
                    transition={{
                      duration: 1.8,
                      times: [0, 0.2, 0.5, 0.75, 0.9, 0.96, 1],
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Fountain Pen */}
                  <motion.g
                    initial={{ x: 15, y: 35, opacity: 0 }}
                    animate={{
                      x: [15, 45, 80, 115, 150, 178, 205, 230, 15],
                      y: [35, 15, 35, 15, 35, 15, 35, 35, 35],
                      opacity: [0, 1, 1, 1, 1, 1, 1, 0, 0]
                    }}
                    transition={{
                      duration: 1.8,
                      times: [0, 0.15, 0.35, 0.5, 0.65, 0.78, 0.88, 0.95, 1],
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <g transform="rotate(40)">
                      <polygon points="0,0 -4,-12 4,-12" fill="#F59E0B" />
                      <line x1="0" y1="0" x2="0" y2="-7" stroke="#78350F" strokeWidth="0.8" />
                      <circle cx="0" cy="-7" r="0.9" fill="#0056D2" />
                      <rect x="-4.5" y="-15" width="9" height="3" fill="#0F172A" rx="0.5" />
                      <polygon points="-4.5,-15 4.5,-15 5.5,-45 -5.5,-45" fill="#0056D2" />
                      <rect x="-5" y="-30" width="10" height="2.5" fill="#E2E8F0" />
                      <rect x="-5.5" y="-42" width="11" height="3.5" fill="#F97316" rx="0.5" />
                    </g>
                  </motion.g>
                </svg>
              </div>

              {/* Matched Typography */}
              <div className="space-y-1">
                <h3 className="font-fredoka text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Natijalar hisoblanmoqda
                </h3>
                <p className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Javoblaringiz tekshirilmoqda, iltimos kuting...
                </p>
              </div>

              {/* Hairline Brand Gradient Progress */}
              <div className="w-36 sm:w-44 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4 sm:mt-5">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-blue via-sky-500 to-brand-orange rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 </div>
 );
}
