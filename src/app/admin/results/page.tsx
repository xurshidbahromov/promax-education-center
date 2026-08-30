'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ArrowLeft,
  Users,
  LayoutGrid,
  List,
  Layers,
  ArrowUpDown,
  Send,
  Loader2
} from 'lucide-react';
import { useAllResults, useExamsList } from '@/hooks/useAdminData';
import { exportStudentResults } from '@/lib/excel-export';
import { deleteResult, createMockExam, deleteExam } from '@/lib/admin-queries';
import { sendDTMResultToStudentAndParents } from '@/lib/notifications-bridge';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ExamGroupSummary {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  results: any[];
  totalParticipants: number;
  avgScore: number;
  topScore: number;
  topStudentName: string;
  passedGrantCount: number;
  passedContractCount: number;
}

// ── SKELETON LOADERS ──
function ResultsGridSkeleton() {
  return (
    <div className="space-y-12 animate-pulse pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-48 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
              <div className="h-4 w-16 rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="h-2 w-full rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="h-3 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamStudentsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-slate-200/80 dark:bg-slate-800/80 rounded-md" />
              <div className="h-3 w-32 bg-slate-200/60 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-8 w-24 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeExamTitle = searchParams.get('exam');

  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'exams' | 'table'>('exams');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'participants_desc' | 'avg_desc' | 'top_desc'>('date_desc');
  const [isExporting, setIsExporting] = useState(false);

  // New Mock Exam Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDate, setNewExamDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newExamMaxScore, setNewExamMaxScore] = useState(189);
  const [isCreatingExam, setIsCreatingExam] = useState(false);

  // Batch Publish / Broadcast Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0 });

  const queryClient = useQueryClient();
  const { data: resultsData, isLoading: loadingResults } = useAllResults(500);
  const { data: examsData, isLoading: loadingExams } = useExamsList();

  const results = resultsData || [];
  const examsList = examsData || [];
  const loading = loadingResults || loadingExams;

  // Global KPI Summary
  const summaryStats = useMemo(() => {
    if (results.length === 0) return { total: 0, avgScore: 0, passedCount: 0, topScore: 0 };

    const total = results.length;
    let sumScore = 0;
    let passed = 0;
    let max = 0;

    results.forEach((r) => {
      const score = Number(r.total_score || r.score) || 0;
      sumScore += score;
      if (score > max) max = score;
      if (score >= 107.1) passed++;
    });

    return {
      total,
      avgScore: (sumScore / total).toFixed(1),
      passedCount: passed,
      topScore: max.toFixed(1),
    };
  }, [results]);

  // Group Results by Exam (Title + Date)
  const examSummaries = useMemo(() => {
    const examMap = new Map<string, ExamGroupSummary>();

    // 1. Initialize from examsList table so empty exams also appear
    examsList.forEach((e: any) => {
      const examTitle = e.title || 'DTM Mock Test';
      const examDate = e.date || 'Sana yo\'q';
      const examKey = `${examTitle}___${examDate}`;

      examMap.set(examKey, {
        id: e.id,
        title: examTitle,
        date: examDate,
        maxScore: e.max_score || 189,
        results: [],
        totalParticipants: 0,
        avgScore: 0,
        topScore: 0,
        topStudentName: '',
        passedGrantCount: 0,
        passedContractCount: 0,
      });
    });

    // 2. Populate results into exams
    results.forEach((r) => {
      const examTitle = r.exam?.title || 'Umumiy DTM Mock Test';
      const examDate = r.exam?.date || (r.created_at ? r.created_at.split('T')[0] : 'Sana yo\'q');
      const examKey = `${examTitle}___${examDate}`;

      if (!examMap.has(examKey)) {
        examMap.set(examKey, {
          id: r.exam?.id || examKey,
          title: examTitle,
          date: examDate,
          maxScore: 189,
          results: [],
          totalParticipants: 0,
          avgScore: 0,
          topScore: 0,
          topStudentName: '',
          passedGrantCount: 0,
          passedContractCount: 0,
        });
      }

      const ex = examMap.get(examKey)!;
      ex.results.push(r);
    });

    // 3. Compute stats for each exam group
    const list: ExamGroupSummary[] = [];
    examMap.forEach((ex) => {
      // Sort results by total_score descending
      ex.results.sort((a, b) => (Number(b.total_score || b.score) || 0) - (Number(a.total_score || a.score) || 0));

      const count = ex.results.length;
      let sum = 0;
      let top = 0;
      let topName = '';
      let grants = 0;
      let contracts = 0;

      ex.results.forEach((r) => {
        const score = Number(r.total_score || r.score) || 0;
        sum += score;
        if (score > top) {
          top = score;
          topName = r.student?.full_name || 'Top O\'quvchi';
        }
        if (score >= 150) grants++;
        else if (score >= 107.1) contracts++;
      });

      ex.totalParticipants = count;
      ex.avgScore = count > 0 ? Number((sum / count).toFixed(1)) : 0;
      ex.topScore = Number(top.toFixed(1));
      ex.topStudentName = topName;
      ex.passedGrantCount = grants;
      ex.passedContractCount = contracts;

      list.push(ex);
    });

    return list;
  }, [examsList, results]);

  // Active Exam Group
  const activeExam = useMemo(() => {
    if (!activeExamTitle) return null;
    return examSummaries.find((ex) => ex.title === activeExamTitle) || null;
  }, [examSummaries, activeExamTitle]);

  // Directions list for active exam
  const activeExamDirections = useMemo(() => {
    if (!activeExam) return [];
    const dirs = new Set<string>();
    activeExam.results.forEach((r) => {
      const dirTitle = r.direction?.title;
      if (dirTitle) dirs.add(dirTitle);
    });
    return Array.from(dirs);
  }, [activeExam]);

  // Active Exam Filtered Students
  const activeExamFilteredResults = useMemo(() => {
    if (!activeExam) return [];
    return activeExam.results.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        (r.student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.student?.phone || '').includes(searchTerm) ||
        (r.direction?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDirection = directionFilter === 'all' || r.direction?.title === directionFilter;

      return matchesSearch && matchesDirection;
    });
  }, [activeExam, searchTerm, directionFilter]);

  // Global Flat Filtered Results (For Table Mode)
  const flatFilteredResults = useMemo(() => {
    return results.filter((r) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (r.student?.full_name || '').toLowerCase().includes(q) ||
        (r.student?.phone || '').includes(q) ||
        (r.exam?.title || '').toLowerCase().includes(q) ||
        (r.direction?.title || '').toLowerCase().includes(q)
      );
    });
  }, [results, searchTerm]);

  // Handlers
  const handleOpenExam = (examTitle: string) => {
    router.push(`/admin/results?exam=${encodeURIComponent(examTitle)}`);
  };

  const handleBackToExams = () => {
    router.push('/admin/results');
  };

  const handleCreateMockExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) {
      toast.error("Mock test nomini kiriting!");
      return;
    }

    setIsCreatingExam(true);
    try {
      const res = await createMockExam(newExamTitle.trim(), newExamDate, newExamMaxScore);
      if (res.success) {
        toast.success("Yangi Mock test muvaffaqiyatli yaratildi!");
        queryClient.invalidateQueries({ queryKey: ['examsList'] });
        queryClient.invalidateQueries({ queryKey: ['allResults'] });
        setCreateModalOpen(false);
        setNewExamTitle('');
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (err: any) {
      toast.error("Mock test yaratishda xatolik: " + err.message);
    } finally {
      setIsCreatingExam(false);
    }
  };

  const handleDeleteMockExam = async (examId: string, title: string) => {
    if (!window.confirm(`"${title}" mock testini va uning barcha natijalarini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const res = await deleteExam(examId, title);
      if (res.success) {
        toast.success("Mock test muvaffaqiyatli o'chirildi!");
        queryClient.invalidateQueries({ queryKey: ['examsList'] });
        queryClient.invalidateQueries({ queryKey: ['allResults'] });
        router.push('/admin/results');
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (err: any) {
      toast.error("O'chirishda xatolik: " + err.message);
    }
  };

  // Broadcast DTM Exam Results to All Students with exact ranks
  const handleBroadcastExamResults = async () => {
    if (!activeExam || activeExam.results.length === 0) {
      toast.error("E'lon qilish uchun o'quvchilar natijalari yo'q");
      return;
    }

    setIsPublishing(true);
    const total = activeExam.results.length;
    setPublishProgress({ current: 0, total });

    try {
      for (let i = 0; i < total; i++) {
        const r = activeExam.results[i];
        const rank = i + 1;
        const totalScore = Number(r.total_score || r.score) || 0;

        await sendDTMResultToStudentAndParents({
          studentId: r.student_id || r.student?.id,
          examTitle: activeExam.title,
          examDate: activeExam.date,
          directionCode: r.direction?.code,
          directionTitle: r.direction?.title,
          rank: rank,
          totalParticipants: total,
          scores: {
            total: totalScore,
            comp_math: Number(r.compulsory_math_score) || 0,
            comp_history: Number(r.compulsory_history_score) || 0,
            comp_lang: Number(r.compulsory_lang_score) || 0,
            subject_1: Number(r.subject_1_score) || 0,
            subject_2: Number(r.subject_2_score) || 0,
          },
        });

        setPublishProgress({ current: i + 1, total });
      }

      toast.success(`Barcha ${total} nafar o'quvchi va ota-onalarga natijalar reyting o'rinlari bilan birga yetkazildi!`);
      setPublishModalOpen(false);
    } catch (error: any) {
      console.error('Broadcast error:', error);
      toast.error("Xabarnomalarni yuborishda xatolik yuz berdi");
    } finally {
      setIsPublishing(false);
    }
  };

  // Send single student notification
  const handleSendIndividualResult = async (result: any, rank: number, total: number) => {
    try {
      toast.loading("Xabarnoma yuborilmoqda...", { id: 'single-send' });
      const totalScore = Number(result.total_score || result.score) || 0;

      await sendDTMResultToStudentAndParents({
        studentId: result.student_id || result.student?.id,
        examTitle: activeExam?.title || result.exam?.title,
        examDate: activeExam?.date || result.exam?.date,
        directionCode: result.direction?.code,
        directionTitle: result.direction?.title,
        rank: rank,
        totalParticipants: total,
        scores: {
          total: totalScore,
          comp_math: Number(result.compulsory_math_score) || 0,
          comp_history: Number(result.compulsory_history_score) || 0,
          comp_lang: Number(result.compulsory_lang_score) || 0,
          subject_1: Number(result.subject_1_score) || 0,
          subject_2: Number(result.subject_2_score) || 0,
        },
      });

      toast.success(`${result.student?.full_name || 'O\'quvchi'}ga xabarnoma yuborildi!`, { id: 'single-send' });
    } catch (err: any) {
      toast.error("Xatolik: " + err.message, { id: 'single-send' });
    }
  };

  const handleExport = async (dataset: any[] = flatFilteredResults, filename: string = 'DTM_Natijalari') => {
    if (dataset.length === 0) {
      toast("Export qilish uchun ma'lumot yo'q", { icon: "⚠️" });
      return;
    }

    try {
      setIsExporting(true);
      const exportData = dataset.map((r, idx) => ({
        rank: idx + 1,
        student_name: r.student?.full_name || 'Noma\'lum',
        phone: r.student?.phone || 'N/A',
        test_title: r.exam?.title || 'DTM Mock Test',
        direction: r.direction?.title || 'Yo\'nalishsiz',
        score: Number(r.total_score || r.score) || 0,
        max_score: 189,
        percentage: `${(((Number(r.total_score || r.score) || 0) / 189) * 100).toFixed(1)}%`,
        status: (Number(r.total_score || r.score) || 0) >= 150 ? 'Davlat Granti' : (Number(r.total_score || r.score) || 0) >= 107.1 ? 'Shartnoma' : 'Yetarli emas',
        completed_at: r.exam?.date || (r.created_at ? r.created_at.split('T')[0] : 'N/A'),
      }));

      await exportStudentResults(exportData);
      toast.success(`${dataset.length} ta natija Excel formatida yuklandi`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export qilishda xatolik yuz berdi");
    } finally {
      setIsExporting(false);
    }
  };

  // Full breakdown edit routing
  const handleEditResult = (result: any) => {
    const title = activeExam?.title || result.exam?.title || '';
    const date = activeExam?.date || result.exam?.date || '';
    router.push(`/admin/results/new?editId=${result.id}&examTitle=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}`);
  };

  const handleDeleteResult = async (id: string, studentName: string) => {
    if (!window.confirm(`${studentName} ning natijasini o'chirishni tasdiqlaysizmi?`)) return;

    try {
      const res = await deleteResult(id);
      if (res.success) {
        toast.success("Natija o'chirildi!");
        queryClient.invalidateQueries({ queryKey: ['allResults'] });
      } else {
        toast.error("O'chirishda xatolik: " + res.error);
      }
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 1: DEDICATED EXAM LEADERBOARD & RESULTS SHEET (IMTIHON LEADERBOARDI)
  // ══════════════════════════════════════════════════════════════════════════════
  if (activeExamTitle && activeExam) {
    const passRate = activeExam.totalParticipants > 0
      ? Math.round(((activeExam.passedGrantCount + activeExam.passedContractCount) / activeExam.totalParticipants) * 100)
      : 0;

    return (
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToExams}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2 group text-xs font-bold"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Imtihonlarga qaytish</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Natijalar</span>
              <ChevronRight size={14} />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeExam.title}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Publish & Broadcast Button */}
            {activeExam.totalParticipants > 0 && (
              <button
                onClick={() => setPublishModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
              >
                <Send size={14} />
                <span>Natijalarni e'lon qilish</span>
              </button>
            )}

            <button
              onClick={() => handleExport(activeExamFilteredResults, activeExam.title)}
              disabled={isExporting || activeExamFilteredResults.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
            >
              <Download size={14} className={isExporting ? "animate-bounce" : ""} />
              <span>{isExporting ? "Yuklanmoqda..." : "Excel yuklash"}</span>
            </button>

            <Link
              href={`/admin/results/new?examTitle=${encodeURIComponent(activeExam.title)}&date=${encodeURIComponent(activeExam.date)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 active:scale-95 text-white dark:text-slate-900 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>O'quvchi Natijasini Kiritish</span>
            </Link>

            <button
              onClick={() => handleDeleteMockExam(activeExam.id, activeExam.title)}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 hover:bg-rose-500/10 transition-colors"
              title="Mock testni o'chirish"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Exam Banner Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Award size={24} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                    {activeExam.title}
                  </h1>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    DTM Mock
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Sana: {activeExam.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Users size={13} />
                    <span>{activeExam.totalParticipants} nafar qatnashuvchi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="O'quvchini qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">O'rtacha Ball</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{activeExam.avgScore} <span className="text-xs text-slate-400 font-medium">/ 189</span></span>
              </div>
              <TrendingUp size={18} className="text-purple-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Eng Yuqori Ball</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{activeExam.topScore}</span>
              </div>
              <Award size={18} className="text-amber-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Grant (&gt;150)</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeExam.passedGrantCount} ta</span>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">O'tish ko'rsatkichi</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{passRate}%</span>
              </div>
              <Award size={18} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Direction Filter Pills */}
        {activeExamDirections.length > 0 && (
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                directionFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
              }`}
            >
              Barcha yo'nalishlar ({activeExam.totalParticipants})
            </button>
            {activeExamDirections.map((dir) => {
              const count = activeExam.results.filter((r) => r.direction?.title === dir).length;
              return (
                <button
                  key={dir}
                  onClick={() => setDirectionFilter(dir)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    directionFilter === dir
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{dir}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-extrabold">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Student Results Leaderboard List */}
        {loading ? (
          <ExamStudentsSkeleton />
        ) : activeExamFilteredResults.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <FileText size={36} className="mx-auto opacity-40" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Ushbu Mock Test uchun hali natijalar kiritilmagan</p>
              <p className="text-xs text-slate-400 mt-1">O'quvchilar javoblarini kiritib, reyting shakllantirishni boshlang</p>
            </div>
            <Link
              href={`/admin/results/new?examTitle=${encodeURIComponent(activeExam.title)}&date=${encodeURIComponent(activeExam.date)}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>Birinchi O'quvchi Natijasini Kiritish</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeExamFilteredResults.map((result, index) => {
              const score = Number(result.total_score || result.score) || 0;
              const isGrant = score >= 150;
              const isContract = score >= 107.1 && score < 150;
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const rankFormatted = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;

              return (
                <div
                  key={result.id}
                  className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Clean Premium Rank & Student info */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-sans-pro font-black text-xs shrink-0 transition-colors ${
                        isFirst
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : isSecond
                          ? 'bg-slate-200/90 text-slate-800 dark:bg-slate-700 dark:text-slate-100 font-extrabold'
                          : isThird
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40 font-semibold'
                      }`}
                    >
                      {rankFormatted}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                          {result.student?.full_name || 'Noma\'lum o\'quvchi'}
                        </h3>

                        {isGrant ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Davlat Granti
                          </span>
                        ) : isContract ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            To'lov-Shartnoma
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                            Yetarli emas
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">
                          {result.direction?.title || 'Yo\'nalish belgilanmagan'}
                        </span>
                        {result.student?.phone && (
                          <>
                            <span>•</span>
                            <span>Tel: {result.student.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Breakdown & Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                    {/* Score Breakdown Pill */}
                    <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To'plangan Ball</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-sans-pro">
                          {score} <span className="text-xs font-semibold text-slate-400">/ 189</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Individual Send Telegram Result */}
                      <button
                        onClick={() => handleSendIndividualResult(result, index + 1, activeExam.totalParticipants)}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-colors"
                        title="Ushbu o'quvchiga Telegram xabarnomasini yuborish"
                      >
                        <Send size={15} />
                      </button>

                      {/* Full Form Edit */}
                      <button
                        onClick={() => handleEditResult(result)}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Natijani to'liq tahrirlash"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteResult(result.id, result.student?.full_name || 'O\'quvchi')}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BROADCAST CONFIRMATION MODAL ── */}
        {publishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Send size={16} />
                  </div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                    Natijalarni E'lon Qilish
                  </h3>
                </div>
                {!isPublishing && (
                  <button onClick={() => setPublishModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{activeExam.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Sana: {activeExam.date}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeExam.totalParticipants} nafar o'quvchi</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    📢 Xabarnomalar qanday yuboriladi?
                  </p>
                  <p>
                    Barcha <b>{activeExam.totalParticipants} nafar</b> o'quvchi va ularning ota-onalariga Telegram orqali rasmiy xabarnoma boradi. Har bir o'quvchiga uning <b>umumiy reytingdagi egallagan o'rni (1-{activeExam.totalParticipants})</b>, to'plagan bali va fanlar tahlili bir vaqtda yetkaziladi.
                  </p>
                </div>

                {isPublishing && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>Xabarlar yuborilmoqda...</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{publishProgress.current} / {publishProgress.total}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(publishProgress.current / publishProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {!isPublishing && (
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Bekor qilish
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBroadcastExamResults}
                  disabled={isPublishing || activeExam.totalParticipants === 0}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Yuborilmoqda ({publishProgress.current}/{publishProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Tasdiqlash & Hammaga Yuborish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 2: MASTER EXAMS LIST & STATS OVERVIEW (UMUMIY IMTIHONLAR BOXLARI)
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Imtihon Natijalari
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            DTM va Mock imtihonlari ro'yxati va umumiy tahlili ({examSummaries.length} ta imtihon)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => handleExport()}
            disabled={isExporting || results.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Download size={14} className={isExporting ? "animate-bounce" : ""} />
            <span>{isExporting ? "Yuklanmoqda..." : "Excel ga yuklash"}</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Yangi Mock Test Yaratish</span>
          </button>
        </div>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jami Natijalar", value: `${summaryStats.total} ta`, icon: FileText, color: "text-blue-500" },
          { label: "O'rtacha Ball", value: `${summaryStats.avgScore} ball`, icon: TrendingUp, color: "text-purple-500" },
          { label: "O'tish Balli (>56.6%)", value: `${summaryStats.passedCount} ta`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Eng Yuqori Ball", value: `${summaryStats.topScore} ball`, icon: Award, color: "text-amber-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">{stat.value}</p>
            </div>
            <stat.icon size={26} className={`${stat.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH, SORT & VIEW SWITCHER ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Imtihon, o'quvchi yoki yo'nalish nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="date_desc">Sanasi (Eng yangi)</option>
            <option value="date_asc">Sanasi (Eng eski)</option>
            <option value="participants_desc">Qatnashuvchilar (ko'pdan kamga)</option>
            <option value="avg_desc">O'rtacha ball (yuqoridan pastga)</option>
            <option value="top_desc">Eng yuqori ball (yuqoridan pastga)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
          <button
            onClick={() => setViewMode('exams')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'exams'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Imtihonlar bo'yicha ko'rinish"
          >
            <LayoutGrid size={15} />
            <span className="hidden md:inline">Imtihonlar</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Barcha natijalar jadvali"
          >
            <List size={15} />
            <span className="hidden md:inline">Barcha Natijalar</span>
          </button>
        </div>
      </div>

      {/* ── MODE 1: EXAMS CARDS GRID (DEFAULT) ── */}
      {viewMode === 'exams' ? (
        loading ? (
          <ResultsGridSkeleton />
        ) : examSummaries.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Award size={36} className="mx-auto opacity-40" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hozircha hech qanday Mock test yaratilmagan</p>
              <p className="text-xs text-slate-400 mt-1">Yangi imtihon boxini yaratib, o'quvchilar natijalarini kiritishni boshlang</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>Birinchi Mock Testni Yaratish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
            {examSummaries
              .filter((ex) => {
                if (!searchTerm) return true;
                const q = searchTerm.toLowerCase();
                return (
                  ex.title.toLowerCase().includes(q) ||
                  ex.date.includes(q) ||
                  ex.results.some((r) => (r.student?.full_name || '').toLowerCase().includes(q))
                );
              })
              .sort((a, b) => {
                if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
                if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
                if (sortBy === 'participants_desc') return b.totalParticipants - a.totalParticipants;
                if (sortBy === 'avg_desc') return b.avgScore - a.avgScore;
                if (sortBy === 'top_desc') return b.topScore - a.topScore;
                return 0;
              })
              .map((ex) => {
                const passRate = ex.totalParticipants > 0
                  ? Math.round(((ex.passedGrantCount + ex.passedContractCount) / ex.totalParticipants) * 100)
                  : 0;

                return (
                  <div
                    key={ex.id}
                    onClick={() => handleOpenExam(ex.title)}
                    className="group relative p-5 rounded-3xl cursor-pointer transition-colors duration-150 flex flex-col justify-between gap-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-xl active:scale-[0.99]"
                  >
                    {/* Top Badges & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        <Award size={12} />
                        <span>DTM Mock</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMockExam(ex.id, ex.title);
                          }}
                          className="p-1 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Mock testni o'chirish"
                        >
                          <Trash2 size={14} />
                        </button>

                        <span className="text-[11px] font-bold text-slate-400 transition-colors flex items-center gap-0.5">
                          <span>{ex.totalParticipants > 0 ? 'Natijalar' : 'Kiritish'}</span>
                          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>

                    {/* Exam Title & Date */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors line-clamp-1 font-sans-pro">
                        {ex.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{ex.date}</span>
                      </p>
                    </div>

                    {/* Bottom Stats */}
                    <div className="space-y-2 pt-2 border-t border-slate-100/80 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 dark:text-slate-400">
                          {ex.totalParticipants > 0 ? `O'rtacha: ${ex.avgScore} b` : 'Hali natijalar yo\'q'}
                        </span>
                        {ex.totalParticipants > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">Top: {ex.topScore}</span>
                        )}
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(passRate, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                          <Users size={12} className="text-emerald-500" />
                          <span>{ex.totalParticipants} nafar o'quvchi</span>
                        </span>
                        {ex.totalParticipants > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {passRate}% o'tish
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Yangi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )
      ) : (
        /* ── MODE 2: FLAT ALL RESULTS TABLE ── */
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
              ))}
            </div>
          ) : flatFilteredResults.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Hech qanday natija topilmadi</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">O'quvchi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sana / Imtihon</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Yo'nalish</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">To'plangan Ball</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {flatFilteredResults.map((result) => {
                    const score = Number(result.total_score || result.score) || 0;
                    const isGrant = score >= 150;
                    const isContract = score >= 107.1 && score < 150;

                    return (
                      <tr key={result.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                              {(result.student?.full_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{result.student?.full_name || 'Noma\'lum'}</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{result.student?.phone || 'Raqam yo\'q'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{result.exam?.title || 'DTM Mock'}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{result.exam?.date || (result.created_at ? result.created_at.split('T')[0] : 'N/A')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{result.direction?.title || 'Yo\'nalishsiz'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-sans-pro">
                            {score} <span className="text-xs text-slate-400 font-normal">/ 189</span>
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {isGrant ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              <span>Grant</span>
                            </span>
                          ) : isContract ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                              <span>Shartnoma</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                              Yetarli emas
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditResult(result)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Natijani to'liq tahrirlash"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteResult(result.id, result.student?.full_name || 'O\'quvchi')}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                              title="O'chirish"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE NEW MOCK EXAM MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Yangi Mock Test Yaratish
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMockExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Imtihon Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 24-Avgust DTM Mock Test #5"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  O'tkazilish Sanasi *
                </label>
                <input
                  type="date"
                  required
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Maksimal Ball
                </label>
                <input
                  type="number"
                  disabled
                  value={newExamMaxScore}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isCreatingExam || !newExamTitle.trim()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus size={15} />
                  <span>{isCreatingExam ? 'Yaratilmoqda...' : 'Mock Testni Yaratish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsListPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="h-10 w-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl animate-pulse" />
        <ResultsGridSkeleton />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
