'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Copy,
  Edit2,
  Eye,
  Trash2,
  HelpCircle,
  AlertCircle,
  X,
  ArrowUpDown,
  LayoutGrid,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { deleteTest, duplicateTest, toggleTestPublish, type Test } from '@/lib/tests';
import { useTests } from '@/hooks/useAdminData';
import toast from 'react-hot-toast';

const SUBJECT_CONFIG: Record<string, { label: string; color: string }> = {
  math: { label: "Matematika", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  english: { label: "Ingliz tili", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  physics: { label: "Fizika", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  chemistry: { label: "Kimyo", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  biology: { label: "Biologiya", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
  general: { label: "Umumiy", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" }
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; border: string }> = {
  easy: { label: "Oson", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  medium: { label: "O'rta", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  hard: { label: "Qiyin", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "border-rose-500/20" }
};

// ── SKELETON LOADER ──
function TestsGridSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-52 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
              <div className="h-4 w-20 rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between">
              <div className="h-4 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="h-4 w-16 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TestsListPage() {
  const { data: testsData, isLoading: loading, refetch } = useTests();
  const tests: Test[] = testsData || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "questions_desc" | "title_asc">("newest");
  const [viewMode, setViewMode] = useState<"grouped" | "grid">("grouped");

  // Global KPI Summary
  const stats = useMemo(() => {
    const total = tests.length;
    const published = tests.filter(t => t.is_published).length;
    const drafts = total - published;
    const totalQuestions = tests.reduce((acc, t) => acc + (t.total_questions || 0), 0);

    return { total, published, drafts, totalQuestions };
  }, [tests]);

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return tests
      .filter(test => {
        const matchesSearch =
          !searchTerm ||
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (test.description || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "published"
            ? test.is_published
            : !test.is_published;

        return matchesSearch && matchesSubject && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        if (sortBy === "oldest") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        if (sortBy === "questions_desc") return (b.total_questions || 0) - (a.total_questions || 0);
        if (sortBy === "title_asc") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [tests, searchTerm, selectedSubject, statusFilter, sortBy]);

  // Grouped by Subject
  const groupedBySubject = useMemo(() => {
    const groups: { key: string; label: string; color: string; tests: Test[] }[] = [];
    const subjectsInUse = new Set<string>();

    filteredTests.forEach(t => subjectsInUse.add(t.subject || 'general'));

    // Standard subject order
    const orderedSubjects = ['math', 'english', 'physics', 'chemistry', 'biology', 'general'];
    
    // Add known ordered subjects first
    orderedSubjects.forEach(sKey => {
      const subjectTests = filteredTests.filter(t => (t.subject || 'general') === sKey);
      if (subjectTests.length > 0) {
        const conf = SUBJECT_CONFIG[sKey] || { label: sKey, color: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
        groups.push({
          key: sKey,
          label: conf.label,
          color: conf.color,
          tests: subjectTests
        });
      }
    });

    // Add any remaining custom subjects
    subjectsInUse.forEach(sKey => {
      if (!orderedSubjects.includes(sKey)) {
        const subjectTests = filteredTests.filter(t => t.subject === sKey);
        if (subjectTests.length > 0) {
          groups.push({
            key: sKey,
            label: sKey.toUpperCase(),
            color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
            tests: subjectTests
          });
        }
      }
    });

    return groups;
  }, [filteredTests]);

  // Handlers
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" testini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const success = await deleteTest(id);
      if (success) {
        toast.success("Test muvaffaqiyatli o'chirildi!");
        refetch();
      } else {
        toast.error("Testni o'chirishda xatolik yuz berdi");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Xatolik: " + e.message);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading("Nusxalanmoqda...", { id: 'dup' });
      const newTest = await duplicateTest(id);
      if (newTest) {
        toast.success("Test muvaffaqiyatli nusxalandi!", { id: 'dup' });
        refetch();
      } else {
        toast.error("Testni nusxalashda xatolik", { id: 'dup' });
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Xatolik: " + e.message, { id: 'dup' });
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
    } catch (e: any) {
      console.error(e);
      toast.error("Xatolik: " + e.message);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Online Testlar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Fanlar va mavzular kesimida barcha testlar bazasi ({tests.length} ta test)
          </p>
        </div>

        <Link
          href="/admin/tests/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi Test Yaratish</span>
        </Link>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Jami Testlar", value: `${stats.total} ta`, icon: BookOpen, color: "text-blue-500" },
          { label: "Nashr Qilinganlar", value: `${stats.published} ta`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Qoralamalar", value: `${stats.drafts} ta`, icon: FileText, color: "text-amber-500" },
          { label: "Jami Savollar", value: `${stats.totalQuestions} ta`, icon: HelpCircle, color: "text-purple-500" }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">{s.value}</p>
            </div>
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH, SUBJECT, STATUS & SORT ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Test nomi yoki mavzusi bo'yicha qidirish..."
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

        {/* Subject Filter */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">Barcha Fanlar</option>
            <option value="math">Matematika</option>
            <option value="english">Ingliz tili</option>
            <option value="physics">Fizika</option>
            <option value="chemistry">Kimyo</option>
            <option value="biology">Biologiya</option>
            <option value="general">Umumiy</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">Barcha Statuslar</option>
            <option value="published">Nashr Qilinganlar</option>
            <option value="draft">Qoralamalar</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="newest">Sanasi (Eng yangi)</option>
            <option value="oldest">Sanasi (Eng eski)</option>
            <option value="questions_desc">Savollar soni (ko'pdan kamga)</option>
            <option value="title_asc">Nomi (A-Z)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
          <button
            onClick={() => setViewMode('grouped')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'grouped'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Fanlar bo'yicha guruhlash"
          >
            <Layers size={15} />
            <span className="hidden md:inline">Fanlar bo'yicha</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Umumiy to'r ko'rinishi"
          >
            <LayoutGrid size={15} />
            <span className="hidden md:inline">Barchasi</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      {loading ? (
        <TestsGridSkeleton />
      ) : filteredTests.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <BookOpen size={36} className="mx-auto opacity-40" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday test topilmadi</p>
            <p className="text-xs text-slate-400 mt-1">Qidiruv parametrlarini o'zgartiring yoki yangi test yarating</p>
          </div>
          <Link
            href="/admin/tests/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>Yangi Test Yaratish</span>
          </Link>
        </div>
      ) : viewMode === "grouped" ? (
        /* ── VIEW 1: GROUPED BY SUBJECT WITH CLEAN DIVIDERS ── */
        <div className="space-y-10">
          {groupedBySubject.map((group, groupIndex) => (
            <div key={group.key} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                    {group.label}
                  </h2>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${group.color}`}>
                    {group.tests.length} ta test
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onTogglePublish={handleTogglePublish}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Spacing Divider between subject sections */}
              {groupIndex < groupedBySubject.length - 1 && (
                <div className="pt-4">
                  <div className="h-px bg-slate-200/40 dark:bg-slate-800/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── VIEW 2: FLAT GRID ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onTogglePublish={handleTogglePublish}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── REUSABLE CLEAN GLASSY TEST CARD ──
function TestCard({
  test,
  onTogglePublish,
  onDuplicate,
  onDelete,
}: {
  test: Test;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const subjectConf = SUBJECT_CONFIG[test.subject] || {
    label: test.subject || "Umumiy",
    color: "bg-slate-500/10 text-slate-600 border-slate-500/20"
  };

  const diffConfig = DIFFICULTY_CONFIG[test.difficulty_level || (test as any).difficulty] || {
    label: "O'rta",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20"
  };

  return (
    <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors">
      <div className="space-y-3">
        {/* Top Badges & Status Switch */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${subjectConf.color}`}>
              {subjectConf.label}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${diffConfig.color} ${diffConfig.border}`}>
              {diffConfig.label}
            </span>
          </div>

          <button
            onClick={() => onTogglePublish(test.id, test.is_published)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border transition-all ${
              test.is_published
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {test.is_published ? "Nashr qilingan" : "Qoralama"}
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1 transition-colors font-sans-pro">
            {test.title}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-2 leading-relaxed">
            {test.description || "Ushbu test uchun qo'shimcha tavsif kiritilmagan."}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold">
            <HelpCircle size={13} className="text-emerald-500" />
            <span>{test.total_questions || 0} ta savol</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            <span>{test.duration_minutes ? `${test.duration_minutes} min` : "Cheksiz"}</span>
          </span>
          {test.passing_score && (
            <>
              <span>•</span>
              <span>O'tish: {test.passing_score}%</span>
            </>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <button
          onClick={() => onDuplicate(test.id)}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Testni nusxalash"
        >
          <Copy size={14} />
          <span>Nusxalash</span>
        </button>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/tests/${test.id}`}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Savollarni ko'rish"
          >
            <Eye size={15} />
          </Link>

          <Link
            href={`/admin/tests/${test.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tahrirlash"
          >
            <Edit2 size={15} />
          </Link>

          <button
            onClick={() => onDelete(test.id, test.title)}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="O'chirish"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
