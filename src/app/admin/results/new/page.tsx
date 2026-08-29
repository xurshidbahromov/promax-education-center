'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  Search,
  Plus,
  Save,
  Calculator,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  Award,
  Sparkles,
  Send
} from 'lucide-react';
import directionsData from '@/data/dtm_directions.json';
import { getStudents, saveExamResult, type Student } from '@/lib/admin-queries';
import { sendDTMResultToStudentAndParents } from '@/lib/notifications-bridge';
import Link from 'next/link';
import toast from 'react-hot-toast';

function NewResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramExamTitle = searchParams.get('examTitle') || '';
  const paramExamDate = searchParams.get('date') || '';

  // Form State
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDirectionCode, setSelectedDirectionCode] = useState(directionsData[0].code);
  const [examTitle, setExamTitle] = useState(paramExamTitle || 'DTM Mock Test');
  const [examDate, setExamDate] = useState(paramExamDate || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Update from params if available
  useEffect(() => {
    if (paramExamTitle) setExamTitle(paramExamTitle);
    if (paramExamDate) setExamDate(paramExamDate);
  }, [paramExamTitle, paramExamDate]);

  // Answers State (Number of correct answers)
  const [answers, setAnswers] = useState({
    comp_math: 0, // Max 10
    comp_history: 0, // Max 10
    comp_lang: 0, // Max 10
    subject_1: 0, // Max 30
    subject_2: 0, // Max 30
  });

  // Derived State
  const currentDirection = useMemo(
    () => directionsData.find((d) => d.code === selectedDirectionCode) || directionsData[0],
    [selectedDirectionCode]
  );

  // Score Calculation (DTM 2025 Standard)
  const scores = useMemo(() => {
    const s = {
      comp_math: Number((answers.comp_math * 1.1).toFixed(1)),
      comp_history: Number((answers.comp_history * 1.1).toFixed(1)),
      comp_lang: Number((answers.comp_lang * 1.1).toFixed(1)),
      subject_1: Number((answers.subject_1 * 3.1).toFixed(1)),
      subject_2: Number((answers.subject_2 * 2.1).toFixed(1)),
    };
    const total = Number(Object.values(s).reduce((a, b) => a + b, 0).toFixed(1));
    return { ...s, total };
  }, [answers]);

  // Handlers
  const handleAnswerChange = (field: keyof typeof answers, value: string, max: number) => {
    let num = parseInt(value) || 0;
    if (num < 0) num = 0;
    if (num > max) num = max;
    setAnswers((prev) => ({ ...prev, [field]: num }));
  };

  const handleSave = async () => {
    if (!selectedStudentId) {
      setStatus('error');
      setMessage("Iltimos, o'quvchini tanlang!");
      toast.error("O'quvchini tanlang!");
      return;
    }

    setSaving(true);
    setStatus('idle');
    setMessage('');

    try {
      const result = await saveExamResult(
        selectedStudentId,
        examDate,
        selectedDirectionCode,
        scores,
        examTitle
      );

      if (result.success) {
        setStatus('success');
        setMessage('Natija muvaffaqiyatli saqlandi! Keyingi o\'quvchini tanlab davom etishingiz mumkin.');
        toast.success('Natija saqlandi!');
        
        // Reset answers & student for next entry
        setAnswers({
          comp_math: 0,
          comp_history: 0,
          comp_lang: 0,
          subject_1: 0,
          subject_2: 0,
        });
        setSelectedStudentId('');
      } else {
        setStatus('error');
        setMessage(result.error || 'Natijani saqlashda xatolik.');
        toast.error('Saqlashda xatolik!');
      }
    } catch (error) {
      console.error('Save error:', error);
      setStatus('error');
      setMessage('Kutilmagan xatolik yuz berdi.');
      toast.error('Kutilmagan xatolik!');
    } finally {
      setSaving(false);
    }
  };

  const backUrl = paramExamTitle
    ? `/admin/results?exam=${encodeURIComponent(paramExamTitle)}`
    : '/admin/results';

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* Header & Back Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2 group text-xs font-bold"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{paramExamTitle ? `${paramExamTitle} ga qaytish` : 'Imtihonlarga qaytish'}</span>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              O'quvchi Natijasini Kiritish
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              {examTitle} • To'g'ri javoblar sonini kiritish va ballarni hisoblash
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-5">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck size={18} className="text-emerald-500" />
              <span>O'quvchi va Yo'nalish Ma'lumotlari</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Imtihon Nomi
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Masalan: 24-Avgust DTM Mock Test #4"
                  className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500"
                />
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Imtihon Sanasi
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl outline-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Student Select */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  O'quvchini Tanlang *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500"
                >
                  <option value="">— O'quvchini tanlang —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || 'Ismsiz'} {s.phone ? `(${s.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direction Select */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ta'lim Yo'nalishi (DTM Yo'nalishi)
                </label>
                <select
                  value={selectedDirectionCode}
                  onChange={(e) => setSelectedDirectionCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-emerald-500"
                >
                  {directionsData.map((d: any) => (
                    <option key={d.code} value={d.code}>
                      {d.name || d.title} ({d.subject_1} / {d.subject_2})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Test Answers Inputs */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calculator size={18} className="text-emerald-500" />
                <span>To'g'ri Javoblar Soni</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                DTM standarti bo'yicha har bir blokdagi to'g'ri javoblar sonini kiriting
              </p>
            </div>

            {/* Block 1: Compulsory Subjects (3x10 = 30 questions) */}
            <div className="space-y-3">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                1-Blok: Majburiy Fanlar (Har biri 1.1 ball)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Ona Tili (10 ta)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={answers.comp_lang}
                      onChange={(e) => handleAnswerChange('comp_lang', e.target.value, 10)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {scores.comp_lang} b
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Matematika (10 ta)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={answers.comp_math}
                      onChange={(e) => handleAnswerChange('comp_math', e.target.value, 10)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {scores.comp_math} b
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">O'zbekiston Tarixi (10 ta)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={answers.comp_history}
                      onChange={(e) => handleAnswerChange('comp_history', e.target.value, 10)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-sm font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {scores.comp_history} b
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2: Major Subjects (2x30 = 60 questions) */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                2-Blok: Asosiy Mutaxassislik Fanlari
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      1-Asosiy Fan: {currentDirection?.subject_1 || 'Fan 1'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      3.1 ball / test
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={answers.subject_1}
                      onChange={(e) => handleAnswerChange('subject_1', e.target.value, 30)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-base font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0 min-w-[60px] text-right">
                      {scores.subject_1} b
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/20 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      2-Asosiy Fan: {currentDirection?.subject_2 || 'Fan 2'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      2.1 ball / test
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={answers.subject_2}
                      onChange={(e) => handleAnswerChange('subject_2', e.target.value, 30)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-base font-black text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 shrink-0 min-w-[60px] text-right">
                      {scores.subject_2} b
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !selectedStudentId}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Save size={18} />
                <span>{saving ? 'Saqlanmoqda...' : 'Natijani Saqlash'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Score Card Summary */}
        <div className="space-y-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <span>Natija Xulosasi</span>
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                DTM 189
              </span>
            </div>

            {/* Total Score Big Display */}
            <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jami To'plangan Ball</span>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-sans-pro">
                {scores.total}
                <span className="text-sm font-semibold text-slate-400 ml-1">/ 189.0</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">
                Natija: {((scores.total / 189) * 100).toFixed(1)}%
              </span>
            </div>

            {/* Status Indicator */}
            <div>
              {scores.total >= 150 ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Davlat Granti ko'rsatkichi</span>
                </div>
              ) : scores.total >= 107.1 ? (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2.5 text-blue-600 dark:text-blue-400 text-xs font-extrabold">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>To'lov-Shartnoma chegarasidan o'tdi</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs font-extrabold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>O'tish balli to'planmadi</span>
                </div>
              )}
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 font-medium">Ona Tili (10 ta):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{scores.comp_lang} ball</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 font-medium">Matematika (10 ta):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{scores.comp_math} ball</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 font-medium">O'zbekiston Tarixi (10 ta):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{scores.comp_history} ball</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 font-medium">1-Asosiy Fan (30 ta):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{scores.subject_1} ball</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">2-Asosiy Fan (30 ta):</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{scores.subject_2} ball</span>
              </div>
            </div>

            {/* Broadcast Notice */}
            <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5 font-medium border border-slate-200/50 dark:border-slate-700/50">
              <Send size={15} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Barcha o'quvchilar natijalarini kiritib bo'lgach, Mock Test sahifasidagi <b>"Natijalarni e'lon qilish"</b> tugmasi orqali barchaga bir vaqtda reytingdagi egallagan o'rni bilan birga rasmiy Telegram xabarnomasi yuboriladi.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Yuklanmoqda...</p>
      </div>
    }>
      <NewResultContent />
    </Suspense>
  );
}
