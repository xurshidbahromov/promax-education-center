'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpenCheck,
  AlertTriangle,
  AlertCircle,
  Send,
  Save,
  Search,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Copy,
  Layers,
  BookOpen,
  Calculator,
  Atom,
  Languages,
  Code2,
  FlaskConical,
  Dna,
  Landmark,
  Calendar,
  CheckCheck,
  X,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendAttendanceNotificationToStudentAndParents } from '@/lib/notifications-bridge';

interface Group {
  id: string;
  name: string;
  schedule?: string;
  teacher?: { full_name: string } | null;
  subject?: { title?: string; name?: string } | null;
  students_count?: number;
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

function getSubjectMeta(subjectName: string = '') {
  const s = subjectName.toLowerCase();
  if (s.includes('matematik') || s.includes('algebra') || s.includes('geometriya') || s.includes('math')) {
    return {
      Icon: Calculator,
      colorText: 'text-blue-600 dark:text-blue-400',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      pillActive: 'bg-blue-600 text-white',
    };
  }
  if (s.includes('fizik') || s.includes('physic')) {
    return {
      Icon: Atom,
      colorText: 'text-purple-600 dark:text-purple-400',
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      pillActive: 'bg-purple-600 text-white',
    };
  }
  if (s.includes('ingliz') || s.includes('ielts') || s.includes('cefr') || s.includes('english')) {
    return {
      Icon: Languages,
      colorText: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      pillActive: 'bg-amber-600 text-white',
    };
  }
  if (s.includes('dastur') || s.includes('it') || s.includes('python') || s.includes('frontend') || s.includes('code')) {
    return {
      Icon: Code2,
      colorText: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      pillActive: 'bg-emerald-600 text-white',
    };
  }
  if (s.includes('kimyo') || s.includes('chemist')) {
    return {
      Icon: FlaskConical,
      colorText: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      pillActive: 'bg-rose-600 text-white',
    };
  }
  if (s.includes('biolog')) {
    return {
      Icon: Dna,
      colorText: 'text-teal-600 dark:text-teal-400',
      badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      pillActive: 'bg-teal-600 text-white',
    };
  }
  if (s.includes('tarix') || s.includes('huquq')) {
    return {
      Icon: Landmark,
      colorText: 'text-orange-600 dark:text-orange-400',
      badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      pillActive: 'bg-orange-600 text-white',
    };
  }
  return {
    Icon: BookOpen,
    colorText: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    pillActive: 'bg-indigo-600 text-white',
  };
}

// ── SKELETON LOADERS ──
function GroupsGridSkeleton() {
  return (
    <div className="space-y-12 animate-pulse pt-2">
      {[1, 2].map((sIndex) => (
        <div key={sIndex} className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-5 w-36 rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-5 w-16 rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((cIndex) => (
              <div
                key={cIndex}
                className="p-5 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-40 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
                  <div className="h-4 w-12 rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
                  <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="h-3 w-20 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                  <div className="h-4 w-16 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentsListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-200/80 dark:bg-slate-800/80 rounded-md" />
                <div className="h-3 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-md" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="h-8 w-56 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
              <div className="h-8 w-56 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
            </div>
          </div>
          <div className="pt-2 h-7 w-full bg-slate-200/40 dark:bg-slate-800/40 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function AttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'students_desc' | 'students_asc'>('name_asc');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceState>>({});
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  const supabase = createClient();

  // Load all Groups with student counts
  useEffect(() => {
    async function loadGroups() {
      setLoadingGroups(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            schedule,
            teacher:profiles!groups_teacher_id_fkey(full_name),
            subject:subjects(title, name),
            group_students(count)
          `)
          .order('name');

        if (error) throw error;

        const formattedGroups: Group[] = (data || []).map((g: any) => {
          const rawSubj = Array.isArray(g.subject) ? g.subject[0] : g.subject;
          const rawTitle = rawSubj?.title || rawSubj?.name || 'Boshqa fanlar';
          const cleanTitle = rawTitle.replace(/^[\p{Emoji}\p{Extended_Pictographic}\u200d\uFE0F\s]+/gu, '').trim() || rawTitle;

          return {
            id: g.id,
            name: g.name,
            schedule: g.schedule,
            teacher: Array.isArray(g.teacher) ? g.teacher[0] : g.teacher,
            subject: { title: cleanTitle, name: cleanTitle },
            students_count: g.group_students?.[0]?.count || 0,
          };
        });

        setGroups(formattedGroups);
      } catch (err: any) {
        console.error('Error loading groups:', err);
        toast.error("Guruhlarni yuklashda xatolik");
      } finally {
        setLoadingGroups(false);
      }
    }
    loadGroups();
  }, []);

  // Subject Grouping mapping
  const groupedBySubject = useMemo(() => {
    const map: Record<string, Group[]> = {};
    groups.forEach((g) => {
      const subjTitle = g.subject?.title || g.subject?.name || 'Boshqa fanlar';
      if (!map[subjTitle]) {
        map[subjTitle] = [];
      }
      map[subjTitle].push(g);
    });
    return map;
  }, [groups]);

  const subjectList = useMemo(() => Object.keys(groupedBySubject), [groupedBySubject]);

  // Active Group Details
  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return groups.find((g) => g.id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  // Load Students and Attendance when inside a specific Group
  useEffect(() => {
    if (!activeGroupId) {
      setStudents([]);
      return;
    }

    async function loadAttendanceData() {
      setLoadingStudents(true);
      setTableMissing(false);
      try {
        // 1. Fetch group students
        const { data: gsData, error: gsError } = await supabase
          .from('group_students')
          .select('student:profiles!student_id(id, full_name, phone, parent_name, parent_phone, telegram_id)')
          .eq('group_id', activeGroupId);

        if (gsError) throw gsError;

        const loadedStudents: StudentProfile[] = (gsData || [])
          .map((item: any) => item.student)
          .filter(Boolean);

        setStudents(loadedStudents);

        // 2. Fetch existing attendance records for the selected date
        const { data: attData, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('group_id', activeGroupId)
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
        setLoadingStudents(false);
      }
    }

    loadAttendanceData();
  }, [activeGroupId, selectedDate]);

  // Navigate to group
  const handleOpenGroup = (groupId: string) => {
    router.push(`/admin/attendance?groupId=${groupId}`);
  };

  // Back to all groups
  const handleBackToGroups = () => {
    router.push('/admin/attendance');
  };

  // Mark all present & done
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

  // Update individual student attendance state
  const updateStudentState = (studentId: string, updates: Partial<AttendanceState>) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
      },
    }));
  };

  // Save Attendance & Dispatch Telegram Notifications for this Group
  const handleSaveGroupAttendance = async () => {
    if (!activeGroupId || students.length === 0) return;

    setSaving(true);
    try {
      const recordsToSave = students.map((st) => {
        const state = attendanceData[st.id] || { status: 'present', homework: 'done', notes: '' };
        return {
          group_id: activeGroupId,
          student_id: st.id,
          date: selectedDate,
          status: state.status,
          homework: state.homework,
          notes: state.notes || null,
        };
      });

      // 1. Save to Supabase attendance table
      const { error } = await supabase
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

      // 2. Trigger Telegram alerts to student and all linked parents
      for (const st of students) {
        const state = attendanceData[st.id] || { status: 'present', homework: 'done', notes: '' };
        if (state) {
          sendAttendanceNotificationToStudentAndParents({
            groupId: activeGroupId,
            groupName: activeGroup?.name,
            studentId: st.id,
            date: selectedDate,
            status: state.status,
            homework: state.homework,
            notes: state.notes,
          });
        }
      }

      toast.success("Davomat saqlandi va Telegram orqali xabarnoma yuborildi!");
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      toast.error("Davomatni saqlashda xatolik: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered Students inside active group
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      return (
        s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        (s.phone || '').includes(studentSearchQuery)
      );
    });
  }, [students, studentSearchQuery]);

  // Statistics for active group
  const totalStudents = students.length;
  const presentCount = Object.values(attendanceData).filter((a) => a.status === 'present').length;
  const absentCount = Object.values(attendanceData).filter((a) => a.status === 'absent').length;
  const lateCount = Object.values(attendanceData).filter((a) => a.status === 'late').length;
  const homeworkDoneCount = Object.values(attendanceData).filter((a) => a.homework === 'done').length;
  const homeworkNotDoneCount = Object.values(attendanceData).filter((a) => a.homework === 'not_done').length;

  const activeSubjectTitle = activeGroup?.subject?.title || activeGroup?.subject?.name || 'Fan';
  const activeSubjectMeta = getSubjectMeta(activeSubjectTitle);

  const sqlMigrationCode = `-- Attendance table migration
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  homework TEXT NOT NULL DEFAULT 'done' CHECK (homework IN ('done', 'not_done', 'partially', 'none')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id, date)
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on attendance" ON attendance FOR ALL USING (true);`;

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 1: DEDICATED GROUP ATTENDANCE SHEET (ICHMA-ICH KIRILGAN GURUH SAHIFASI)
  // ══════════════════════════════════════════════════════════════════════════════
  if (activeGroupId) {
    const { Icon: SubjectIcon } = activeSubjectMeta;

    return (
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToGroups}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2 group text-xs font-bold"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Guruhlarga qaytish</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Davomat</span>
              <ChevronRight size={14} />
              <span className="text-slate-600 dark:text-slate-300">{activeSubjectTitle}</span>
              <ChevronRight size={14} />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeGroup?.name || "Guruh"}</span>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 self-start sm:self-auto">
            <Calendar size={15} className="text-emerald-500 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Group Banner & Stats Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 space-y-5">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Group Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <SubjectIcon size={22} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                    {activeGroup?.name || "Guruh Jurnali"}
                  </h1>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${activeSubjectMeta.badgeClass}`}>
                    {activeSubjectTitle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-slate-400" />
                    <span>{activeGroup?.teacher?.full_name || "O'qituvchi belgilanmagan"}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>{activeGroup?.schedule || "Dars vaqti belgilanmagan"}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Users size={14} />
                    <span>{totalStudents} nafar o'quvchi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Search & Mark All */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="O'quvchini qidirish..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                onClick={markAllPresent}
                disabled={students.length === 0}
                className="px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5 active:scale-95 border border-emerald-500/20"
                title="Barcha o'quvchilarni Keldi deb belgilash"
              >
                <CheckCheck size={15} />
                <span>Hamma Keldi</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jami O'quvchi</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{totalStudents}</span>
              </div>
              <Users size={18} className="text-slate-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Keldi</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{presentCount}</span>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Kelmadi</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400">{absentCount}</span>
              </div>
              <XCircle size={18} className="text-rose-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Kechikdi / Vazifa</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  {lateCount} <span className="text-xs font-medium text-slate-400">({homeworkNotDoneCount} ta vazifasiz)</span>
                </span>
              </div>
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
          </div>
        </div>

        {/* Student Attendance List with Skeleton Loader */}
        {loadingStudents ? (
          <StudentsListSkeleton />
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
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
                  className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-4 sm:p-5 transition-colors space-y-4 ${
                    state.status === 'absent'
                      ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
                      : state.status === 'late'
                      ? 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10'
                      : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                            {student.full_name}
                          </h3>
                          {isParentLinked && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
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

                    {/* Attendance & Homework Controls */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Davomat Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Davomat
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { status: 'present' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.status === 'present'
                                ? 'bg-emerald-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                            <span>Keldi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { status: 'absent' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.status === 'absent'
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <XCircle size={13} />
                            <span>Kelmadi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { status: 'late' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <Clock size={13} />
                            <span>Kechikdi</span>
                          </button>
                        </div>
                      </div>

                      {/* Uy Vazifasi Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Uy Vazifasi
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { homework: 'done' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.homework === 'done'
                                ? 'bg-emerald-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <BookOpenCheck size={13} />
                            <span>Bajarildi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { homework: 'partially' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.homework === 'partially'
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <AlertCircle size={13} />
                            <span>Qisman</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStudentState(student.id, { homework: 'not_done' })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              state.homework === 'not_done'
                                ? 'bg-rose-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            <XCircle size={13} />
                            <span>Bajarmadi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Izoh */}
                  <div className="pt-2 flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Qo'shimcha izoh (masalan: 15 daqiqa kechikdi, sababli qoldirdi)..."
                      value={state.notes}
                      onChange={(e) => updateStudentState(student.id, { notes: e.target.value })}
                      className="w-full bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating / Bottom Save Bar */}
        <div className="sticky bottom-6 flex items-center justify-end gap-3 pt-4 z-20">
          <button
            onClick={handleSaveGroupAttendance}
            disabled={saving || loadingStudents || students.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{saving ? 'Saqlanmoqda...' : 'Ushbu Guruh Davomatini Saqlash & Yuborish'}</span>
          </button>
        </div>

      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 2: MASTER GROUPS & SUBJECTS OVERVIEW (UMUMIY FANLAR VA GURUHLAR BOXLARI)
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Davomat va Guruhlar Jurnali
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Davomat qilish uchun kerakli fan va guruh boxini tanlang
          </p>
        </div>

        {/* Global Stats Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Layers size={15} className="text-emerald-500" />
            <span>{subjectList.length} ta Fan</span>
            <span>•</span>
            <span>{groups.length} ta Guruh</span>
          </div>
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

      {/* ── UNIFIED SEARCH & SORT BAR ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Guruh, fan yoki o'qituvchi nomi bo'yicha qidirish..."
            value={groupSearchQuery}
            onChange={(e) => setGroupSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {groupSearchQuery && (
            <button
              onClick={() => setGroupSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="name_asc">Nomi (A - Z)</option>
            <option value="name_desc">Nomi (Z - A)</option>
            <option value="students_desc">O'quvchilar (ko'pdan kamga)</option>
            <option value="students_asc">O'quvchilar (kamdan ko'pga)</option>
          </select>
        </div>
      </div>

      {/* ── SUBJECT FILTER PILLS ── */}
      <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            selectedSubjectFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers size={13} />
          <span>Barcha fanlar ({groups.length})</span>
        </button>

        {subjectList.map((subj) => {
          const meta = getSubjectMeta(subj);
          const { Icon: SubjIcon } = meta;
          const isSelected = selectedSubjectFilter === subj;
          const count = groupedBySubject[subj]?.length || 0;

          return (
            <button
              key={subj}
              onClick={() => setSelectedSubjectFilter(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? meta.pillActive
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <SubjIcon size={13} />
              <span>{subj}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-extrabold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── SUBJECT SECTIONS & GROUPS CARDS GRID (With Skeleton Loader) ── */}
      {loadingGroups ? (
        <GroupsGridSkeleton />
      ) : groups.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hozircha hech qanday guruh mavjud emas</p>
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-14 pt-2">
          {subjectList
            .filter((subj) => selectedSubjectFilter === 'all' || selectedSubjectFilter === subj)
            .map((subjectName, index) => {
              const meta = getSubjectMeta(subjectName);
              const { Icon: SubjectIcon } = meta;
              
              const allSubjectGroups = groupedBySubject[subjectName] || [];
              let subjectGroups = allSubjectGroups.filter((g) => {
                if (!groupSearchQuery) return true;
                const q = groupSearchQuery.toLowerCase();
                return (
                  g.name.toLowerCase().includes(q) ||
                  (g.teacher?.full_name || '').toLowerCase().includes(q) ||
                  (g.schedule || '').toLowerCase().includes(q) ||
                  subjectName.toLowerCase().includes(q)
                );
              });

              // Apply Sorting
              subjectGroups = subjectGroups.sort((a, b) => {
                if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
                if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
                if (sortBy === 'students_desc') return (b.students_count || 0) - (a.students_count || 0);
                if (sortBy === 'students_asc') return (a.students_count || 0) - (b.students_count || 0);
                return 0;
              });

              if (subjectGroups.length === 0 && groupSearchQuery) {
                return null;
              }

              return (
                <div key={subjectName} className="space-y-4">
                  
                  {/* Subtle Separator Line between sections */}
                  {index > 0 && (
                    <div className="relative pb-6 flex items-center justify-center">
                      <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50" />
                      <div className="absolute px-3 bg-[#f8fafc] dark:bg-[#020617] text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>{subjectName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      </div>
                    </div>
                  )}

                  {/* Subject Section Title */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-1.5 rounded-xl border ${meta.badgeClass}`}>
                        <SubjectIcon size={15} />
                      </span>
                      <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                        {subjectName}
                      </h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                        {subjectGroups.length} ta guruh
                      </span>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {subjectGroups.map((g) => {
                      return (
                        <div
                          key={g.id}
                          onClick={() => handleOpenGroup(g.id)}
                          className="group relative p-5 rounded-3xl cursor-pointer transition-colors duration-150 flex flex-col justify-between gap-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-xl active:scale-[0.99]"
                        >
                          {/* Top Badges */}
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${meta.badgeClass}`}>
                              <SubjectIcon size={12} />
                              <span className="truncate max-w-[120px]">{subjectName}</span>
                            </span>

                            <span className="text-[11px] font-bold text-slate-400 transition-colors flex items-center gap-1">
                              <span>Kirish</span>
                              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>

                          {/* Group Name & Teacher */}
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors line-clamp-1 font-sans-pro">
                              {g.name}
                            </h3>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                              <GraduationCap size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate">{g.teacher?.full_name || "O'qituvchi tayinlanmagan"}</span>
                            </p>
                          </div>

                          {/* Bottom Schedule & Student Count */}
                          <div className="pt-3 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              <span className="truncate max-w-[120px]">{g.schedule || "Vaqtsiz"}</span>
                            </span>

                            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                              <Users size={12} className="text-emerald-500" />
                              <span>{g.students_count || 0} o'quvchi</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
        </div>
      )}

    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="h-10 w-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl animate-pulse" />
        <GroupsGridSkeleton />
      </div>
    }>
      <AttendanceContent />
    </Suspense>
  );
}
