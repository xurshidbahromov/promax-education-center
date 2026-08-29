'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  GraduationCap,
  Phone,
  ShieldAlert,
  Plus,
  X,
  Users,
  BookOpen,
  ArrowUpDown,
  Edit2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { demoteToStudent, type Teacher } from '@/lib/admin-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useTeachers } from '@/hooks/useAdminData';
import { formatUzPhone } from '@/lib/phone-formatter';
import toast from 'react-hot-toast';

// ── SKELETON LOADER ──
function TeachersGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-52 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-1/3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="h-6 w-20 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between">
              <div className="h-4 w-24 rounded bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="h-4 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'groups_desc' | 'students_desc' | 'newest'>('name_asc');

  const { data: teachers, isLoading: loading } = useTeachers();
  const teachersList: Teacher[] = teachers || [];

  // Global KPI Summary
  const stats = useMemo(() => {
    const total = teachersList.length;
    let totalGroups = 0;
    let totalStudents = 0;

    teachersList.forEach((t) => {
      totalGroups += t.groups_count || 0;
      totalStudents += t.students_count || 0;
    });

    return { total, totalGroups, totalStudents };
  }, [teachersList]);

  // Available subjects list from teachers
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    teachersList.forEach((t) => {
      (t.subjects || []).forEach((s) => subs.add(s));
    });
    return Array.from(subs);
  }, [teachersList]);

  // Filtered & Sorted Teachers
  const filteredTeachers = useMemo(() => {
    return teachersList
      .filter((teacher) => {
        const matchesSearch =
          !searchTerm ||
          (teacher.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (teacher.phone || '').includes(searchTerm) ||
          (teacher.subjects || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSubject =
          selectedSubject === 'all' ||
          (teacher.subjects || []).includes(selectedSubject);

        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
        if (sortBy === 'groups_desc') return (b.groups_count || 0) - (a.groups_count || 0);
        if (sortBy === 'students_desc') return (b.students_count || 0) - (a.students_count || 0);
        if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        return 0;
      });
  }, [teachersList, searchTerm, selectedSubject, sortBy]);

  // Handlers
  const handleDemote = async (id: string, name: string) => {
    if (!confirm(`"${name}" ni o'qituvchilar safidan chiqarib, oddiy o'quvchiga aylantirmoqchimisiz?`)) return;

    try {
      const result = await demoteToStudent(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'qituvchi maqomi olib tashlandi va o'quvchiga o'tkazildi");
      } else {
        toast.error("Xatolik: " + result.error);
      }
    } catch (error: any) {
      console.error("Demote error:", error);
      toast.error("Xatolik: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            O'qituvchilar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Platformadagi barcha ustozlar, ularning guruhlari va fanlari ({teachersList.length} ta o'qituvchi)
          </p>
        </div>

        <Link
          href="/admin/teachers/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi O'qituvchi Qo'shish</span>
        </Link>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Jami O'qituvchilar", value: `${stats.total} nafar`, icon: GraduationCap, color: "text-purple-500" },
          { label: "Biriktirilgan Guruhlar", value: `${stats.totalGroups} ta`, icon: BookOpen, color: "text-blue-500" },
          { label: "Biriktirilgan O'quvchilar", value: `${stats.totalStudents} nafar`, icon: Users, color: "text-emerald-500" }
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

      {/* ── UNIFIED TOOLBAR: SEARCH, SUBJECT & SORT ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'qituvchi ismi, telefoni yoki fani bo'yicha qidirish..."
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
        {availableSubjects.length > 0 && (
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Barcha Fanlar</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="name_asc">Ismi bo'yicha (A-Z)</option>
            <option value="groups_desc">Guruhlar soni (ko'pdan kamga)</option>
            <option value="students_desc">O'quvchilar soni (ko'pdan kamga)</option>
            <option value="newest">Qo'shilgan sanasi (yangi)</option>
          </select>
        </div>
      </div>

      {/* ── TEACHERS GRID ── */}
      {loading ? (
        <TeachersGridSkeleton />
      ) : filteredTeachers.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <GraduationCap size={36} className="mx-auto opacity-40" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday o'qituvchi topilmadi</p>
            <p className="text-xs text-slate-400 mt-1">Qidiruv parametrlarini o'zgartiring yoki yangi o'qituvchi qo'shing</p>
          </div>
          <Link
            href="/admin/teachers/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>Yangi O'qituvchi Qo'shish</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const initial = (teacher.full_name || '?')[0].toUpperCase();
            const formattedPhone = teacher.phone ? formatUzPhone(teacher.phone) : 'Telefon kiritilmagan';

            return (
              <div
                key={teacher.id}
                className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 transition-colors"
              >
                <div className="space-y-4">
                  {/* Top: Avatar & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-base font-sans-pro shrink-0 border border-purple-500/20">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate font-sans-pro">
                        {teacher.full_name || "Ismsiz O'qituvchi"}
                      </h3>
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5 transition-colors"
                        >
                          <Phone size={12} className="shrink-0 text-slate-400" />
                          <span>{formattedPhone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone size={12} className="shrink-0 text-slate-400" />
                          <span>Raqam kiritilmagan</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subjects Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Biriktirilgan Fanlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Fanlar kiritilmagan</span>
                      )}
                    </div>
                  </div>

                  {/* Activity Stats (Groups & Students) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Guruhlar</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-sans-pro">
                          {teacher.groups_count || 0} ta guruh
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center gap-2">
                      <Users size={14} className="text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">O'quvchilar</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-sans-pro">
                          {teacher.students_count || 0} nafar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => handleDemote(teacher.id, teacher.full_name || "O'qituvchi")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                    title="O'quvchiga aylantirish"
                  >
                    <ShieldAlert size={14} />
                    <span>O'quvchi qilish</span>
                  </button>

                  <Link
                    href={`/admin/teachers/${teacher.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Edit2 size={13} />
                    <span>Tahrirlash</span>
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
