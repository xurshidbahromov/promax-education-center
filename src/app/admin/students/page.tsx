'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Search,
  Users,
  Edit2,
  Trash2,
  Phone,
  X,
  GraduationCap,
  ChevronRight,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Smartphone,
  PhoneCall,
  CheckCircle2,
  ArrowUpDown,
  BookOpen,
  Plus,
  Globe,
  Layers,
  Send
} from 'lucide-react';
import {
  getStudents,
  getGroups,
  deleteStudent,
  promoteToTeacher,
  updateStudent,
  addStudentToGroup,
  removeStudentFromGroup,
  type Student,
  type Group
} from '@/lib/admin-queries';
import { getSubjects, type Subject } from '@/lib/supabase-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useStudents } from '@/hooks/useAdminData';
import { formatUzPhone, cleanUzPhone } from '@/lib/phone-formatter';

// ── SKELETON LOADER ──
function StudentsGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-64 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
                <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-8 rounded-xl bg-slate-200/50 dark:bg-slate-800/50" />
              <div className="h-5 w-1/3 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
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

export default function AdminStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'enrolled' | 'unassigned' | 'all'>('enrolled');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [telegramFilter, setTelegramFilter] = useState<'all' | 'connected' | 'not_connected'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'newest' | 'groups_desc'>('name_asc');

  // Groups and Subjects for modals/filters
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Assign to Group Modal
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    student: Student | null;
  } | null>(null);
  const [selectedGroupIdToAssign, setSelectedGroupIdToAssign] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Promote Modal states
  const [promoteModal, setPromoteModal] = useState<{
    open: boolean;
    studentId: string;
    studentName: string;
  } | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);

  // Edit Student & Parent CRM Modal states
  const [editModal, setEditModal] = useState<{
    open: boolean;
    studentId: string;
    fullName: string;
    phone: string;
    parentName: string;
    parentPhone: string;
  } | null>(null);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // Load Groups and Subjects on mount
  useEffect(() => {
    getGroups().then(setAllGroups).catch(console.error);
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const { data: students, isLoading: loading } = useStudents();
  const studentsList: Student[] = students || [];

  // Global KPI Summary
  const stats = useMemo(() => {
    const total = studentsList.length;
    const enrolled = studentsList.filter((s) => s.is_enrolled).length;
    const unassigned = total - enrolled;
    const telegramCount = studentsList.filter((s) => !!s.telegram_id).length;

    return { total, enrolled, unassigned, telegramCount };
  }, [studentsList]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return studentsList
      .filter((student) => {
        // Tab Filter
        if (activeTab === 'enrolled' && !student.is_enrolled) return false;
        if (activeTab === 'unassigned' && student.is_enrolled) return false;

        // Search Filter
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          const matchesName = (student.full_name || '').toLowerCase().includes(lower);
          const matchesPhone = (student.phone || '').includes(searchTerm);
          const matchesParentPhone = (student.parent_phone || '').includes(searchTerm);
          const matchesParentName = (student.parent_name || '').toLowerCase().includes(lower);
          if (!matchesName && !matchesPhone && !matchesParentPhone && !matchesParentName) return false;
        }

        // Group Filter
        if (selectedGroup !== 'all') {
          const inGroup = (student.groups || []).some((g) => g.id === selectedGroup);
          if (!inGroup) return false;
        }

        // Telegram Filter
        if (telegramFilter === 'connected' && !student.telegram_id) return false;
        if (telegramFilter === 'not_connected' && student.telegram_id) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
        if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        if (sortBy === 'groups_desc') return (b.groups || []).length - (a.groups || []).length;
        return 0;
      });
  }, [studentsList, activeTab, searchTerm, selectedGroup, telegramFilter, sortBy]);

  // ── ASSIGN MODAL HANDLERS ──
  const openAssignModal = (student: Student) => {
    setAssignModal({ open: true, student });
    setSelectedGroupIdToAssign('');
  };

  const handleAssignToGroup = async () => {
    if (!assignModal?.student || !selectedGroupIdToAssign) {
      toast.error('Iltimos, guruhni tanlang!');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await addStudentToGroup(selectedGroupIdToAssign, assignModal.student.id);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        getGroups().then(setAllGroups);
        toast.success("O'quvchi guruhga biriktirildi!");
        setAssignModal(null);
      } else {
        toast.error('Xatolik: ' + res.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Xatolik yuz berdi: ' + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveFromGroup = async (studentId: string, groupId: string, groupName: string) => {
    if (!confirm(`O'quvchini "${groupName}" guruhidan chiqarmoqchimisiz?`)) return;

    try {
      const res = await removeStudentFromGroup(groupId, studentId);
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        getGroups().then(setAllGroups);
        toast.success("O'quvchi guruhdan chiqarildi!");
        if (assignModal?.student?.id === studentId) {
          setAssignModal({
            ...assignModal,
            student: {
              ...assignModal.student,
              groups: (assignModal.student.groups || []).filter((g) => g.id !== groupId)
            }
          });
        }
      } else {
        toast.error('Xatolik: ' + res.error);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Xatolik: ' + err.message);
    }
  };

  // ── EDIT STUDENT MODAL HANDLERS ──
  const openEditModal = (student: Student) => {
    setEditModal({
      open: true,
      studentId: student.id,
      fullName: student.full_name || '',
      phone: student.phone ? formatUzPhone(student.phone) : '+998 ',
      parentName: student.parent_name || '',
      parentPhone: student.parent_phone ? formatUzPhone(student.parent_phone) : '+998 '
    });
  };

  const handleSaveStudentConfirm = async () => {
    if (!editModal) return;
    if (!editModal.fullName.trim()) {
      toast.error('Ismni kiriting!');
      return;
    }

    setIsSavingStudent(true);
    try {
      const res = await updateStudent(editModal.studentId, {
        full_name: editModal.fullName,
        phone: cleanUzPhone(editModal.phone) || '',
        parent_name: editModal.parentName || null,
        parent_phone: cleanUzPhone(editModal.parentPhone) || null
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'quvchi ma'lumotlari saqlandi!");
        setEditModal(null);
      } else {
        toast.error('Xatolik: ' + res.error);
      }
    } catch (err) {
      console.error('Save student error:', err);
    } finally {
      setIsSavingStudent(false);
    }
  };

  // ── PROMOTE TO TEACHER MODAL HANDLERS ──
  const openPromoteModal = (id: string, name: string) => {
    setSelectedSubjects([]);
    setPromoteModal({ open: true, studentId: id, studentName: name || "Ism yo'q" });
  };

  const toggleSubject = (subjectTitle: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectTitle) ? prev.filter((s) => s !== subjectTitle) : [...prev, subjectTitle]
    );
  };

  const handlePromoteConfirm = async () => {
    if (!promoteModal) return;
    if (selectedSubjects.length === 0) {
      toast.error('Kamida bitta fanni tanlang!');
      return;
    }

    setIsPromoting(true);
    try {
      const result = await promoteToTeacher(promoteModal.studentId, selectedSubjects);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        toast.success(`${promoteModal.studentName} o'qituvchi etib tayinlandi!`);
        setPromoteModal(null);
      } else {
        toast.error('Xatolik: ' + result.error);
      }
    } catch (error) {
      console.error('Promote error:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  // ── DELETE STUDENT ──
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ismli o'quvchini haqiqatan ham bazadan o'chirmoqchimisiz?`)) return;
    try {
      const result = await deleteStudent(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'quvchi muvaffaqiyatli o'chirildi");
      } else {
        toast.error('Xatolik: ' + result.error);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Xatolik: ' + error.message);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            O'quvchilar CRM Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Markaz o'quvchilari va onlayn ro'yxatdan o'tgan barcha foydalanuvchilar ({studentsList.length} nafar)
          </p>
        </div>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami Foydalanuvchilar', value: `${stats.total} nafar`, icon: Users, color: 'text-blue-500' },
          { label: 'Markaz O\'quvchilari (Faol)', value: `${stats.enrolled} nafar`, icon: GraduationCap, color: 'text-emerald-500' },
          { label: 'Guruhsiz / Onlayn (Yangi)', value: `${stats.unassigned} nafar`, icon: Globe, color: 'text-amber-500' },
          { label: 'Telegram Ulanganlar', value: `${stats.telegramCount} ta`, icon: CheckCircle2, color: 'text-cyan-500' }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">
                {s.label}
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">
                {s.value}
              </p>
            </div>
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── TABS (SEGMENTED SWITCHER: MARKAZ vs GURUHSIz vs BARCHASI) ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 max-w-fit">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'enrolled'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap size={15} className="text-emerald-500" />
          <span>Markaz O'quvchilari</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {stats.enrolled}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unassigned')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'unassigned'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Globe size={15} className="text-amber-500" />
          <span>Guruhsiz / Onlayn</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {stats.unassigned}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users size={15} className="text-blue-500" />
          <span>Barchasi</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {stats.total}
          </span>
        </button>
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH, GROUP, TELEGRAM & SORT ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi yoki ota-ona ismi, telefoni orqali qidirish..."
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

        {/* Group Filter (Shown if enrolled or all) */}
        {activeTab !== 'unassigned' && allGroups.length > 0 && (
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Barcha Guruhlar</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.subject?.title || 'Fan'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Telegram Filter */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={telegramFilter}
            onChange={(e) => setTelegramFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">Telegram (Barchasi)</option>
            <option value="connected">Telegram ulangan</option>
            <option value="not_connected">Telegram ulanmagan</option>
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
            <option value="name_asc">Ismi bo'yicha (A-Z)</option>
            <option value="newest">Qo'shilgan sanasi (yangi)</option>
            <option value="groups_desc">Guruhlar soni (ko'pdan kamga)</option>
          </select>
        </div>
      </div>

      {/* ── STUDENTS GRID ── */}
      {loading ? (
        <StudentsGridSkeleton />
      ) : filteredStudents.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <Users size={36} className="mx-auto opacity-40" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday o'quvchi topilmadi</p>
            <p className="text-xs text-slate-400 mt-1">Qidiruv yoki filtr parametrlarini o'zgartirib ko'ring</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const initial = (student.full_name || '?')[0].toUpperCase();
            const formattedPhone = student.phone ? formatUzPhone(student.phone) : 'Telefon kiritilmagan';
            const formattedParentPhone = student.parent_phone ? formatUzPhone(student.parent_phone) : null;

            return (
              <div
                key={student.id}
                className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3.5">
                  {/* Top: Avatar & Full Name & Status Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base font-sans-pro shrink-0 border border-blue-500/20">
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => router.push(`/admin/students/${student.id}`)}
                          className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate font-sans-pro cursor-pointer"
                        >
                          {student.full_name || "Ismsiz O'quvchi"}
                        </h3>
                        {student.phone ? (
                          <a
                            href={`tel:${student.phone}`}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 mt-0.5 transition-colors"
                          >
                            <Smartphone size={12} className="shrink-0 text-slate-400" />
                            <span>{formattedPhone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Smartphone size={12} className="shrink-0 text-slate-400" />
                            <span>Raqam kiritilmagan</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Parent Information Card */}
                  <div className="p-2.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <UserCheck size={12} className="text-blue-500" />
                        <span>Ota-onasi:</span>
                      </span>
                    </div>
                    {formattedParentPhone ? (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {student.parent_name || 'Ota-ona'}
                        </span>
                        <a
                          href={`tel:${student.parent_phone}`}
                          className="font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shrink-0 flex items-center gap-1 transition-colors"
                        >
                          <Phone size={11} />
                          <span>{formattedParentPhone}</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">Ota-ona raqami kiritilmagan</p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(student);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(student.id, student.full_name || "O'quvchi");
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => router.push(`/admin/students/${student.id}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Profilga o'tish"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: ASSIGN STUDENT TO GROUP ── */}
      {assignModal?.open && assignModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <BookOpen size={18} className="text-blue-500" />
                <h3 className="font-bold text-base">Guruhga Biriktirish</h3>
              </div>
              <button
                onClick={() => setAssignModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">O'quvchi:</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-sans-pro">
                  {assignModal.student.full_name}
                </p>
              </div>

              {/* Current groups list */}
              {assignModal.student.groups && assignModal.student.groups.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hozirgi Guruhlari:</p>
                  <div className="space-y-2">
                    {assignModal.student.groups.map((grp) => (
                      <div
                        key={grp.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{grp.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{grp.subject || 'Fan'}</p>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveFromGroup(assignModal.student!.id, grp.id, grp.name)
                          }
                          className="px-2 py-1 text-[10px] font-extrabold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          Chiqarish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Select new group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Yangi guruhga qo'shish:
                </label>
                <select
                  value={selectedGroupIdToAssign}
                  onChange={(e) => setSelectedGroupIdToAssign(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="">-- Guruhni tanlang --</option>
                  {allGroups
                    .filter(
                      (g) =>
                        !(assignModal.student?.groups || []).some((myGrp) => myGrp.id === g.id)
                    )
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.subject?.title || 'Fan'}) - {g.student_count || 0} o'quvchi
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                Yopish
              </button>
              <button
                onClick={handleAssignToGroup}
                disabled={isAssigning || !selectedGroupIdToAssign}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isAssigning ? 'Biriktirilmoqda...' : 'Guruhga Qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT STUDENT & PARENT CRM ── */}
      {editModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Edit2 size={18} className="text-blue-600" />
                <h3 className="font-bold text-base">O'quvchi va Ota-ona Ma'lumotlarini Tahrirlash</h3>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">O'quvchi Ma'lumotlari</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">To'liq Ismi *</label>
                  <input
                    type="text"
                    value={editModal.fullName}
                    onChange={(e) => setEditModal({ ...editModal, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    placeholder="Masalan: Aliyev Vali"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">O'quvchi Telefon Raqami</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 flex items-center text-slate-400 select-none">
                      <Smartphone size={15} className="text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={editModal.phone}
                      onChange={(e) => setEditModal({ ...editModal, phone: formatUzPhone(e.target.value) })}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      placeholder="+998 (90) 123-45-67"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <UserCheck size={16} className="text-blue-600 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">Ota-ona Ma'lumotlari (Telegram Bot)</h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ota-ona Ismi / Kimligi</label>
                  <input
                    type="text"
                    value={editModal.parentName}
                    onChange={(e) => setEditModal({ ...editModal, parentName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                    placeholder="Masalan: Aliyeva Muxlisa (Onasi)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Ota-ona Telefon Raqami (Telegram Bot Ulanishi Uchun)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 flex items-center text-slate-400 select-none">
                      <PhoneCall size={15} className="text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={editModal.parentPhone}
                      onChange={(e) => setEditModal({ ...editModal, parentPhone: formatUzPhone(e.target.value) })}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                      placeholder="+998 (90) 123-45-67"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                    <span>Ota-ona botimizga kirib kontakt yuborganda, shu raqam orqali avtomatik bog'lanadi.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveStudentConfirm}
                disabled={isSavingStudent}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-blue-600/10"
              >
                {isSavingStudent ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: PROMOTE TO TEACHER ── */}
      {promoteModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <GraduationCap size={20} className="text-emerald-500" />
                <h3 className="font-bold text-base">O'qituvchi tayinlash</h3>
              </div>
              <button
                onClick={() => setPromoteModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-100">{promoteModal.studentName}</span> uchun dars beradigan fanlarni tanlang:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {subjects.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Fanlar topilmadi.</p>
                ) : (
                  subjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.title);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => toggleSubject(subject.title)}
                        className={`w-full p-3 rounded-2xl border transition-all text-xs font-semibold text-left ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-500/60 shadow-sm'
                            : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        {subject.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setPromoteModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePromoteConfirm}
                disabled={isPromoting || selectedSubjects.length === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPromoting ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
