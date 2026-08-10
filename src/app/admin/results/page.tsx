"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, FileText, Download, Calendar, GraduationCap,
  Award, TrendingUp, CheckCircle2, Edit2, Trash2, X, Save, Printer, FileCheck
} from "lucide-react";
import { useAllResults } from "@/hooks/useAdminData";
import { exportStudentResults } from "@/lib/excel-export";
import { updateResult, deleteResult } from "@/lib/admin-queries";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ResultsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [limit] = useState(50);
  const [isExporting, setIsExporting] = useState(false);

  // Edit Modal state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    resultId: string;
    studentName: string;
    examTitle: string;
    score: number;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Report Card Modal state
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    studentId: string;
    studentName: string;
  } | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: resultsData, isLoading: loading } = useAllResults(limit);
  const results = resultsData || [];

  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm) return results;
    const q = debouncedSearchTerm.toLowerCase();
    return results.filter(result =>
      (result.student?.full_name || "").toLowerCase().includes(q) ||
      (result.exam?.title || "").toLowerCase().includes(q) ||
      (result.direction?.title || "").toLowerCase().includes(q)
    );
  }, [results, debouncedSearchTerm]);

  const summaryStats = useMemo(() => {
    if (results.length === 0) return { total: 0, avgScore: 0, passedCount: 0, topScore: 0 };

    const total = results.length;
    let sumScore = 0;
    let passed = 0;
    let max = 0;

    results.forEach(r => {
      const score = Number(r.total_score || r.score) || 0;
      sumScore += score;
      if (score > max) max = score;
      if (score >= 107.1) passed++;
    });

    return {
      total,
      avgScore: (sumScore / total).toFixed(1),
      passedCount: passed,
      topScore: max.toFixed(1)
    };
  }, [results]);

  const handleExport = async () => {
    if (filteredResults.length === 0) {
      toast("Export qilish uchun ma'lumot yo'q", { icon: "⚠️" });
      return;
    }

    try {
      const exportData = filteredResults.map(r => ({
        student_name: r.student?.full_name || 'Noma\'lum',
        phone: r.student?.phone || 'N/A',
        test_title: r.exam?.title || 'N/A',
        subject: r.direction?.title || 'N/A',
        score: Number(r.total_score || r.score) || 0,
        max_score: 189,
        percentage: ((Number(r.total_score || r.score) || 0) / 189) * 100,
        passing_score: 60,
        completed_at: r.exam?.date || r.created_at || new Date().toISOString(),
        time_spent_seconds: null
      }));

      setIsExporting(true);
      await exportStudentResults(exportData);
      toast.success(`${filteredResults.length} ta natija Excel formatida yuklandi`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export qilishda xatolik yuz berdi");
    } finally {
      setIsExporting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (result: any) => {
    setEditModal({
      open: true,
      resultId: result.id,
      studentName: result.student?.full_name || "O'quvchi",
      examTitle: result.exam?.title || "Imtihon",
      score: Number(result.total_score || result.score) || 0
    });
  };

  // Confirm Save Edit
  const handleSaveEdit = async () => {
    if (!editModal) return;
    setSavingEdit(true);

    try {
      const res = await updateResult(editModal.resultId, { total_score: Number(editModal.score) });
      if (res.success) {
        toast.success("Natija yangilandi!");
        queryClient.invalidateQueries({ queryKey: ['allResults'] });
        setEditModal(null);
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (err: any) {
      toast.error("Natijani saqlashda xatolik: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Result
  const handleDelete = async (id: string, studentName: string) => {
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

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Imtihon Natijalari
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            DTM va Mock imtihonlari bo'yicha o'quvchilar natijalari ({results.length} ta)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExport}
            disabled={isExporting || filteredResults.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Download size={15} className={isExporting ? "animate-bounce" : ""} />
            <span>{isExporting ? "Yuklanmoqda..." : "Excel ga yuklash"}</span>
          </button>

          <Link
            href="/admin/results/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10"
          >
            <Plus size={16} />
            <span>Yangi Natija</span>
          </Link>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Jami Natijalar", value: `${summaryStats.total} ta`, icon: FileText, color: "text-blue-500" },
          { label: "O'rtacha Ball", value: `${summaryStats.avgScore} ball`, icon: TrendingUp, color: "text-purple-500" },
          { label: "O'tish Balli (>56.6%)", value: `${summaryStats.passedCount} ta`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Eng Yuqori Ball", value: `${summaryStats.topScore} ball`, icon: Award, color: "text-amber-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{stat.value}</p>
            </div>
            <stat.icon size={26} className={`${stat.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki imtihon bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Results Container */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">O'zlashtirish (%)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredResults.map((result) => {
                  const score = Number(result.total_score || result.score) || 0;
                  const maxScore = Number(result.max_score) || 189;
                  const percentage = (score / maxScore) * 100;
                  const isHigh = percentage >= 56.6;
                  const isMedium = percentage >= 30 && percentage < 56.6;
                  const studentName = result.student?.full_name || "Noma'lum O'quvchi";

                  return (
                    <tr key={result.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                        {studentName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {result.exam?.title || result.test?.title || "DTM Mock Imtihon"}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Calendar size={12} />
                          {result.exam?.date || result.created_at ? new Date(result.exam?.date || result.created_at).toLocaleDateString('uz-UZ') : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                          <GraduationCap size={14} className="text-slate-400 shrink-0" />
                          <span>{result.direction?.title || "Umumiy"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
                          {score.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold ml-1">/ {maxScore.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[130px]">
                          <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isHigh ? 'text-emerald-600 dark:text-emerald-400' : isMedium ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
                            }`}
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit result score */}
                          <button
                            onClick={() => openEditModal(result)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete result */}
                          <button
                            onClick={() => handleDelete(result.id, studentName)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
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

      {/* Edit Result Modal */}
      {editModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 size={18} className="text-brand-blue" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Natijani Tahrirlash</h3>
              </div>
              <button onClick={() => setEditModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 block">O'quvchi</span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{editModal.studentName}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 block">Imtihon</span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{editModal.examTitle}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                  To'plangan Ball:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editModal.score}
                  onChange={(e) => setEditModal(prev => prev ? { ...prev, score: parseFloat(e.target.value) || 0 } : null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-extrabold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-brand-blue/20"
              >
                <Save size={14} />
                <span>{savingEdit ? "Saqlanmoqda..." : "Saqlash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
