"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Plus, Edit2, Trash2, Users, Video, Clock, DollarSign,
  GraduationCap, BookOpen, UserPlus, X, Play, CheckCircle2, Search, CheckSquare, Square, CalendarCheck
} from "lucide-react";
import {
  getSubjectById,
  getSubjectGroups,
  getSubjectLessons,
  createGroup,
  updateGroup,
  deleteGroup,
  createVideoLesson,
  deleteVideoLesson,
  assignStudentToGroup,
  assignMultipleStudentsToGroup,
  removeStudentFromGroup,
  type Group,
  type VideoLesson
} from "@/lib/admin-queries";
import { useTeachers, useStudents } from "@/hooks/useAdminData";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

export default function SubjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { subjectId } = use(params);

  const [subject, setSubject] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lessons, setLessons] = useState<VideoLesson[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'lessons'>('groups');
  const [loading, setLoading] = useState(true);

  // Group Modal states
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupSchedule, setGroupSchedule] = useState("");
  const [groupTeacherId, setGroupTeacherId] = useState("");
  const [groupPrice, setGroupPrice] = useState<number | "">("");
  const [groupSaving, setGroupSaving] = useState(false);

  // Lesson Modal states
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonUrl, setLessonUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonSaving, setLessonSaving] = useState(false);

  // Student Assignment Modal
  const [assignModalGroup, setAssignModalGroup] = useState<Group | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [assigning, setAssigning] = useState(false);

  const { data: teachers = [] } = useTeachers();
  const { data: students = [] } = useStudents();

  useEffect(() => {
    async function loadData() {
      try {
        const subData = await getSubjectById(subjectId);
        if (subData) setSubject(subData);

        const groupsData = await getSubjectGroups(subjectId);
        setGroups(groupsData);

        const lessonsData = await getSubjectLessons(subjectId);
        setLessons(lessonsData);
      } catch (e) {
        console.error("Failed to load subject detail:", e);
      } fontinally: {
        setLoading(false);
      }
    }
    loadData();
  }, [subjectId]);

  const reloadGroups = async () => {
    const data = await getSubjectGroups(subjectId);
    setGroups(data);
  };

  const reloadLessons = async () => {
    const data = await getSubjectLessons(subjectId);
    setLessons(data);
  };

  // Group Handlers
  const openAddGroupModal = () => {
    setEditingGroup(null);
    setGroupName("");
    setGroupSchedule("");
    setGroupTeacherId("");
    setGroupPrice("");
    setGroupModalOpen(true);
  };

  const openEditGroupModal = (g: Group) => {
    setEditingGroup(g);
    setGroupName(g.name);
    setGroupSchedule(g.schedule || "");
    setGroupTeacherId(g.teacher_id || "");
    setGroupPrice(g.price || "");
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) return toast.error("Guruh nomini kiriting!");

    setGroupSaving(true);
    try {
      const priceNum = typeof groupPrice === 'number' ? groupPrice : (parseInt(groupPrice) || 0);

      if (editingGroup) {
        const res = await updateGroup(editingGroup.id, { name: groupName, schedule: groupSchedule, teacher_id: groupTeacherId || undefined, price: priceNum });
        if (res.success) {
          toast.success("Guruh yangilandi!");
          setGroupModalOpen(false);
          reloadGroups();
        } else toast.error("Xatolik: " + res.error);
      } else {
        const res = await createGroup({ subject_id: subjectId, name: groupName, schedule: groupSchedule, teacher_id: groupTeacherId || undefined, price: priceNum });
        if (res.success) {
          toast.success("Yangi guruh yaratildi!");
          setGroupModalOpen(false);
          reloadGroups();
        } else toast.error("Xatolik: " + res.error);
      }
    } catch (e) {
      console.error("Save group error:", e);
    } finally {
      setGroupSaving(false);
    }
  };

  const handleDeleteGroup = async (g: Group) => {
    if (!confirm(`${g.name} guruhini o'chirmoqchimisiz?`)) return;
    const res = await deleteGroup(g.id);
    if (res.success) {
      toast.success("Guruh o'chirildi!");
      reloadGroups();
    } else toast.error("Xatolik: " + res.error);
  };

  // Lesson Handlers
  const handleSaveLesson = async () => {
    if (!lessonTitle.trim() || !lessonUrl.trim()) return toast.error("Barcha maydonlarni to'ldiring!");

    setLessonSaving(true);
    try {
      const res = await createVideoLesson(subjectId, lessonTitle, lessonUrl, lessonDuration);
      if (res.success) {
        toast.success("Video dars qo'shildi!");
        setLessonModalOpen(false);
        setLessonTitle(""); setLessonUrl(""); setLessonDuration("");
        reloadLessons();
      } else toast.error("Xatolik: " + res.error);
    } catch (e) {
      console.error("Save lesson error:", e);
    } finally {
      setLessonSaving(false);
    }
  };

  const handleDeleteLesson = async (l: VideoLesson) => {
    if (!confirm(`${l.title} darsini o'chirmoqchimisiz?`)) return;
    const res = await deleteVideoLesson(l.id);
    if (res.success) {
      toast.success("Dars o'chirildi!");
      reloadLessons();
    } else toast.error("Xatolik: " + res.error);
  };

  // Assign Multiple Students
  const handleAssignStudent = async () => {
    if (!assignModalGroup || selectedStudentIds.length === 0) return;
    setAssigning(true);

    try {
      const res = await assignMultipleStudentsToGroup(assignModalGroup.id, selectedStudentIds);
      if (res.success) {
        toast.success(`${selectedStudentIds.length} ta o'quvchi guruhga biriktirildi!`);
        setSelectedStudentIds([]);
        setStudentSearchTerm("");
        setAssignModalGroup(null);
        reloadGroups();
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (e: any) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-48" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Back */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/courses')}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Orqaga"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              {subject?.title || "Fan Ma'lumotlari"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              {subject?.description || "Guruhlar hamda video darslar boshqaruvi"}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Guruhlar ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Video Darslar ({lessons.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
              Guruhlar Ro'yxati
            </h2>
            <button
              onClick={openAddGroupModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Yangi Guruh Yaratish</span>
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Ushbu fanda hali guruhlar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                        {group.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                        {group.price ? `${group.price.toLocaleString('uz-UZ')} so'm` : "Bepul"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-slate-400 shrink-0" />
                        <span>O'qituvchi: {group.teacher?.full_name || "Biriktirilmagan"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock size={15} className="text-slate-400 shrink-0" />
                        <span>{group.schedule || "Vaqt kiritilmagan"}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Users size={15} className="text-slate-400 shrink-0" />
                        <span>O'quvchilar: {group.student_count || 0} ta</span>
                      </p>
                    </div>
                  </div>

                  {/* Box-free Group Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAssignModalGroup(group)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <UserPlus size={15} />
                        <span>O'quvchi qo'shish</span>
                      </button>

                      <button
                        onClick={() => router.push(`/admin/attendance?groupId=${group.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
                      >
                        <CalendarCheck size={15} />
                        <span>Davomat</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditGroupModal(group)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100">
              Video Darslar
            </h2>
            <button
              onClick={() => setLessonModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Yangi Video Dars</span>
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Video size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Video darslar hali yuklanmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-brand-blue font-bold text-xs sm:text-sm">
                      <Play size={15} />
                      <span>{lesson.duration || "15 daqiqa"}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
                      {lesson.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-colors"
                    >
                      Videoni ko'rish
                    </a>
                    <button
                      onClick={() => handleDeleteLesson(lesson)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              {editingGroup ? "Guruhni Tahrirlash" : "Yangi Guruh Yaratish"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Guruh Nomi *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Masalan: Math-101"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Dars Vaqti / Dastur</label>
                <input
                  type="text"
                  value={groupSchedule}
                  onChange={(e) => setGroupSchedule(e.target.value)}
                  placeholder="Masalan: Dush-Shor-Juma 14:00"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Oylik To'lov Narxi (so'm)</label>
                <input
                  type="number"
                  value={groupPrice}
                  onChange={(e) => setGroupPrice(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Masalan: 450000"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">O'qituvchi</label>
                <select
                  value={groupTeacherId}
                  onChange={(e) => setGroupTeacherId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="">— Biriktirilmagan —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || t.phone || "Ismsiz"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setGroupModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Bekor qilish
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={groupSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50"
              >
                {groupSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Create Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Yangi Video Dars Qo'shish
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Dars Mavzusi *</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Masalan: Tenglamalar 1-qism"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Video URL (YouTube/Vimeo) *</label>
                <input
                  type="text"
                  value={lessonUrl}
                  onChange={(e) => setLessonUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">Davomiyligi</label>
                <input
                  type="text"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="Masalan: 25 min"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setLessonModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Bekor qilish
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={lessonSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50"
              >
                {lessonSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Student Assignment Modal with Live Search */}
      {assignModalGroup && (() => {
        const matchingStudents = students.filter(s => {
          const query = studentSearchTerm.toLowerCase();
          return (s.full_name || "").toLowerCase().includes(query) || (s.phone || "").toLowerCase().includes(query);
        });

        const allFilteredSelected = matchingStudents.length > 0 && matchingStudents.every(s => selectedStudentIds.includes(s.id));

        const toggleStudent = (id: string) => {
          if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
          } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
          }
        };

        const toggleSelectAllFiltered = () => {
          const filteredIds = matchingStudents.map(s => s.id);
          if (allFilteredSelected) {
            setSelectedStudentIds(selectedStudentIds.filter(id => !filteredIds.includes(id)));
          } else {
            const merged = Array.from(new Set([...selectedStudentIds, ...filteredIds]));
            setSelectedStudentIds(merged);
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <UserPlus size={20} className="text-brand-blue" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                      {assignModalGroup.name} guruhiga o'quvchi qo'shish
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Bir vaqtning o'zida bir nechta o'quvchini tanlashingiz mumkin</p>
                  </div>
                </div>
                <button
                  onClick={() => { setAssignModalGroup(null); setStudentSearchTerm(""); setSelectedStudentIds([]); }}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Live Search Input */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  placeholder="O'quvchi ismi yoki telefon raqami bo'yicha qidirish..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                {studentSearchTerm && (
                  <button
                    onClick={() => setStudentSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Students List Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <div className="flex items-center gap-2">
                    <span>Mavjud O'quvchilar ({matchingStudents.length})</span>
                    {selectedStudentIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-[10px]">
                        {selectedStudentIds.length} ta tanlandi
                      </span>
                    )}
                  </div>

                  {matchingStudents.length > 0 && (
                    <button
                      onClick={toggleSelectAllFiltered}
                      className="text-brand-blue hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      {allFilteredSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                      <span>{allFilteredSelected ? "Tanlovni bekor qilish" : "Barchasini tanlash"}</span>
                    </button>
                  )}
                </div>

                {matchingStudents.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-semibold">Qidiruvga mos o'quvchi topilmadi</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {matchingStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleStudent(s.id)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 ring-2 ring-brand-blue/20 shadow-sm'
                              : 'border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center uppercase shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/30'
                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {(s.full_name || s.phone || "U").charAt(0)}
                            </div>
                            <div>
                              <p className={`text-xs font-extrabold transition-colors ${
                                isSelected ? 'text-brand-blue dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'
                              }`}>
                                {s.full_name || "Ismsiz o'quvchi"}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {s.phone || "Telefon kiritilmagan"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">
                  {selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ta o'quvchi tanlandi` : "Hali tanlanmadi"}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setAssignModalGroup(null); setStudentSearchTerm(""); setSelectedStudentIds([]); }}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleAssignStudent}
                    disabled={selectedStudentIds.length === 0 || assigning}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50 shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2"
                  >
                    {assigning ? "Biriktirilmoqda..." : selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ta o'quvchini qo'shish` : "Tanlanmagan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
