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
  Lightbulb,
  Award,
  Printer,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getTestById,
  startTestAttempt,
  submitAnswer,
  submitAnswersBatch,
  completeTestAttempt,
  abandonTestAttempt,
  getActiveAttempt,
  getAttemptResponses,
  type Test,
  type Question
} from "@/lib/tests";
import {
  getTournamentById,
  getCachedAdminTournaments,
  submitTournamentAttempt,
  getUserCompletedTournamentIds,
  type TournamentQuestion
} from "@/lib/tournaments";
import {
  getInternationalTournamentById,
  getCachedInternationalTournaments,
  submitInternationalAttempt,
  getUserCompletedInternationalTournamentIds,
  type InternationalQuestion
} from "@/lib/international-tournaments";
import MathRenderer from "@/components/MathRenderer";
import { TakeTestSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import { soundFx } from "@/lib/sound-effects";
import TestStartReveal from "@/components/ui/TestStartReveal";
import toast from "react-hot-toast";

const fallbackNationalQs: Question[] = [
  {
    id: "q_nat_1",
    test_id: "tournament",
    question_text: "Tenglamani yeching: $2^{x+2} + 2^x = 40$. $x$ ning qiymatini toping.",
    question_type: "multiple_choice",
    options: { A: "3", B: "4", C: "2", D: "5" },
    correct_answer: "A",
    explanation: "$2^{x+2} + 2^x = 2^x \\cdot 4 + 2^x = 5 \\cdot 2^x = 40 \\implies 2^x = 8 \\implies x = 3$.",
    points: 3.1,
    image_url: null,
    order_index: 0
  },
  {
    id: "q_nat_2",
    test_id: "tournament",
    question_text: "Ketma-ket 5 ta butun sonning yig'indisi 105 ga teng. Bu sonlarning eng kattasi nechiga teng?",
    question_type: "multiple_choice",
    options: { A: "21", B: "22", C: "23", D: "24" },
    correct_answer: "C",
    explanation: "O'rtadagi son: $105 / 5 = 21$. Ketma-ket sonlar: 19, 20, 21, 22, 23. Eng kattasi 23.",
    points: 3.1,
    image_url: null,
    order_index: 1
  },
  {
    id: "q_nat_3",
    test_id: "tournament",
    question_text: "To'g'ri to'rtburchakning perimetri 36 sm, tomonlarining nisbati esa 4:5 ga teng. Uning yuzini toping ($sm^2$).",
    question_type: "multiple_choice",
    options: { A: "80", B: "72", C: "90", D: "88" },
    correct_answer: "A",
    explanation: "$2 \\cdot (4x + 5x) = 36 \\implies 18x = 36 \\implies x = 2$. Tomonlar: 8 sm va 10 sm. Yuza: $8 \\times 10 = 80\\text{ sm}^2$.",
    points: 3.1,
    image_url: null,
    order_index: 2
  },
  {
    id: "q_nat_4",
    test_id: "tournament",
    question_text: "Agar $f(x) = 3x^2 - 4x + 5$ bo'lsa, $f'(2)$ hosilasining qiymatini hisoblang.",
    question_type: "multiple_choice",
    options: { A: "8", B: "10", C: "12", D: "14" },
    correct_answer: "A",
    explanation: "$f'(x) = 6x - 4$. $f'(2) = 6(2) - 4 = 12 - 4 = 8$.",
    points: 3.1,
    image_url: null,
    order_index: 3
  },
  {
    id: "q_nat_5",
    test_id: "tournament",
    question_text: "Savatda 4 ta oq va 6 ta qora shar bor. Tasodifan olingan 2 ta sharning ikkalasi ham qora bo'lish ehtimolini toping.",
    question_type: "multiple_choice",
    options: { A: "1/3", B: "2/5", C: "3/8", D: "5/12" },
    correct_answer: "A",
    explanation: "$P = \\frac{C(6,2)}{C(10,2)} = \\frac{15}{45} = \\frac{1}{3}$.",
    points: 3.1,
    image_url: null,
    order_index: 4
  }
];

const fallbackIntlQs: Question[] = [
  {
    id: "intl_q_1",
    test_id: "intl",
    question_text: "If $f(x) = 2x + 7$ and $g(x) = x^2 - 3$, what is the value of $f(g(3))$?",
    question_type: "multiple_choice",
    options: { A: "19", B: "21", C: "23", D: "25" },
    correct_answer: "A",
    explanation: "$g(3) = 3^2 - 3 = 6$. $f(6) = 2(6) + 7 = 19$.",
    points: 10,
    image_url: null,
    order_index: 0
  },
  {
    id: "intl_q_2",
    test_id: "intl",
    question_text: "In the xy-plane, the graph of $y = 3x^2 - 12x + 7$ has its vertex at $(h, k)$. What is the value of $h$?",
    question_type: "multiple_choice",
    options: { A: "2", B: "4", C: "-2", D: "1" },
    correct_answer: "A",
    explanation: "$h = -\\frac{b}{2a} = -\\frac{-12}{2 \\cdot 3} = 2$.",
    points: 10,
    image_url: null,
    order_index: 1
  },
  {
    id: "intl_q_3",
    test_id: "intl",
    question_text: "A circle in the xy-plane has equation $(x - 3)^2 + (y + 5)^2 = 49$. What is the radius of the circle?",
    question_type: "multiple_choice",
    options: { A: "7", B: "14", C: "49", D: "3.5" },
    correct_answer: "A",
    explanation: "$r^2 = 49 \\implies r = 7$.",
    points: 10,
    image_url: null,
    order_index: 2
  },
  {
    id: "intl_q_4",
    test_id: "intl",
    question_text: "The function $p(t) = 500(1.08)^t$ models the population of a species after $t$ years. By what percentage does the population increase each year?",
    question_type: "multiple_choice",
    options: { A: "8%", B: "80%", C: "1.08%", D: "18%" },
    correct_answer: "A",
    explanation: "$1 + r = 1.08 \\implies r = 0.08 = 8\\%$.",
    points: 10,
    image_url: null,
    order_index: 3
  },
  {
    id: "intl_q_5",
    test_id: "intl",
    question_text: "If $3x + 2y = 16$ and $y = 2$, what is the value of $x$?",
    question_type: "multiple_choice",
    options: { A: "4", B: "3", C: "5", D: "2" },
    correct_answer: "A",
    explanation: "$3x + 2(2) = 16 \\implies 3x + 4 = 16 \\implies 3x = 12 \\implies x = 4$.",
    points: 10,
    image_url: null,
    order_index: 4
  }
];

export default function TakeTestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const testId = params.id as string;
  const isOlympiadParam = searchParams?.get("type") === "olympiad" || searchParams?.get("olympiad") === "true";
  const isInternationalParam = searchParams?.get("type") === "international" || searchParams?.get("international") === "true";

  const [test, setTest] = useState<any>(null);
  const [isOlympiad, setIsOlympiad] = useState<boolean>(() => {
    if (isOlympiadParam) return true;
    if (typeof testId === "string") {
      return testId.startsWith("tourn") || testId.startsWith("olympiad") || testId.startsWith("grand") || testId.startsWith("t_");
    }
    return false;
  });
  const [isInternational, setIsInternational] = useState<boolean>(() => {
    if (isInternationalParam) return true;
    if (typeof testId === "string") {
      return testId.startsWith("intl") || testId.startsWith("sat") || testId.startsWith("amc") || testId.startsWith("ielts");
    }
    return false;
  });
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
  const [isPracticeMode, setIsPracticeMode] = useState(
    () => searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true"
  );
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
  const lastSavedAnswersRef = useRef<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const isSubmittingRef = useRef<boolean>(false);
  const autoSubmittedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const tabSwitchesRef = useRef<number>(0);
  const allQuestionsRef = useRef<Question[]>([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [studentDisplayName, setStudentDisplayName] = useState("Promax O'quvchisi");

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keep a backup of the full question set for full retakes after a mistakes-only session
  useEffect(() => {
    if (questions.length > 0 && allQuestionsRef.current.length === 0) {
      allQuestionsRef.current = questions;
    }
  }, [questions]);

  // Close image zoom modal with Escape key & handle keyboard shortcuts during test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomedImage) {
          setZoomedImage(null);
          setZoomScale(1);
        } else if (showCertificateModal) {
          setShowCertificateModal(false);
        } else if (showFormulaModal) {
          setShowFormulaModal(false);
        } else if (showConfirmModal) {
          setShowConfirmModal(false);
        }
        return;
      }

      // Disable question shortcuts if modals are open, results are showing, or user is typing in an input/textarea
      if (zoomedImage || showCertificateModal || showFormulaModal || showConfirmModal || showDetailedResults || isCheckingResults || loading) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      const activeQ = questions[currentQuestionIndex];
      if (!activeQ) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setMarkedForReview((prev) => {
          const next = new Set(prev);
          if (next.has(activeQ.id)) next.delete(activeQ.id);
          else next.add(activeQ.id);
          return next;
        });
      } else if (activeQ.question_type === "multiple_choice" && activeQ.options && !e.ctrlKey && !e.metaKey) {
        const keyMap: Record<string, string> = {
          a: "A", b: "B", c: "C", d: "D",
          "1": "A", "2": "B", "3": "C", "4": "D"
        };
        const mapped = keyMap[e.key.toLowerCase()];
        if (mapped && activeQ.options[mapped as keyof typeof activeQ.options] !== undefined) {
          e.preventDefault();
          setAnswers((prev) => ({ ...prev, [activeQ.id]: mapped }));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedImage, showCertificateModal, showFormulaModal, showConfirmModal, showDetailedResults, isCheckingResults, loading, questions, currentQuestionIndex]);

  // Anti-cheat tab switch detector for official Olympiad / International competitions
  useEffect(() => {
    if (loading || showDetailedResults || isCheckingResults || isPracticeMode || (!isOlympiad && !isInternational)) {
      return;
    }
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchesRef.current += 1;
        toast(`Musobaqa vaqtida oynadan chiqish qayd etildi (${tabSwitchesRef.current}-marta). Diqqatni testda saqlang!`, {
          duration: 4000,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loading, showDetailedResults, isCheckingResults, isPracticeMode, isOlympiad, isInternational]);

  // Load test and start attempt
  useEffect(() => {
    async function loadTestAndStart() {
      try {
        const supabase = createClient();

        // 1. Check if it's an International Competition (SAT, AMC, IELTS, etc.)
        const isIntlMatch =
          isInternationalParam ||
          testId.startsWith("sat") ||
          testId.startsWith("amc") ||
          testId.startsWith("ielts") ||
          testId.startsWith("intl");

        if (isIntlMatch) {
          setIsInternational(true);
          const currentUser = (await supabase.auth.getUser()).data.user;
          const completedIntl = await getUserCompletedInternationalTournamentIds(currentUser?.id);
          const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
          if (completedIntl.includes(testId) && !isPractice) {
            toast.success("Siz ushbu SAT imtihonini allaqachon topshirgansiz! Natijangiz saqlangan.");
            router.replace(`/dashboard/international?tab=leaderboard&id=${testId}`);
            return;
          }

          let intlData = await getInternationalTournamentById(testId);
          if (!intlData) {
            const cachedList = getCachedInternationalTournaments();
            intlData = cachedList.find(t => t.id === testId) || null;
          }

          if (intlData) {
            const isFinishedIntl = intlData.status === "finished" || (intlData.endDate && new Date(`${intlData.endDate}T${intlData.endTime || '23:59'}`).getTime() < Date.now());
            if (isPractice || isFinishedIntl || completedIntl.includes(testId)) {
              setIsPracticeMode(true);
              toast("Mashq rejimi: javoblaringiz rasmiy reytingga ta'sir qilmaydi.", { duration: 3500 });
            }

            setTournamentData(intlData);
            setTest({
              id: intlData.id,
              title: intlData.title,
              duration_minutes: intlData.durationMinutes || 70,
              subject: intlData.subject
            });
            const rawQs = intlData.questions && intlData.questions.length > 0 ? intlData.questions : fallbackIntlQs;
            const formattedQs: Question[] = rawQs.map((q: any, idx: number) => ({
              id: q.id || `intl_q_${idx}`,
              test_id: testId,
              question_text: q.question_text,
              question_type: (q.question_type || "multiple_choice") as any,
              options: q.options || { A: "", B: "", C: "", D: "" },
              correct_answer: q.correct_answer || "A",
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

        // 2. Check if it's an Olympiad / National Tournament
        const isOlympiadMatch =
          isOlympiadParam ||
          testId.startsWith("tourn") ||
          testId.startsWith("tournament") ||
          testId.startsWith("olympiad") ||
          testId.startsWith("grand") ||
          testId.startsWith("t_");

        if (isOlympiadMatch) {
          setIsOlympiad(true);
          const currentUser = (await supabase.auth.getUser()).data.user;
          const completedOlympiads = await getUserCompletedTournamentIds(currentUser?.id);
          const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
          if (completedOlympiads.includes(testId) && !isPractice) {
            toast.success("Siz ushbu musobaqani allaqachon topshirgansiz! Natijangiz saqlangan.");
            router.replace(`/dashboard/olympiads?tab=leaderboard&id=${testId}`);
            return;
          }

          let tData = await getTournamentById(testId);
          if (!tData) {
            const cachedList = getCachedAdminTournaments();
            tData = cachedList.find(t => t.id === testId) || null;
          }

          if (tData) {
            const isFinishedTourn = tData.status === "finished" || (tData.endDate && new Date(`${tData.endDate}T${tData.endTime || '23:59'}`).getTime() < Date.now());
            if (isPractice || isFinishedTourn || completedOlympiads.includes(testId)) {
              setIsPracticeMode(true);
              toast("Mashq rejimi: javoblaringiz rasmiy reytingga ta'sir qilmaydi.", { duration: 3500 });
            }

            setTournamentData(tData);
            setTest({
              id: tData.id,
              title: tData.title,
              duration_minutes: tData.durationMinutes || 60,
              subject: tData.subject
            });
            const rawQs = tData.questions && tData.questions.length > 0 ? tData.questions : fallbackNationalQs;
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

        // 3. Standard test DB lookup with fallback check to both tournament types
        const testData = await getTestById(testId);
        if (!testData) {
          // Check international tournaments fallback
          let intlData = await getInternationalTournamentById(testId);
          if (!intlData) {
            intlData = getCachedInternationalTournaments().find(t => t.id === testId) || null;
          }
          if (intlData) {
            setIsInternational(true);
            const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
            if (isPractice) setIsPracticeMode(true);
            setTournamentData(intlData);
            setTest({
              id: intlData.id,
              title: intlData.title,
              duration_minutes: intlData.durationMinutes || 70,
              subject: intlData.subject
            });
            const rawQs = intlData.questions && intlData.questions.length > 0 ? intlData.questions : fallbackIntlQs;
            const formattedQs: Question[] = rawQs.map((q: any, idx: number) => ({
              id: q.id || `intl_q_${idx}`,
              test_id: testId,
              question_text: q.question_text,
              question_type: (q.question_type || "multiple_choice") as any,
              options: q.options || { A: "", B: "", C: "", D: "" },
              correct_answer: q.correct_answer || "A",
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

          // Check national tournaments fallback
          let tData = await getTournamentById(testId);
          if (!tData) {
            tData = getCachedAdminTournaments().find(t => t.id === testId) || null;
          }
          if (tData) {
            setIsOlympiad(true);
            const isPractice = searchParams?.get("mode") === "practice" || searchParams?.get("retake") === "true";
            if (isPractice) setIsPracticeMode(true);
            setTournamentData(tData);
            setTest({
              id: tData.id,
              title: tData.title,
              duration_minutes: tData.durationMinutes || 60,
              subject: tData.subject
            });
            const rawQs = tData.questions && tData.questions.length > 0 ? tData.questions : fallbackNationalQs;
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

          // Neither test nor tournament found: stop loading gracefully, do NOT redirect away
          setLoading(false);
          return;
        }
   setTest(testData);

   // Get questions (direct Supabase first, server API fallback if RLS hides published questions)
   const { data: questionsData, error: questionsErr } = await supabase
   .from('questions')
   .select('*')
   .eq('test_id', testId)
   .order('order_index', { ascending: true });

   let loadedQuestions: Question[] = questionsData || [];
   if (loadedQuestions.length === 0) {
     if (questionsErr) {
       console.warn('Direct questions query failed, using server API fallback:', questionsErr.message);
     }
     try {
       const qRes = await fetch(`/api/tests/${encodeURIComponent(testId)}/questions`, { cache: 'no-store' });
       if (qRes.ok) {
         const qJson = await qRes.json();
         if (Array.isArray(qJson.questions) && qJson.questions.length > 0) {
           loadedQuestions = qJson.questions;
         }
       }
     } catch (fallbackErr) {
       console.error('Fallback questions API error:', fallbackErr);
     }
   }

   setQuestions(loadedQuestions);
   allQuestionsRef.current = loadedQuestions;

   // Check for active attempt or create new one (auto-abandon expired zombie attempts!)
   let activeAttempt = await getActiveAttempt(testId);
   if (activeAttempt && testData.duration_minutes) {
     const startedMs = new Date(activeAttempt.started_at).getTime();
     const elapsed = Number.isFinite(startedMs) ? Math.floor((Date.now() - startedMs) / 1000) : 0;
     const remaining = (testData.duration_minutes * 60) - elapsed;
     if (remaining <= 0) {
       await abandonTestAttempt(activeAttempt.id);
       activeAttempt = null;
     }
   }

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
     lastSavedAnswersRef.current = { ...savedAnswers };

     // Calculate remaining time if timed test
     if (testData.duration_minutes) {
       const elapsed = Math.floor(
         (Date.now() - new Date(activeAttempt.started_at).getTime()) / 1000
       );
       const remaining = (testData.duration_minutes * 60) - elapsed;
       setTimeRemaining(Math.max(1, remaining));
     }
   } else {
     // Start new attempt
     const attemptData = await startTestAttempt(testId);
     if (!attemptData) {
       toast.error(t('tests.take.error.start') || "Testni boshlashda xatolik yuz berdi");
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
 }, [testId, router, isOlympiadParam, isInternationalParam]);

 const isTimerActive =
   timeRemaining !== null &&
   timeRemaining > 0 &&
   !submitting &&
   !isCheckingResults &&
   !showDetailedResults;

 // Timer countdown (single steady 1s interval; stops immediately when submitted or viewing results)
 useEffect(() => {
   if (!isTimerActive) return;

   const interval = setInterval(() => {
     setTimeRemaining((prev) => {
       if (prev === null || prev <= 1) return 0;
       return prev - 1;
     });
   }, 1000);

   return () => clearInterval(interval);
 }, [isTimerActive]);

 // Trigger auto-submit cleanly in a separate effect when timer hits 0
 useEffect(() => {
   if (
     timeRemaining === 0 &&
     attemptId &&
     !loading &&
     !submitting &&
     !isCheckingResults &&
     !showDetailedResults &&
     !autoSubmittedRef.current
   ) {
     autoSubmittedRef.current = true;
     handleAutoSubmit();
   }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [timeRemaining, attemptId, loading, submitting, isCheckingResults, showDetailedResults]);

 const saveAnswers = useCallback(async () => {
    const currentAnswers = answersRef.current;
    if (!attemptId || Object.keys(currentAnswers).length === 0) return;

    // Compute only answers that changed since last save (prevents N+1 polling storm)
    const dirtyAnswers: Record<string, string> = {};
    for (const [qId, ans] of Object.entries(currentAnswers)) {
      if (lastSavedAnswersRef.current[qId] !== ans) {
        dirtyAnswers[qId] = ans;
      }
    }

    if (Object.keys(dirtyAnswers).length === 0) return;

    setAutoSaving(true);
    try {
      if (isOlympiad || isInternational || isPracticeMode) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`promax_answers_${testId}`, JSON.stringify(currentAnswers));
          } catch {}
        }
        lastSavedAnswersRef.current = { ...currentAnswers };
      } else {
        const ok = await submitAnswersBatch(attemptId, dirtyAnswers);
        if (ok) {
          lastSavedAnswersRef.current = { ...lastSavedAnswersRef.current, ...dirtyAnswers };
        }
      }
    } catch (error) {
      console.error("Error auto-saving:", error);
    } finally {
      if (isMountedRef.current) setAutoSaving(false);
    }
  }, [attemptId, isOlympiad, isInternational, isPracticeMode, testId]);

 // Auto-save answers every 5 seconds without resetting on every click/keystroke
 useEffect(() => {
   if (!attemptId || submitting || showDetailedResults) return;

   autoSaveInterval.current = setInterval(() => {
     saveAnswers();
   }, 5000);

   return () => {
     if (autoSaveInterval.current) {
       clearInterval(autoSaveInterval.current);
       autoSaveInterval.current = null;
     }
   };
 }, [attemptId, submitting, showDetailedResults, saveAnswers]);

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
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setIsCheckingResults(true);
    setCheckingStep(1);
    setCheckingProgress(25);

    const latestAnswers = answersRef.current;

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
      const pts = Number(q.points) || (isInternational ? 10 : isOlympiad ? 3.1 : 1);
      maxScore += pts;
      const studentAns = (latestAnswers[q.id] || "").trim().toLowerCase();
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
    if (isInternational && (testId.includes("sat") || tournamentData?.category === "sat")) {
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

    // 2. Fetch user profile for certificate & submit to backend (only official attempts saved to DB)
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
      if (isMountedRef.current) setStudentDisplayName(studentName);

      if (!isPracticeMode) {
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
            answers: latestAnswers,
            timeSpentSeconds: timeSpent
          });
        } else {
          const ok = await completeTestAttempt(attemptId || `attempt_${testId}`, timeSpent, latestAnswers);
          if (ok && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("promax_coins_updated"));
          }
        }
      }
    } catch (error) {
      console.error("Backend submission error:", error);
    }

    // Smooth, polished transition (1200ms)
    await new Promise((r) => setTimeout(r, 1200));
    if (!isMountedRef.current) return;
    setIsCheckingResults(false);
    setShowDetailedResults(true);
    setSubmitting(false);
  };

  const handleAutoSubmit = async () => {
    if (!attemptId || isSubmittingRef.current || submitting || isCheckingResults || showDetailedResults) return;
    toast("Vaqt tugadi! Natijalar tekshirilmoqda...");
    const timeSpent = test?.duration_minutes ? test.duration_minutes * 60 : 0;
    await runEvaluationAndShowResults(timeSpent);
  };

  const handleSubmitClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId || isSubmittingRef.current || submitting) return;
    setShowConfirmModal(false);
    const timeSpent = test?.duration_minutes ? (test.duration_minutes * 60 - (timeRemaining || 0)) : 0;
    await runEvaluationAndShowResults(timeSpent);
    if (isMountedRef.current) soundFx.playCelebrate();
  };

  const handlePracticeRetake = () => {
    isSubmittingRef.current = false;
    autoSubmittedRef.current = false;
    if (allQuestionsRef.current.length > 0) {
      setQuestions(allQuestionsRef.current);
    }
    setIsPracticeMode(true);
    setAnswers({});
    answersRef.current = {};
    lastSavedAnswersRef.current = {};
    setMarkedForReview(new Set());
    setCurrentQuestionIndex(0);
    setShowDetailedResults(false);
    setCalculatedSummary(null);
    setTimeRemaining(test?.duration_minutes ? test.duration_minutes * 60 : null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.success("Mashq rejimi boshlandi! O'zingizni sinab ko'ring.");
  };

  const handleMistakesRetake = () => {
    const mistakeQs = questions.filter((q) => {
      const studentAns = (answers[q.id] || "").trim().toLowerCase();
      const correctAns = (q.correct_answer || "").trim().toLowerCase();
      const isCorrect =
        studentAns &&
        (studentAns === correctAns ||
          (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns));
      return !isCorrect;
    });

    if (mistakeQs.length === 0) {
      toast.success("Sizda xato savollar yo'q! Barcha savollar to'g'ri topilgan.");
      return;
    }

    isSubmittingRef.current = false;
    autoSubmittedRef.current = false;
    setQuestions(mistakeQs);
    setIsPracticeMode(true);
    setAnswers({});
    answersRef.current = {};
    lastSavedAnswersRef.current = {};
    setMarkedForReview(new Set());
    setCurrentQuestionIndex(0);
    setShowDetailedResults(false);
    setCalculatedSummary(null);
    setTimeRemaining(Math.max(10, mistakeQs.length * 2) * 60);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.success(`Xatolar ustida ishlash (${mistakeQs.length} ta savol) boshlandi!`);
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

  const revealModeLabel = isInternational
    ? "SAT TITULI"
    : isOlympiad
    ? "MILLIY SERTIFIKAT"
    : "TITUL VARAQASI";

  if (!loading && (!test || questions.length === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-slate-800 dark:text-slate-100">
          Savollar topilmadi
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          Ushbu musobaqa uchun hali savollar kiritilmagan yoki test faol emas.
        </p>
        <Link
          href={isInternational ? "/dashboard/international" : isOlympiad ? "/dashboard/olympiads" : "/dashboard/tests"}
          className="px-5 py-2.5 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          {isInternational ? "SAT sinovlariga qaytish" : isOlympiad ? "Milliy sertifikatga qaytish" : t('tests.take.back_to_list')}
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
      <div className="relative z-10 w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Clean Minimal Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/tests')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer group min-w-0"
          >
            <span className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center shrink-0">
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span className="truncate">{isInternational ? "SAT" : isOlympiad ? "Milliy sertifikat" : "Testlar ro'yxati"}</span>
          </button>

          <button
            type="button"
            onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/results')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors active:scale-95 cursor-pointer shrink-0"
          >
            <Trophy size={13} className="text-amber-500 shrink-0" />
            <span>{isInternational || isOlympiad ? "Reyting" : "Natijalar"}</span>
          </button>
        </div>

        {/* Hero Performance Card (Do'kon / Flat-Minimalist style) */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-white/80 dark:border-slate-800 p-5 sm:p-8 shadow-none relative overflow-hidden">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-5 sm:gap-8">
            <div className="flex-1 space-y-2.5 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {isInternational ? (tournamentData?.categoryLabel || "SAT") : isOlympiad ? (tournamentData?.subject || "Milliy sertifikat") : "Test Natijasi"}
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isExcellent
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : isGood
                    ? "bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}>
                  <Sparkles size={11} />
                  <span>{isExcellent ? "A'lo natija" : isGood ? "Yaxshi natija" : "Mashq qilish kerak"}</span>
                </span>
                {isPracticeMode && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    <RotateCcw size={10} />
                    <span>Mashq</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                {test.title}
              </h1>

              <div className="flex items-baseline justify-center md:justify-start gap-2 pt-0.5">
                <span className="font-fredoka text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">
                  {calculatedSummary.totalScore}
                </span>
                <span className="text-base sm:text-xl font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                  / {calculatedSummary.maxScore} ball
                </span>
              </div>

              {calculatedSummary.scaledScore && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Digital SAT balli:</span>
                  <span className="font-black text-slate-900 dark:text-white">{calculatedSummary.scaledScore}</span>
                </div>
              )}
            </div>

            {/* Circular Percentage Dial */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 100 100">
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
                  <span className="font-fredoka text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                    {calculatedSummary.percentage}%
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                    Natija
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats 4-Column Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">To&apos;g&apos;ri</span>
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {calculatedSummary.correctCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Noto&apos;g&apos;ri</span>
                <XCircle size={14} className="text-rose-500 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {calculatedSummary.wrongCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">O&apos;tkazilgan</span>
                <HelpCircle size={14} className="text-slate-400 shrink-0" />
              </div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                {calculatedSummary.unansweredCount} <span className="text-xs font-sans text-slate-400 font-medium">savol</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Vaqt</span>
                <Clock size={14} className="text-brand-blue shrink-0" />
              </div>
              <span className="font-fredoka text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums">
                {formatTime(calculatedSummary.timeSpent)}
              </span>
            </div>
          </div>

          {/* Uniform Action Row inside Hero Card (no cramped wrapping on mobile!) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
            {calculatedSummary.percentage >= 60 && (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Award size={15} className="shrink-0" />
                <span>Sertifikat</span>
              </button>
            )}
            {(calculatedSummary.wrongCount + calculatedSummary.unansweredCount) > 0 && (
              <button
                type="button"
                onClick={handleMistakesRetake}
                className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Sparkles size={14} className="shrink-0" />
                <span>Xatolar ({calculatedSummary.wrongCount + calculatedSummary.unansweredCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePracticeRetake}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <RotateCcw size={14} className="shrink-0" />
              <span>Qayta yechish</span>
            </button>
          </div>
        </div>

        {/* Filter Strip & Fast Jump */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[24px] sm:rounded-[28px] border border-white/80 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-extrabold font-fredoka text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <ListChecks size={15} />
              </span>
              <span>Savollar tahlili</span>
            </h2>

            {/* Responsive Filter Segmented Control */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setResultsFilter("all")}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "all"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Barchasi ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter("correct")}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "correct"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                To&apos;g&apos;ri ({calculatedSummary.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setResultsFilter("wrong")}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center truncate ${
                  resultsFilter === "wrong"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                }`}
              >
                Xatolar ({calculatedSummary.wrongCount + calculatedSummary.unansweredCount})
              </button>
            </div>
          </div>

          {/* Jump To Question Numbers (only shown when > 1 question) */}
          {questions.length > 1 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
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
                      if (resultsFilter !== "all") setResultsFilter("all");
                      setTimeout(() => {
                        const el = document.getElementById(`review-q-${q.id}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 40);
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-extrabold tabular-nums flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                        : isUnanswered
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/80 dark:border-slate-700"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                    }`}
                    title={`Savol #${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[24px] border border-white/80 dark:border-slate-800 p-8 text-center flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {resultsFilter === "wrong"
                  ? "Xato savollar yo'q — barcha javoblar to'g'ri!"
                  : "Bu filtrda savollar topilmadi"}
              </p>
              <button
                type="button"
                onClick={() => setResultsFilter("all")}
                className="mt-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Barcha savollarni ko&apos;rish
              </button>
            </div>
          ) : (
          filteredQuestions.map((q) => {
            const studentAns = (answers[q.id] || "").trim().toLowerCase();
            const correctAns = (q.correct_answer || "").trim().toLowerCase();
            const isCorrect = studentAns && (studentAns === correctAns || (q as any).accepted_answers?.some((a: string) => a.toLowerCase() === studentAns));
            const isUnanswered = !studentAns;
            const isWrong = !isCorrect && !isUnanswered;
            const qPoints = Number(q.points) || (isInternational ? 10 : isOlympiad ? 3.1 : 1);
            const originalIndex = questions.findIndex(item => item.id === q.id);

            return (
              <div
                key={q.id}
                id={`review-q-${q.id}`}
                className={`bg-white/95 dark:bg-slate-900/95 rounded-[24px] sm:rounded-[28px] border border-slate-200/70 dark:border-slate-800 border-l-4 ${
                  isCorrect
                    ? "border-l-emerald-500"
                    : isWrong
                    ? "border-l-rose-500"
                    : "border-l-slate-300 dark:border-l-slate-700"
                } p-4 sm:p-6 space-y-4 shadow-none`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 h-7 rounded-xl font-extrabold text-xs tabular-nums flex items-center justify-center ${
                      isCorrect
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isWrong
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}>
                      Savol #{originalIndex + 1}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                      {isCorrect ? `+${qPoints}` : "0"} / {qPoints} ball
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        <span>To&apos;g&apos;ri</span>
                      </span>
                    )}
                    {isWrong && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle size={12} />
                        <span>Noto&apos;g&apos;ri</span>
                      </span>
                    )}
                    {isUnanswered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
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
                        className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Rasmni kattalashtirish"
                      >
                        <Maximize2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Image (if any) */}
                {q.image_url && (
                  <div
                    onClick={() => {
                      setZoomedImage(q.image_url);
                      setZoomScale(1);
                    }}
                    className="w-full flex items-center justify-center cursor-zoom-in bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <img
                      src={q.image_url}
                      alt={`Savol #${originalIndex + 1}`}
                      className="w-auto max-w-full max-h-[280px] sm:max-h-[420px] rounded-xl object-contain"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="text-[15px] sm:text-[16px] font-semibold text-slate-900 dark:text-slate-100 leading-relaxed overflow-x-auto">
                  <MathRenderer content={q.question_text} />
                </div>

                {/* Options Review */}
                {q.options && typeof q.options === "object" && (
                  <div className="space-y-2 pt-0.5">
                    {Object.entries(q.options).map(([optKey, optVal]) => {
                      const isUserChoice = (answers[q.id] || "").toLowerCase() === optKey.toLowerCase();
                      const isAnswerCorrectKey = (q.correct_answer || "").toLowerCase() === optKey.toLowerCase();

                      let containerStyle = "border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300";
                      let badge = null;

                      if (isUserChoice && isAnswerCorrectKey) {
                        containerStyle = "border-emerald-500/50 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100";
                        badge = (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={13} />
                            <span className="hidden xs:inline">Sizning javobingiz</span>
                            <span className="xs:hidden">To&apos;g&apos;ri</span>
                          </span>
                        );
                      } else if (isUserChoice && !isAnswerCorrectKey) {
                        containerStyle = "border-rose-400/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100";
                        badge = (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0">
                            <XCircle size={13} />
                            <span className="hidden xs:inline">Sizning javobingiz</span>
                            <span className="xs:hidden">Sizniki</span>
                          </span>
                        );
                      } else if (!isUserChoice && isAnswerCorrectKey) {
                        containerStyle = "border-emerald-500/50 border-dashed bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200";
                        badge = (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 size={13} />
                            <span>To&apos;g&apos;ri javob</span>
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl border transition-colors ${containerStyle}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                                isUserChoice && isAnswerCorrectKey
                                  ? "bg-emerald-500 text-white"
                                  : isUserChoice && !isAnswerCorrectKey
                                  ? "bg-rose-500 text-white"
                                  : isAnswerCorrectKey
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-500"
                              }`}
                            >
                              {optKey.toUpperCase()}
                            </div>
                            <div className="text-sm font-medium leading-snug break-words min-w-0 overflow-x-auto">
                              <MathRenderer content={String(optVal || "")} inline />
                            </div>
                          </div>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text input comparison (if no options) */}
                {!q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Sizning javobingiz</span>
                      <span className={`text-sm font-bold break-all ${isCorrect ? "text-emerald-600" : isUnanswered ? "text-slate-400 italic" : "text-rose-500"}`}>
                        {studentAns || "(Javob berilmagan)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">To&apos;g&apos;ri javob</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 break-all">
                        {q.correct_answer}
                      </span>
                    </div>
                  </div>
                )}

                {/* Explanation / Solution (Shop Amber Note style) */}
                {q.explanation && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      <Lightbulb size={14} className="text-amber-500 shrink-0" />
                      <span>Yechim va tushuntirish</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-sans overflow-x-auto">
                      <MathRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>

        {/* Bottom Quick Return Bar */}
        <div className="flex items-center justify-center gap-2.5 pt-2 pb-6">
          <button
            type="button"
            onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/tests')}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>{isInternational ? "SAT" : isOlympiad ? "Milliy sertifikat" : "Testlarga qaytish"}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/results')}
            className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors active:scale-95 cursor-pointer"
          >
            <Trophy size={15} />
            <span>Barcha natijalar</span>
          </button>
        </div>

        {/* Official Promax Certificate / Diploma Modal */}
        {showCertificateModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowCertificateModal(false); }}
            className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-[3px] flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-xl w-full p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4 relative overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award size={17} />
                  </div>
                  <span className="font-extrabold font-fredoka text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    Rasmiy Sertifikat
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Printer size={14} className="shrink-0" />
                    <span>PDF / Chop etish</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
                    aria-label="Yopish"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Official Promax Printable Certificate Canvas */}
              <div className="relative p-6 sm:p-9 rounded-2xl border-2 border-amber-500/35 bg-gradient-to-b from-amber-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/90 text-center space-y-5 overflow-hidden">
                {/* Inner hairline frame */}
                <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-amber-500/20" />

                {/* Decorative Corner Ornaments (SVG) */}
                <svg className="pointer-events-none absolute top-3.5 left-3.5 w-6 h-6 text-amber-500/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12V2h10" />
                </svg>
                <svg className="pointer-events-none absolute top-3.5 right-3.5 w-6 h-6 text-amber-500/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 12V2H12" />
                </svg>
                <svg className="pointer-events-none absolute bottom-3.5 left-3.5 w-6 h-6 text-amber-500/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12v10h10" />
                </svg>
                <svg className="pointer-events-none absolute bottom-3.5 right-3.5 w-6 h-6 text-amber-500/45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 12v10H12" />
                </svg>

                {/* Subtle Center Logo Watermark */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
                  <Image
                    src="/Logo_without_sentence.png"
                    alt=""
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>

                {/* Official Promax Crest & Logo */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                    <Image
                      src="/Logo_without_sentence.png"
                      alt="Promax Education"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-800 dark:text-slate-100">
                      PROMAX <span className="text-amber-500">EDUCATION</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-fredoka uppercase tracking-[0.18em] text-slate-900 dark:text-white pt-1">
                    SERTIFIKAT
                  </h2>
                  <div className="flex items-center gap-2 w-32 justify-center">
                    <span className="h-px flex-1 bg-amber-500/40" />
                    <Sparkles size={12} className="text-amber-500" />
                    <span className="h-px flex-1 bg-amber-500/40" />
                  </div>
                </div>

                <p className="relative z-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Ushbu rasmiy sertifikat quyidagi ishtirokchiga yuqori bilimi va muvaffaqiyatli natijasi uchun taqdim etildi:
                </p>

                {/* Recipient Name */}
                <div className="relative z-10 py-2 border-b-2 border-amber-500/35 max-w-xs mx-auto">
                  <span className="text-2xl sm:text-3xl font-black font-fredoka text-brand-blue dark:text-blue-400 tracking-tight">
                    {studentDisplayName}
                  </span>
                </div>

                {/* Exam Title & Crisp Tier Badges (zero OS emojis) */}
                <div className="relative z-10 space-y-2.5">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <strong className="text-slate-900 dark:text-white">&ldquo;{test.title}&rdquo;</strong> sinovida muvaffaqiyatli ishtirok etib,
                  </p>
                  <div className="inline-flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold tabular-nums">
                      <CheckCircle2 size={13} />
                      <span>{calculatedSummary.totalScore} / {calculatedSummary.maxScore} ball ({calculatedSummary.percentage}%)</span>
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold ${
                      calculatedSummary.percentage >= 90
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        : calculatedSummary.percentage >= 75
                        ? "bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                        : "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25"
                    }`}>
                      <Award size={13} />
                      <span>
                        {calculatedSummary.percentage >= 90
                          ? "Oltin Daraja"
                          : calculatedSummary.percentage >= 75
                          ? "Kumush Daraja"
                          : "Bronza Daraja"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Official Footer: Date + Verified Seal + Certificate ID */}
                <div className="relative z-10 pt-5 mt-2 flex items-end justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-200/70 dark:border-slate-800">
                  <div className="text-left">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sana</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date().getDate()}-{["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"][new Date().getMonth()]}, {new Date().getFullYear()}
                    </span>
                  </div>

                  {/* Verified Seal */}
                  <div className="flex flex-col items-center gap-0.5 text-brand-blue dark:text-blue-400">
                    <div className="w-9 h-9 rounded-full bg-brand-blue/10 border border-brand-blue/25 flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Tasdiqlangan</span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sertifikat ID</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      PMX-{String(testId).slice(0, 5).toUpperCase()}-{calculatedSummary.percentage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <>
      <TestStartReveal
        isLoading={loading}
        title={test?.title}
        modeLabel={revealModeLabel}
      />

      {!loading && test && currentQuestion && (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans bg-transparent pb-24 md:pb-0">

      {showDetailedResults && calculatedSummary ? (
        renderDetailedResults()
      ) : (
        <>
          {/* Floating Header Island */}
          <div className="fixed top-3 left-3.5 right-3.5 md:left-auto md:right-1/2 md:translate-x-1/2 md:w-full md:max-w-4xl z-50 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-[24px] p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] pointer-events-auto flex flex-col gap-2 transition-all">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => router.push(isInternational ? '/dashboard/international' : isOlympiad ? '/dashboard/olympiads' : '/dashboard/tests')}
                    className="w-9 h-9 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-colors cursor-pointer"
                    title="Chiqish"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <span className="h-9 px-3 shrink-0 rounded-full bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center text-xs font-extrabold tabular-nums">
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <div className="truncate hidden sm:flex items-center gap-2 min-w-0">
                    {isInternational && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Globe size={11} />
                        {tournamentData?.categoryLabel || "SAT"}
                      </span>
                    )}
                    {isOlympiad && !isInternational && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Trophy size={11} />
                        {tournamentData?.subject || "Milliy sertifikat"}
                      </span>
                    )}
                    {isPracticeMode && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <RotateCcw size={10} />
                        Mashq
                      </span>
                    )}
                    <h1 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      {test.title}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* SAT / Math Reference Sheet Trigger Button */}
                  {(isInternational || test.subject?.toLowerCase().includes("matematika") || test.subject?.toLowerCase().includes("math") || test.subject?.toLowerCase().includes("sat")) && (
                    <button
                      type="button"
                      onClick={() => setShowFormulaModal(true)}
                      className="h-9 px-2.5 sm:px-3 rounded-full bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 group"
                      title="Formulalar to'plami"
                    >
                      <span className="font-serif italic font-black text-xs">fx</span>
                      <span className="font-bold text-xs hidden xs:inline">Formulalar</span>
                    </button>
                  )}

                  {autoSaving && (
                    <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-2">
                      <Save size={14} className="animate-pulse text-brand-blue" />
                      <span>{t('tests.take.saving')}</span>
                    </div>
                  )}

                  {timeRemaining !== null && (
                    <div className={`h-9 flex items-center gap-1.5 px-3 bg-slate-100 dark:bg-slate-800 rounded-full font-mono text-xs sm:text-sm font-extrabold tabular-nums ${getTimerColor()}`}>
                      <Clock size={14} />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={submitting}
                    className="hidden md:flex h-9 items-center gap-1.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-white rounded-full font-bold transition-all shadow-sm text-xs cursor-pointer"
                  >
                    <Send size={14} />
                    <span>{submitting ? "..." : "Yakunlash"}</span>
                  </button>
                </div>
              </div>

              {/* Synced hairline progress bar */}
              <div className="px-1.5 pb-0.5 w-full">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-blue to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-24 sm:pt-28 pb-28 md:pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

              {/* ── QUESTION DISPLAY ── */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[28px] border border-white/80 dark:border-slate-800 p-5 sm:p-7 shadow-none">
                  {/* Editorial Question Header */}
                  <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="px-3 h-8 flex items-center justify-center bg-brand-blue/10 text-brand-blue dark:text-blue-400 rounded-xl font-extrabold text-xs tabular-nums">
                        Savol #{currentQuestionIndex + 1}
                      </span>
                      <span className="px-2.5 h-8 flex items-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold tabular-nums">
                        {t('tests.take.points', { points: currentQuestion.points })}
                      </span>
                      {answers[currentQuestion.id] && (
                        <span className="hidden xs:inline-flex items-center gap-1 px-2.5 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 size={13} />
                          Belgilandi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {currentQuestion.image_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setZoomedImage(currentQuestion.image_url);
                            setZoomScale(1);
                          }}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                          title="Rasmni kattalashtirib ko'rish"
                        >
                          <Maximize2 size={16} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMarkForReview(currentQuestion.id)}
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer ${
                          markedForReview.has(currentQuestion.id)
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                        title={markedForReview.has(currentQuestion.id) ? t('tests.take.marked') : t('tests.take.mark')}
                      >
                        <Flag size={16} className={markedForReview.has(currentQuestion.id) ? "fill-amber-500/30" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Question Image */}
                  {currentQuestion.image_url && (
                    <div className="mb-5">
                      <div
                        onClick={() => {
                          setZoomedImage(currentQuestion.image_url);
                          setZoomScale(1);
                        }}
                        className="w-full flex items-center justify-center cursor-zoom-in group bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800"
                        title="Kattalashtirib ko'rish uchun bosing"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentQuestion.image_url}
                          alt="Savol rasmi"
                          className="w-auto max-w-full max-h-[540px] sm:max-h-[680px] rounded-xl object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="mb-6">
                    <div className="text-[16px] sm:text-[18px] font-semibold text-slate-900 dark:text-slate-100 leading-relaxed overflow-x-auto">
                      <MathRenderer content={currentQuestion.question_text} />
                    </div>
                  </div>

                  {/* Modern Tactile Answer Options */}
                  <div className="flex flex-col gap-2.5">
                    {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                      <>
                        {Object.entries(currentQuestion.options).map(([key, value]) => {
                          const isSelected = answers[currentQuestion.id] === key;
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border active:scale-[0.99] ${
                                isSelected
                                  ? "border-brand-blue bg-brand-blue/[0.06] dark:bg-brand-blue/15 ring-1 ring-brand-blue/20"
                                  : "border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs uppercase transition-colors ${
                                  isSelected
                                    ? "bg-brand-blue text-white"
                                    : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                {key}
                              </div>
                              <input
                                type="radio"
                                name={currentQuestion.id}
                                value={key}
                                checked={isSelected}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                className="hidden"
                              />
                              <div className="flex-1 text-sm sm:text-[15px] min-w-0 overflow-x-auto">
                                <span className={`font-medium leading-snug ${isSelected ? "text-slate-900 dark:text-white font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
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
                              className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border active:scale-[0.99] ${
                                isSelected
                                  ? "border-brand-blue bg-brand-blue/[0.06] dark:bg-brand-blue/15 ring-1 ring-brand-blue/20"
                                  : "border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs transition-colors ${
                                    isSelected
                                      ? "bg-brand-blue text-white"
                                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500"
                                  }`}
                                >
                                  {option === "true" ? "T" : "F"}
                                </div>
                                <input
                                  type="radio"
                                  name={currentQuestion.id}
                                  value={option}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                  className="hidden"
                                />
                                <span className={`font-bold text-sm sm:text-[15px] ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                  {option === "true" ? t('tests.take.true') : t('tests.take.false')}
                                </span>
                              </div>
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
 className="px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold flex items-center gap-2 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-none cursor-pointer"
 >
 <ArrowLeft size={18} />
 {t('tests.take.prev')}
 </button>

 {/* Keyboard Shortcuts Hint Bar */}
 <div className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-full bg-white/75 dark:bg-slate-900/75 border border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 select-none">
   <span className="flex items-center gap-1">
     <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">←</kbd>
     <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">→</kbd>
     <span>Savollar</span>
   </span>
   <span>•</span>
   <span className="flex items-center gap-1">
     <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">A–D</kbd>
     <span>Variant</span>
   </span>
   <span>•</span>
   <span className="flex items-center gap-1">
     <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">F</kbd>
     <span>Belgilash</span>
   </span>
 </div>

 {currentQuestionIndex === questions.length - 1 ? (
 <button
 onClick={handleSubmitClick}
 disabled={submitting}
 className="px-7 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-none cursor-pointer"
 >
 <Send size={17} />
 {submitting ? t('tests.take.submitting') : t('tests.take.finish')}
 </button>
 ) : (
 <button
 onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev+ 1))}
 className="px-7 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 active:scale-[0.98] transition-all shadow-none cursor-pointer"
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
 <div className="hidden lg:flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[28px] border border-white/80 dark:border-slate-800 p-5 sticky top-28 shadow-none">
 <div className="flex items-center justify-between mb-4">
   <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white tracking-tight">{t('tests.take.questions_list')}</h3>
   <span className="text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
     {Object.keys(answers).length} / {questions.length}
   </span>
 </div>
 <div className="grid grid-cols-4 gap-2">
 {questions.map((q, index) => {
 const isAnswered = !!answers[q.id];
 const isMarked = markedForReview.has(q.id);
 const isCurrent = index === currentQuestionIndex;

 let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 border-transparent";
 if (isCurrent) {
 btnClass = "bg-brand-blue text-white border-brand-blue";
 } else if (isMarked) {
 btnClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25";
 } else if (isAnswered) {
 btnClass = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
 }

 return (
 <button
 key={q.id}
 type="button"
 onClick={() => setCurrentQuestionIndex(index)}
 className={`aspect-square rounded-xl font-extrabold text-[13px] tabular-nums flex items-center justify-center transition-all border active:scale-95 cursor-pointer ${btnClass}`}
 >
 {index+ 1}
 </button>
 );
 })}
 </div>

 {/* Legend */}
 <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
 <div className="flex items-center gap-2.5">
 <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
 <span>{t('tests.take.status.answered')}</span>
 </div>
 <div className="flex items-center gap-2.5">
 <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0" />
 <span>{t('tests.take.status.marked')}</span>
 </div>
 <div className="flex items-center gap-2.5">
 <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full shrink-0" />
 <span>{t('tests.take.status.no_answer')}</span>
 </div>
 </div>
 </div>

 {/* Mobile Horizontal Question Navigator (hidden when only 1 question) */}
 {questions.length > 1 && (
 <div className="lg:hidden mt-2 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[24px] border border-white/80 dark:border-slate-800 p-3.5 shadow-none">
 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
 {questions.map((q, index) => {
 const isAnswered = !!answers[q.id];
 const isMarked = markedForReview.has(q.id);
 const isCurrent = index === currentQuestionIndex;

 let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
 if (isCurrent) btnClass = "bg-brand-blue text-white";
 else if (isMarked) btnClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25";
 else if (isAnswered) btnClass = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";

 return (
 <button
 key={q.id}
 type="button"
 onClick={() => setCurrentQuestionIndex(index)}
 className={`shrink-0 w-10 h-10 rounded-xl font-extrabold text-xs tabular-nums flex items-center justify-center transition-all cursor-pointer active:scale-95 ${btnClass}`}
 >
 {index + 1}
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

  {/* ── SAT / MATH FORMULA REFERENCE SHEET MODAL ── */}
  {showFormulaModal && (
    <div
      onClick={() => setShowFormulaModal(false)}
      className="fixed inset-0 bg-slate-950/55 backdrop-blur-[3px] flex items-center justify-center z-[60] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-7 max-w-lg w-full border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
      >
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

 {/* ── CONFIRMATION SHEET (Do'kon / Streak style) ── */}
 {showConfirmModal && (
 <div
   onClick={(e) => { if (e.target === e.currentTarget && !submitting) setShowConfirmModal(false); }}
   className="fixed inset-0 bg-slate-950/55 backdrop-blur-[3px] flex items-end sm:items-center justify-center z-[150] sm:p-4"
 >
 <div className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl overflow-hidden">
 <div className="px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2">
   <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
   <div className="flex items-center justify-between">
     <div className="flex items-center gap-2.5">
       <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
         <AlertCircle size={18} />
       </div>
       <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-fredoka">Testni yakunlash</h3>
     </div>
     <button
       type="button"
       onClick={() => setShowConfirmModal(false)}
       disabled={submitting}
       className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
     >
       <X size={16} />
     </button>
   </div>
 </div>

 <div className="p-6 space-y-4">
 <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
 Siz <span className="font-extrabold text-brand-blue px-2 py-0.5 bg-brand-blue/10 rounded-lg mx-0.5 tabular-nums">{Object.keys(answers).length}/{questions.length}</span> ta savolga javob berdingiz.
 </p>
 {Object.keys(answers).length < questions.length && (
 <div className="flex flex-col gap-2 p-3.5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200/60 dark:border-amber-500/20">
   <div className="flex items-start gap-2.5">
     <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
     <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
       <strong className="font-bold">{questions.length - Object.keys(answers).length}</strong> ta savol javobsiz qoldi! Ishonchingiz komil bo&apos;lsa, yakunlashingiz mumkin.
     </p>
   </div>
   <button
     type="button"
     onClick={() => {
       const firstUnansweredIdx = questions.findIndex((q) => !answers[q.id]);
       if (firstUnansweredIdx !== -1) {
         setCurrentQuestionIndex(firstUnansweredIdx);
         setShowConfirmModal(false);
       }
     }}
     className="self-start text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline cursor-pointer ml-6"
   >
     Javobsiz savolga o&apos;tish →
   </button>
 </div>
 )}
 {markedForReview.size > 0 && (
 <div className="flex items-center justify-between gap-3 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/40">
   <div className="flex items-center gap-2 text-xs text-brand-blue font-semibold">
     <Flag size={15} className="fill-brand-blue/20 shrink-0" />
     <span>{markedForReview.size} ta savol belgilangan</span>
   </div>
   <button
     type="button"
     onClick={() => {
       const firstMarkedIdx = questions.findIndex((q) => markedForReview.has(q.id));
       if (firstMarkedIdx !== -1) {
         setCurrentQuestionIndex(firstMarkedIdx);
         setShowConfirmModal(false);
       }
     }}
     className="text-xs font-bold text-brand-blue underline hover:no-underline shrink-0 cursor-pointer"
   >
     Ko&apos;rish →
   </button>
 </div>
 )}
 <p className="text-xs text-slate-400 font-medium">
 Testni yakunlagandan keyin qayta tahrirlash imkoniyati bo&apos;lmaydi.
 </p>

 <div className="flex gap-2.5 pt-1">
 <button
   type="button"
   onClick={handleConfirmSubmit}
   disabled={submitting}
   className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
 >
   <CheckCircle size={16} />
   <span>{submitting ? "Yuklanmoqda..." : "Yakunlash"}</span>
 </button>
 <button
   type="button"
   onClick={() => setShowConfirmModal(false)}
   disabled={submitting}
   className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
 >
   Bekor qilish
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ── MOBILE FLOATING BOTTOM NAVIGATION ── */}
 <div className="md:hidden fixed bottom-4 left-3.5 right-3.5 z-50 pointer-events-none">
 <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800 rounded-full p-1.5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.4)] pointer-events-auto flex items-center justify-between gap-2 max-w-sm mx-auto safe-area-pb">
 <button
 type="button"
 onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
 disabled={currentQuestionIndex === 0}
 className="w-11 h-11 flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
 >
 <ArrowLeft size={18} />
 </button>

 {currentQuestionIndex === questions.length - 1 ? (
 <button
 type="button"
 onClick={handleSubmitClick}
 disabled={submitting}
 className="flex-1 h-11 px-5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
 >
 <Send size={15} />
 <span className="text-sm">{submitting ? "..." : "Yakunlash"}</span>
 </button>
 ) : (
 <button
 type="button"
 onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
 className="flex-1 h-11 px-5 bg-brand-blue hover:bg-blue-600 active:scale-95 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
 >
 <span className="text-sm">Keyingi</span>
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

      {/* ── PROMAX SIGNATURE OMR GRADING SCANNER OVERLAY ── */}
      <AnimatePresence>
        {isCheckingResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-[3px] select-none"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity" }}
              className="relative w-full max-w-[330px] sm:max-w-sm bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              {/* Top Header Strip */}
              <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 shrink-0">
                    <Image
                      src="/Logo_without_sentence.png"
                      alt="Promax"
                      width={24}
                      height={24}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-extrabold tracking-[0.16em] text-brand-blue uppercase">
                    OPTIK TEKSHIRUV
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider">
                  PROMAX
                </span>
              </div>

              {/* OMR Optical Scanner Sheet (3 graded rows + sweeping laser beam) */}
              <div className="relative w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3.5 mb-5 overflow-hidden">
                {/* Sweeping Optical Scan Beam */}
                <motion.div
                  initial={{ y: -8 }}
                  animate={{ y: 102 }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                  style={{ willChange: "transform" }}
                  className="pointer-events-none absolute left-0 right-0 top-0 h-7 bg-gradient-to-b from-brand-blue/0 via-brand-blue/15 to-brand-blue/0 border-b border-brand-blue/50 z-10"
                />

                <div className="space-y-2.5 relative z-0">
                  {[
                    { num: "01", activeCol: 1, delay: 0.15 },
                    { num: "02", activeCol: 3, delay: 0.45 },
                    { num: "03", activeCol: 0, delay: 0.75 },
                  ].map((row) => (
                    <div key={row.num} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-extrabold text-slate-400 w-5 text-left">
                        {row.num}
                      </span>
                      <div className="flex items-center gap-2 flex-1 justify-center">
                        {["A", "B", "C", "D"].map((letter, idx) => {
                          const isFilled = idx === row.activeCol;
                          return (
                            <span
                              key={letter}
                              className={`w-6 h-6 rounded-full text-[10px] font-extrabold flex items-center justify-center border ${
                                isFilled
                                  ? row.num === "02"
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "bg-brand-blue border-brand-blue text-white"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900"
                              }`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: row.delay, duration: 0.2 }}
                        className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                      >
                        <CheckCircle size={12} strokeWidth={2.5} />
                      </motion.span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-1">
                <h3 className="font-fredoka text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  Natijalar hisoblanmoqda
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Javoblaringiz tekshirilmoqda, iltimos kuting...
                </p>
              </div>

              {/* GPU-composited scaleX Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                <motion.div
                  className="h-full w-full origin-left bg-gradient-to-r from-brand-blue to-amber-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 </div>
      )}
    </>
 );
}
