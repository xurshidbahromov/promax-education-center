"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, FileText, Edit, Trash2, Eye, Users, Clock,
  CheckCircle, XCircle, Search, Copy,
  BookOpen, Target, CheckCircle2
} from "lucide-react";
import { deleteTest, toggleTestPublish, duplicateTest } from "@/lib/tests";
import { useTests } from "@/hooks/useAdminData";

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Oson", color: "text-emerald-600 dark:text-emerald-400" },
  medium: { label: "O'rta", color: "text-amber-600 dark:text-amber-400" },
  hard: { label: "Qiyin", color: "text-red-500 dark:text-red-400" },
};

export default function AdminTestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: tests = [], isLoading: loading } = useTests();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (SUBJECT_LABELS[test.subject] || test.subject).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterPublished === "all" ||
      (filterPublished === "published" && test.is_published) ||
      (filterPublished === "draft" && !test.is_published);
    return matchesSearch && matchesFilter;
  });

  const handleTogglePublish = async (testId: string) => {
    const ok = await toggleTestPublish(testId);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Status yangilandi");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (testId: string, title: string) => {
    if (!confirm(`${title} testini haqiqatan ham o'chirmoqchimisiz? Undagi barcha natijalar ham o'chib ketadi!`)) return;
    const ok = await deleteTest(testId);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test o'chirildi");
    } else {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleDuplicate = async (testId: string) => {
    const newId = await duplicateTest(testId);
    if (newId) {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test nusxalandi!");
      router.push(`/admin/tests/${newId}/edit`);
    } else {
      toast.error("Nusxalashda xatolik");
    }
  };

  const publishedCount = tests.filter(t => t.is_published).length;
  const totalQuestions = tests.reduce((sum, t) => sum + t.total_questions, 0);

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Testlar
          </h1>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Barcha test topshiriqlarini yaratish, boshqarish va nashr qilish ({tests.length} ta)
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

      {/* Box-free Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jami testlar", value: `${tests.length} ta`, icon: FileText, color: "text-blue-500" },
          { label: "Nashr qilingan", value: `${publishedCount} ta`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Qoralama", value: `${tests.length - publishedCount} ta`, icon: XCircle, color: "text-amber-500" },
          { label: "Jami savollar", value: `${totalQuestions} ta`, icon: Target, color: "text-purple-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{stat.value}</p>
            </div>
            
            {/* Box-free icon */}
            <stat.icon size={24} className={`${stat.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Test nomi yoki fan bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>

        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as any)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">Barcha Holatlar</option>
          <option value="published">Nashr qilingan</option>
          <option value="draft">Qoralama</option>
        </select>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
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
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {subjectLabel}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${diffConfig.color}`}>
                          • {diffConfig.label}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 truncate">{test.title}</h3>
                    </div>

                    <button
                      onClick={() => handleTogglePublish(test.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        test.is_published
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {test.is_published ? "Nashr qilingan" : "Qoralama"}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Target size={13} className="text-slate-400" />
                      {test.total_questions} ta savol
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {test.duration_minutes} daqiqa
                    </span>
                  </div>
                </div>

                {/* Box-free Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(test.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Nusxalash"
                    >
                      <Copy size={15} />
                    </button>
                    <Link
                      href={`/admin/tests/${test.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(test.id, test.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <Link
                    href={`/admin/tests/${test.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-blue hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye size={14} />
                    <span>Ko'rish</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
