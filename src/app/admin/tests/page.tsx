"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, BookOpen, Clock, FileText, CheckCircle2,
  Copy, Edit2, Eye, Trash2, HelpCircle, AlertCircle
} from "lucide-react";
import { deleteTest, duplicateTest, toggleTestPublish, type Test } from "@/lib/tests";
import { useTests } from "@/hooks/useAdminData";
import toast from "react-hot-toast";

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy"
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Oson", color: "text-emerald-600 dark:text-emerald-400" },
  medium: { label: "O'rta", color: "text-amber-600 dark:text-amber-400" },
  hard: { label: "Qiyin", color: "text-red-600 dark:text-red-400" }
};

export default function TestsListPage() {
  const { data: testsData, isLoading: loading, refetch } = useTests();
  const tests: Test[] = testsData || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" ? true :
        statusFilter === "published" ? test.is_published : !test.is_published;

      return matchesSearch && matchesStatus;
    });
  }, [tests, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = tests.length;
    const published = tests.filter(t => t.is_published).length;
    const drafts = total - published;
    const totalQuestions = tests.reduce((acc, t) => acc + (t.total_questions || 0), 0);

    return { total, published, drafts, totalQuestions };
  }, [tests]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" testini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const success = await deleteTest(id);
      if (success) {
        toast.success("Test o'chirildi!");
        refetch();
      } else {
        toast.error("Testni o'chirishda xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newTest = await duplicateTest(id);
      if (newTest) {
        toast.success("Test nusxalandi!");
        refetch();
      } else {
        toast.error("Testni nusxalashda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const success = await toggleTestPublish(id);
      if (success) {
        toast.success(!currentStatus ? "Test nashr qilindi!" : "Test qoralamaga o'tkazildi!");
        refetch();
      } else {
        toast.error("Statusni o'zgartirishda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Testlar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Barcha onlayn va oflayn imtihon testlari ({tests.length} ta)
          </p>
        </div>

        <Link
          href="/admin/tests/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi Test Yaratish</span>
        </Link>
      </div>

      {/* Goldilocks Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Jami Testlar", value: `${stats.total} ta`, icon: BookOpen, color: "text-blue-500" },
          { label: "Nashr Qilinganlar", value: `${stats.published} ta`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Qoralamalar", value: `${stats.drafts} ta`, icon: FileText, color: "text-amber-500" },
          { label: "Jami Savollar", value: `${stats.totalQuestions} ta`, icon: HelpCircle, color: "text-purple-500" }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{s.value}</p>
            </div>
            
            {/* Box-free Icon */}
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Test nomi yoki mavzusi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="all">Barcha Statuslar</option>
          <option value="published">Nashr Qilinganlar</option>
          <option value="draft">Qoralamalar</option>
        </select>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Testlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test) => {
            const subjectLabel = SUBJECT_LABELS[test.subject] || test.subject;
            const diffConfig = DIFFICULTY_CONFIG[(test as any).difficulty] || { label: "O'rta", color: "text-amber-600 dark:text-amber-400" };

            return (
              <div
                key={test.id}
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg line-clamp-2">
                      {test.title}
                    </h3>
                    <button
                      onClick={() => handleTogglePublish(test.id, test.is_published)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                        test.is_published
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                      }`}
                    >
                      {test.is_published ? "Nashr qilingan" : "Qoralama"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2">
                    {test.description || "Tavsif kiritilmagan"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      {subjectLabel}
                    </span>
                    <span className={`text-xs font-bold ${diffConfig.color}`}>
                      {diffConfig.label}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <Clock size={13} />
                      {test.duration_minutes ? `${test.duration_minutes} min` : "Cheksiz"}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">
                      {test.total_questions || 0} ta savol
                    </span>
                  </div>
                </div>

                {/* Box-free Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <button
                    onClick={() => handleDuplicate(test.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-colors"
                  >
                    <Copy size={15} />
                    <span>Nusxalash</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/tests/${test.id}`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Ko'rish"
                    >
                      <Eye size={17} />
                    </Link>
                    <button
                      onClick={() => handleDelete(test.id, test.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
