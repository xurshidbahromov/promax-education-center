"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Save,
  Calculator,
  BookOpen,
  GraduationCap,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UserCheck
} from "lucide-react";
import directionsData from "@/data/dtm_directions.json";
import { getStudents, saveExamResult, type Student } from "@/lib/admin-queries";
import { sendDTMResultToStudentAndParents } from "@/lib/notifications-bridge";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResultsPage() {
  // Form State
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedDirectionCode, setSelectedDirectionCode] = useState(directionsData[0].code);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  // Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Answers State (Number of correct answers)
  const [answers, setAnswers] = useState({
    comp_math: 0, // Max 10
    comp_history: 0,// Max 10
    comp_lang: 0, // Max 10
    subject_1: 0, // Max 30
    subject_2: 0 // Max 30
  });

  // Derived State
  const currentDirection = useMemo(() =>
    directionsData.find(d => d.code === selectedDirectionCode) || directionsData[0],
    [selectedDirectionCode]);

  // Score Calculation (DTM 2025 Standard)
  const scores = useMemo(() => {
    const s = {
      comp_math: answers.comp_math * 1.1,
      comp_history: answers.comp_history * 1.1,
      comp_lang: answers.comp_lang * 1.1,
      subject_1: answers.subject_1 * 3.1,
      subject_2: answers.subject_2 * 2.1
    };
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    return { ...s, total };
  }, [answers]);

  // Handlers
  const handleAnswerChange = (field: keyof typeof answers, value: string, max: number) => {
    let num = parseInt(value) || 0;
    if (num < 0) num = 0;
    if (num > max) num = max;
    setAnswers(prev => ({ ...prev, [field]: num }));
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
    setMessage("");

    try {
      const result = await saveExamResult(
        selectedStudentId,
        examDate,
        selectedDirectionCode,
        scores
      );

      if (result.success) {
        // Send instant notification to student & parent(s) via Telegram & web
        sendDTMResultToStudentAndParents({
          studentId: selectedStudentId,
          examTitle: `DTM Mock Imtihoni (${examDate})`,
          examDate,
          directionCode: selectedDirectionCode,
          directionTitle: currentDirection?.name,
          scores: scores,
        });

        setStatus('success');
        setMessage("Natija muvaffaqiyatli saqlandi va Telegram orqali xabarnoma yuborildi!");
        toast.success("Natija saqlandi va Telegram orqali yuborildi!");
        // Reset form
        setAnswers({
          comp_math: 0, comp_history: 0, comp_lang: 0,
          subject_1: 0, subject_2: 0
        });
        setSelectedStudentId("");
      } else {
        setStatus('error');
        setMessage(result.error || "Natijani saqlashda xatolik.");
        toast.error("Saqlashda xatolik!");
      }
    } catch (error) {
      console.error("Save error:", error);
      setStatus('error');
      setMessage("Kutilmagan xatolik yuz berdi.");
      toast.error("Kutilmagan xatolik!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header & Back Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/results"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Orqaga"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              Yangi Natija Kiritish
            </h1>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              DTM Mock imtihoni to'g'ri javoblarini kiritish va ballarni hisoblash
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck size={20} className="text-slate-400" />
              <span>O'quvchi va Yo'nalish Ma'lumotlari</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Select */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  O'quvchini Tanlang *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="">— O'quvchini tanlang —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.phone || "Ismsiz"}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Direction Select */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ta'lim Yo'nalishi (DTM Yo'nalishi)
                </label>
                <select
                  value={selectedDirectionCode}
                  onChange={(e) => setSelectedDirectionCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {directionsData.map((d: any) => (
                    <option key={d.code} value={d.code}>
                      {d.name || d.title} ({d.subject_1} / {d.subject_2})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Answer Inputs (Compulsory & Subjects) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                To'g'ri Javoblar Soni
              </h3>

              {/* Compulsory Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Oney tili (10 ta)</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={answers.comp_lang}
                    onChange={(e) => handleAnswerChange('comp_lang', e.target.value, 10)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Matematika (10 ta)</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={answers.comp_math}
                    onChange={(e) => handleAnswerChange('comp_math', e.target.value, 10)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[11px] font-bold text-slate-500 mb-1">Tarix (10 ta)</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={answers.comp_history}
                    onChange={(e) => handleAnswerChange('comp_history', e.target.value, 10)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                  />
                </div>
              </div>

              {/* Main Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    1-Fan: {currentDirection.subject_1} (30 ta × 3.1)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={answers.subject_1}
                    onChange={(e) => handleAnswerChange('subject_1', e.target.value, 30)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    2-Fan: {currentDirection.subject_2} (30 ta × 2.1)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={answers.subject_2}
                    onChange={(e) => handleAnswerChange('subject_2', e.target.value, 30)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auto Calculation & Save */}
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calculator size={18} className="text-slate-400" />
              <span>Natija Kalkulyatori</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Majburiy fanlar:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {(scores.comp_lang + scores.comp_math + scores.comp_history).toFixed(1)} ball
                </span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>1-Asosiy fan ({currentDirection.subject_1}):</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{scores.subject_1.toFixed(1)} ball</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>2-Asosiy fan ({currentDirection.subject_2}):</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{scores.subject_2.toFixed(1)} ball</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">Umumiy Ball:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {scores.total.toFixed(1)}
                  <span className="text-xs text-slate-400 font-semibold ml-1">/ 189.0</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !selectedStudentId}
              className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Natijani Saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
