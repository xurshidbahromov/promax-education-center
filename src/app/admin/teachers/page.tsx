'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import {
  demoteToStudent,
  updateTeacher,
  promoteToTeacher,
  getStudents,
  type Teacher,
  type Student
} from '@/lib/admin-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useTeachers, useSubjects } from '@/hooks/useAdminData';
import { formatUzPhone, cleanUzPhone } from '@/lib/phone-formatter';
import toast from 'react-hot-toast';

const DEFAULT_FALLBACK_SUBJECTS = [
  'Matematika',
  'Ingliz tili',
  'Fizika',
  'Kimyo',
  'Biologiya',
  'Ona tili',
  'Tarix',
  'Rus tili',
  'Koreys tili',
  'Informatika',
  'Huquq'
];

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

  // Modal 1: Add / Promote Teacher Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newTeacherSubjects, setNewTeacherSubjects] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);

  // Modal 2: Edit Teacher Modal state
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: teachers, isLoading: loading } = useTeachers();
  const { data: dbSubjects = [] } = useSubjects();
  const teachersList: Teacher[] = teachers || [];

  // Load students for promote selector
  useEffect(() => {
    getStudents().then(setStudentsList).catch(console.error);
  }, []);

  // Dynamic Subjects List (from Database Subjects table + Teachers existing subjects)
  const dynamicSubjects = useMemo(() => {
    const subs = new Set<string>();
    // 1. From database created subjects
    dbSubjects.forEach((s) => {
      const title = s.title || (s as any).name;
      if (title) subs.add(title);
    });
    // 2. From teachers assigned subjects
    teachersList.forEach((t) => {
      (t.subjects || []).forEach((s) => subs.add(s));
    });
    // 3. Fallback if empty
    if (subs.size === 0) {
      DEFAULT_FALLBACK_SUBJECTS.forEach((s) => subs.add(s));
    }
    return Array.from(subs);
  }, [dbSubjects, teachersList]);

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

  // Filtered Selectable Students for Promote Modal
  const filteredSelectableStudents = useMemo(() => {
    if (!userSearchTerm.trim()) return studentsList;
    const term = userSearchTerm.toLowerCase();
    return studentsList.filter(
      (s) =>
        (s.full_name || '').toLowerCase().includes(term) ||
        (s.phone || '').includes(term)
    );
  }, [studentsList, userSearchTerm]);

  // Filtered & Sorted Teachers for Main View
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

  // ── DEMOTE TO STUDENT ──
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

  // ── OPEN EDIT MODAL ──
  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditName(teacher.full_name || '');
    setEditPhone(teacher.phone || '');
    setEditSubjects(teacher.subjects || []);
  };

  const toggleEditSubject = (sub: string) => {
    setEditSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editName.trim()) {
      toast.error("Ism-familiyani kiriting!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateTeacher(editingTeacher.id, {
        full_name: editName.trim(),
        phone: cleanUzPhone(editPhone),
        subjects: editSubjects
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        toast.success("O'qituvchi ma'lumotlari muvaffaqiyatli saqlandi! ✅");
        setEditingTeacher(null);
      } else {
        toast.error(res.error || "Saqlashda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Xatolik: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── OPEN ADD / PROMOTE MODAL ──
  const openAddModal = () => {
    setSelectedStudentId('');
    setUserSearchTerm('');
    setNewTeacherSubjects([]);
    setShowAddModal(true);
  };

  const toggleNewTeacherSubject = (sub: string) => {
    setNewTeacherSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Foydalanuvchini tanlang!");
      return;
    }
    if (newTeacherSubjects.length === 0) {
      toast.error("Kamida bitta fanni tanlang!");
      return;
    }

    setIsPromoting(true);
    try {
      const res = await promoteToTeacher(selectedStudentId, newTeacherSubjects);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("Yangi o'qituvchi muvaffaqiyatli tayinlandi! 👨‍🏫");
        setShowAddModal(false);
      } else {
        toast.error(res.error || "Tayinlashda xatolik yuz berdi");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Xatolik: " + err.message);
    } finally {
      setIsPromoting(false);
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

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Yangi O'qituvchi Qo'shish</span>
        </button>
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
        {dynamicSubjects.length > 0 && (
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Barcha Fanlar</option>
              {dynamicSubjects.map((sub) => (
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
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>Yangi O'qituvchi Qo'shish</span>
          </button>
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
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base font-sans-pro shrink-0 border border-blue-500/20">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate font-sans-pro">
                        {teacher.full_name || "Ismsiz O'qituvchi"}
                      </h3>
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 mt-0.5 transition-colors"
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="O'quvchiga aylantirish"
                  >
                    <ShieldAlert size={14} />
                    <span>O'quvchi qilish</span>
                  </button>

                  <button
                    onClick={() => openEditModal(teacher)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Tahrirlash</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: ADD / PROMOTE TEACHER MODAL (WITH SEARCHABLE USER SELECTOR & DYNAMIC SUBJECTS) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <GraduationCap size={18} className="text-emerald-500" />
                <h3 className="font-bold text-base">Yangi O'qituvchi Tayinlash</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Searchable Student / User Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Foydalanuvchini qidiring va tanlang *
                </label>

                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ism yoki telefon bo'yicha qidirish..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
                    />
                    {userSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setUserSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40">
                    {filteredSelectableStudents.length === 0 ? (
                      <p className="text-xs text-center py-4 text-slate-400 font-medium">Foydalanuvchi topilmadi</p>
                    ) : (
                      filteredSelectableStudents.map((s) => {
                        const isSelected = selectedStudentId === s.id;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedStudentId(s.id)}
                            className={`p-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                {(s.full_name || '?')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{s.full_name || "Ismsiz"}</p>
                                <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {s.phone ? formatUzPhone(s.phone) : 'Raqamsiz'}
                                </p>
                              </div>
                            </div>
                            {isSelected && <Check size={14} className="text-white shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Database Subjects Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  O'qitadigan Fanlari (Bir yoki bir nechta tanlang) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {dynamicSubjects.map((sub) => {
                    const isSelected = newTeacherSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleNewTeacherSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isPromoting || !selectedStudentId || newTeacherSubjects.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isPromoting ? 'Tayinlanmoqda...' : 'O\'qituvchi etib tayinlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT TEACHER MODAL (WITH DYNAMIC SUBJECTS) ── */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Edit2 size={18} className="text-blue-500" />
                <h3 className="font-bold text-base">O'qituvchini Tahrirlash</h3>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Ism Familiya *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="Ustoz ismi..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              {/* Dynamic Database Subjects Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  Biriktirilgan Fanlar (Baza fanlaridan)
                </label>
                <div className="flex flex-wrap gap-2">
                  {dynamicSubjects.map((sub) => {
                    const isSelected = editSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleEditSubject(sub)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
