content = """"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, FileText, Edit, Trash2, Eye, Users, Clock,
  CheckCircle, XCircle, BarChart3, Search, Copy,
  BookOpen, PlayCircle, Target, TrendingUp
} from "lucide-react";
import { deleteTest, toggleTestPublish, duplicateTest, type Test } from "@/lib/tests";
import { useTests } from "@/hooks/useAdminData";

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy",
};

const SUBJECT_COLORS: Record<string, string> = {
  math: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  english: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  physics: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  chemistry: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  biology: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  general: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Oson", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  medium: { label: "O'rta", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  hard: { label: "Qiyin", color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
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

  const handleDelete = async (testId: string) => {
    if (!confirm("Haqiqatan ham bu testni o'chirmoqchimisiz? Barcha natijalar ham o'chib ketadi!")) return;
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
      <div className="flex items-center justify-center py-32 text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-brand-blue" size={26} />
            Testlar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Barcha testlarni boshqarish va natijalarni kuzatish</p>
        </div>
        <Link
          href="/admin/tests/create"
          className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-blue/20 active:scale-95"
        >
          <Plus size={18} />
          Yangi test
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jami testlar", value: tests.length, icon: FileText, color: "text-brand-blue", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Nashr qilingan", value: publishedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Qoralama", value: tests.length - publishedCount, icon: XCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Jami savollar", value: totalQuestions, icon: Target, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm">
          <Search className="text-gray-400 flex-shrink-0" size={18} />
          <input
            type="text"
            placeholder="Test yoki fan nomi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 flex-1 text-slate-800 dark:text-slate-100 placeholder-gray-400 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
          {[
            { value: "all", label: "Hammasi" },
            { value: "published", label: "Nashr" },
            { value: "draft", label: "Qoralama" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterPublished(f.value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterPublished === f.value
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
          <FileText className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={56} />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {searchQuery || filterPublished !== "all" ? "Topilmadi" : "Hali testlar yo'q"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {searchQuery || filterPublished !== "all"
              ? "Qidiruv parametrlarini o'zgartiring"
              : "Birinchi testingizni yaratib boshlang"}
          </p>
          {!searchQuery && filterPublished === "all" && (
            <Link
              href="/admin/tests/create"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-blue/20"
            >
              <Plus size={18} />
              Yangi test yaratish
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestCard({
  test,
  onTogglePublish,
  onDelete,
  onDuplicate,
}: {
  test: Test;
  onTogglePublish: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const difficulty = DIFFICULTY_CONFIG[test.difficulty_level] || { label: test.difficulty_level, color: "text-slate-600 bg-slate-50" };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${test.is_published ? "bg-emerald-400" : "bg-amber-400"}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Title + badge row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug flex-1">
            {test.title}
          </h3>
          <span
            className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              test.is_published
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {test.is_published ? "Nashr" : "Qoralama"}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${SUBJECT_COLORS[test.subject] || "bg-slate-50 text-slate-600"}`}>
            {SUBJECT_LABELS[test.subject] || test.subject}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <FileText size={13} />
            {test.total_questions} savol
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {test.duration_minutes ? `${test.duration_minutes} min` : "Cheklovsiz"}
          </span>
          <span className="flex items-center gap-1">
            <Target size={13} />
            {test.passing_score}% o'tish
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            href={`/admin/tests/${test.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/35 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye size={14} /> Ko'rish
          </Link>
          <div className="flex items-center gap-0.5">
            <Link
              href={`/admin/tests/${test.id}/edit`}
              className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Tahrirlash"
            >
              <Edit size={15} />
            </Link>
            <button
              onClick={() => onTogglePublish(test.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                test.is_published
                  ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
              title={test.is_published ? "Qoralamaga o'tkazish" : "Nashr qilish"}
            >
              {test.is_published ? <XCircle size={15} /> : <CheckCircle size={15} />}
            </button>
            <button
              onClick={() => onDuplicate(test.id)}
              className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Nusxalash"
            >
              <Copy size={15} />
            </button>
            <button
              onClick={() => onDelete(test.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="O'chirish"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open("src/app/admin/tests/page.tsx", "w") as f:
    f.write(content)
print("Tests page written!")
