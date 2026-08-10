'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowLeft,
  CalendarCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpenCheck,
  AlertTriangle,
  Send,
  Save,
  Check,
  Search,
  Sparkles,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Copy,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  schedule?: string;
  teacher?: { full_name: string } | null;
  subject?: { title: string } | null;
}

interface StudentProfile {
  id: string;
  full_name: string;
  phone?: string;
  parent_name?: string;
  parent_phone?: string;
  telegram_id?: number;
}

interface AttendanceState {
  status: 'present' | 'absent' | 'late';
  homework: 'done' | 'not_done' | 'partially' | 'none';
  notes: string;
  notifyTelegram: boolean;
}

export default function AttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get('groupId') || '';

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const supabase = createClient();

  // Load Groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, schedule, teacher:profiles!groups_teacher_id_fkey(full_name), subject:subjects(title)')
          .order('name');

        if (error) throw error;
        const formattedGroups: Group[] = (data || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          schedule: g.schedule,
          teacher: Array.isArray(g.teacher) ? g.teacher[0] : g.teacher,
          subject: Array.isArray(g.subject) ? g.subject[0] : g.subject,
        }));
        setGroups(formattedGroups);

        if (!selectedGroupId && formattedGroups.length > 0) {
          setSelectedGroupId(formattedGroups[0].id);
        }
      } catch (err: any) {
        console.error('Error loading groups:', err);
        toast.error("Guruhlarni yuklashda xatolik");
      }
    }
    loadGroups();
  }, []);

  // Load Students and Attendance for Selected Group & Date
  useEffect(() => {
    if (!selectedGroupId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    async function loadAttendanceData() {
      setLoading(true);
      setTableMissing(false);
      try {
        // 1. Fetch group students
        const { data: gsData, error: gsError } = await supabase
          .from('group_students')
          .select('student:profiles!student_id(id, full_name, phone, parent_name, parent_phone, telegram_id)')
          .eq('group_id', selectedGroupId);

        if (gsError) throw gsError;

        const loadedStudents: StudentProfile[] = (gsData || [])
          .map((item: any) => item.student)
          .filter(Boolean);

        setStudents(loadedStudents);

        // 2. Fetch existing attendance records
        const { data: attData, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('group_id', selectedGroupId)
          .eq('date', selectedDate);

        if (attError) {
          if (attError.code === 'PGRST205') {
            setTableMissing(true);
          } else {
            console.error('Attendance fetch error:', attError);
          }
        }

        // 3. Map attendance state per student
        const stateMap: Record<string, AttendanceState> = {};
        const existingMap = new Map((attData || []).map((a: any) => [a.student_id, a]));

        loadedStudents.forEach((st) => {
          const existing = existingMap.get(st.id);
          stateMap[st.id] = {
            status: existing?.status || 'present',
            homework: existing?.homework || 'done',
            notes: existing?.notes || '',
            notifyTelegram: false,
          };
        });

        setAttendanceData(stateMap);
      } catch (err: any) {
        console.error('Error loading attendance sheet:', err);
        toast.error("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    }

    loadAttendanceData();
  }, [selectedGroupId, selectedDate]);

  // Quick action: Mark all present & done
  const markAllPresent = () => {
    setAttendanceData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((stId) => {
        updated[stId] = {
          ...updated[stId],
          status: 'present',
          homework: 'done',
        };
      });
      return updated;
    });
    toast.success("Barcha o'quvchilar Keldi va Vazifa bajargan deb belgilandi");
  };

  // Toggle or update individual student attendance state
  const updateStudentState = (studentId: string, updates: Partial<AttendanceState>) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }));
  };

  // Save Attendance to Database & Send Notifications
  const handleSaveAttendance = async () => {
    if (!selectedGroupId || students.length === 0) return;

    setSaving(true);
    try {
      const recordsToSave = students.map((st) => {
        const state = attendanceData[st.id] || { status: 'present', homework: 'done', notes: '' };
        return {
          group_id: selectedGroupId,
          student_id: st.id,
          date: selectedDate,
          status: state.status,
          homework: state.homework,
          notes: state.notes || null,
        };
      });

      // 1. Save to Supabase
      const { data, error } = await supabase
        .from('attendance')
        .upsert(recordsToSave, { onConflict: 'group_id,student_id,date' })
        .select();

      if (error) {
        if (error.code === 'PGRST205') {
          setTableMissing(true);
          toast.error("Jadval topilmadi! Pastdagi SQL migratsiyani bajaring.");
          setSaving(false);
          return;
        }
        throw error;
      }

      // 2. Trigger Telegram alerts for absent / late / missing homework
      const currentGroup = groups.find((g) => g.id === selectedGroupId);
      let notifCount = 0;

      for (const st of students) {
        const state = attendanceData[st.id];
        if (state && (state.status === 'absent' || state.status === 'late' || state.homework === 'not_done')) {
          try {
            await fetch('/api/telegram/notify-attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                groupId: selectedGroupId,
                groupName: currentGroup?.name,
                studentId: st.id,
                studentName: st.full_name,
                date: selectedDate,
                status: state.status,
                homework: state.homework,
              }),
            });
            notifCount++;
          } catch (nErr) {
            console.error('Failed notify:', nErr);
          }
        }
      }

      toast.success(
        `Davomat saqlandi! ${notifCount > 0 ? `(${notifCount} ta Telegram ogohlantirish yuborildi)` : ''}`
      );
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error("Davomatni saqlashda xatolik: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered Students
  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalStudents = students.length;
  const presentCount = Object.values(attendanceData).filter((a) => a.status === 'present').length;
  const absentCount = Object.values(attendanceData).filter((a) => a.status === 'absent').length;
  const lateCount = Object.values(attendanceData).filter((a) => a.status === 'late').length;
  const homeworkNotDoneCount = Object.values(attendanceData).filter((a) => a.homework === 'not_done').length;

  const currentGroup = groups.find((g) => g.id === selectedGroupId);

  const sqlMigrationCode = `-- Supabase SQL Editor'da ishga tushiring:
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  homework TEXT NOT NULL DEFAULT 'done' CHECK (homework IN ('done', 'not_done', 'partially', 'none')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow manage attendance" ON public.attendance FOR ALL USING (true);`;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shadow-sm shrink-0 flex items-center gap-1.5 text-xs font-bold"
            title="Orqaga qaytish"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Orqaga</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 shrink-0">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                Davomat va Uy Vazifasi
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Guruhlar bo'yicha kundalik davomat va uy vazifalarini belgilash hamda Telegram xabarnoma yuborish
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || students.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saqlanmoqda...' : 'Davomatni Saqlash'}</span>
          </button>
        </div>
      </div>

      {/* SQL Migration Warning if Table is Missing */}
      {tableMissing && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 space-y-3">
          <div className="flex items-start gap-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={22} className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Ma'lumotlar bazasida `attendance` jadvali hali yaratilmagan!</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Davomatni bazaga saqlash uchun quyidagi SQL kodni Supabase SQL Editor darchasiga qo'shib ishga tushiring:
              </p>
            </div>
          </div>

          <div className="relative bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-40">
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlMigrationCode);
                toast.success("SQL nusxalandi!");
              }}
              className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Copy size={12} />
              <span>Nusxalash</span>
            </button>
            <pre>{sqlMigrationCode}</pre>
          </div>
        </div>
      )}

      {/* Group Selector & Filters */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Group Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Guruhni tanlang:</span>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none max-w-xs"
            >
              {groups.length === 0 ? (
                <option value="">Guruhlar topilmadi</option>
              ) : (
                groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({(g.subject as any)?.title || 'Fan'})
                  </option>
                ))
              )}
            </select>

            {currentGroup && (
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 pl-2">
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} className="text-slate-400" />
                  {(currentGroup.teacher as any)?.full_name || "O'qituvchi tayinlanmagan"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-slate-400" />
                  {currentGroup.schedule || "Vaqtsiz"}
                </span>
              </div>
            )}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="O'quvchini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl border-none text-xs font-semibold placeholder:text-slate-400 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <button
              onClick={markAllPresent}
              disabled={students.length === 0}
              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-xl text-xs font-bold transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
              title="Hamma o'quvchini Keldi deb belgilash"
            >
              <CheckCircle2 size={15} />
              <span className="hidden sm:inline">Hamma Keldi</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jami O'quvchi</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{totalStudents}</span>
            </div>
            <Users size={20} className="text-slate-400" />
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Keldi</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{presentCount}</span>
            </div>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Kelmadi</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">{absentCount}</span>
            </div>
            <XCircle size={20} className="text-rose-500" />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Kechikdi / Bajarilmadi</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {lateCount} <span className="text-xs font-medium text-slate-400">({homeworkNotDoneCount} vazifa)</span>
              </span>
            </div>
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
        </div>
      </div>

      {/* Attendance & Homework Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Davomat ma'lumotlari yuklanmoqda...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Ushbu guruhda o'quvchilar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((student, index) => {
            const state = attendanceData[student.id] || {
              status: 'present',
              homework: 'done',
              notes: '',
              notifyTelegram: false,
            };

            const isParentLinked = !!student.parent_phone || !!student.telegram_id;

            return (
              <div
                key={student.id}
                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-3xl p-4 sm:p-5 transition-all space-y-4 ${
                  state.status === 'absent'
                    ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                    : state.status === 'late'
                    ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-sm flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                          {student.full_name}
                        </h3>
                        {isParentLinked && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Send size={10} />
                            <span>Telegram ulangan</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>Tel: {student.phone || "Kiritilmagan"}</span>
                        {student.parent_name && (
                          <span>• Ota-onasi: {student.parent_name} ({student.parent_phone})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Status Selectors */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Davomat
                      </span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { status: 'present' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.status === 'present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>Keldi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { status: 'absent' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.status === 'absent'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <XCircle size={14} />
                          <span>Kelmadi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { status: 'late' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.status === 'late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <Clock size={14} />
                          <span>Kechikdi</span>
                        </button>
                      </div>
                    </div>

                    {/* Homework Selectors */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Uy Vazifasi
                      </span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { homework: 'done' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.homework === 'done'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <BookOpenCheck size={14} />
                          <span>Bajarildi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { homework: 'partially' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.homework === 'partially'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <AlertTriangle size={14} />
                          <span>Qisman</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentState(student.id, { homework: 'not_done' })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            state.homework === 'not_done'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          <XCircle size={14} />
                          <span>Bajarmadi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Note / Izoh */}
                <div className="pt-2 flex items-center gap-2">
                  <MessageSquare size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Qo'shimcha izoh (masalan: 15 daqiqa kechikdi)..."
                    value={state.notes}
                    onChange={(e) => updateStudentState(student.id, { notes: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Save Bar on Mobile */}
      <div className="sticky bottom-6 flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSaveAttendance}
          disabled={saving || loading || students.length === 0}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? 'Saqlanmoqda...' : 'Barchasini Saqlash & Xabarnoma Yuborish'}</span>
        </button>
      </div>
    </div>
  );
}
