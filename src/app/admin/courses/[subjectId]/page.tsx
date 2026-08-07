"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Users, Clock, Trash2, Edit2,
  User, Archive, ArchiveRestore,
  Search, X, UserPlus, PlayCircle, Layers, Video
} from "lucide-react";
import {
  createGroup, updateGroup, deleteGroup,
  addStudentToGroup, removeStudentFromGroup,
  createVideoLesson, updateVideoLesson, deleteVideoLesson,
  type Group, type GroupStudent
} from "@/lib/admin-queries";
import { type Lesson } from "@/lib/supabase-queries";
import { 
  useSubject, useGroups, useTeachers, useLessons, useMaterialsByLessons,
  useGroupStudents, useAvailableStudents
} from "@/hooks/useAdminData";
import toast from "react-hot-toast";

interface PageProps { params: Promise<{ subjectId: string }> }
type ModalMode = "create" | "edit" | "students" | "create_video" | "edit_video" | null;

const emptyForm = {
  id: "", name: "", description: "",
  max_students: 20, schedule: "", teacher_id: "", status: "active" as "active" | "archived", price: 0
};

const emptyVideoForm = {
  id: "", title: "", description: "", url: ""
};

export default function SubjectGroupsPage({ params }: PageProps) {
  const { subjectId } = use(params);
  
  // Data Queries
  const { data: subject, isLoading: subjectLoading } = useSubject(subjectId);
  const { data: groups = [], isLoading: groupsLoading } = useGroups(subjectId);
  const { data: teachers = [] } = useTeachers();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(subjectId);
  const { data: materials = {} } = useMaterialsByLessons(lessons);

  const [activeTab, setActiveTab] = useState<"groups" | "videos">("groups");
  const [modal, setModal] = useState<ModalMode>(null);
  
  // Group States
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // Student Modal Queries
  const { data: groupStudents = [], isLoading: studentsLoading } = useGroupStudents(selectedGroup?.id || "");
  const [addSearch, setAddSearch] = useState("");
  const { data: availableStudents = [] } = useAvailableStudents(selectedGroup?.id || "", addSearch);
  const [addingStudent, setAddingStudent] = useState(false);

  // Video States
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const isLoading = subjectLoading || groupsLoading || lessonsLoading;

  // --- Group Functions ---
  const openCreate = () => { setForm({ ...emptyForm }); setSelectedGroup(null); setModal("create"); };
  const openEdit = (g: Group) => {
    setForm({ id: g.id, name: g.name, description: g.description || "", max_students: g.max_students, schedule: g.schedule || "", teacher_id: g.teacher_id || "", status: g.status, price: g.price || 0 });
    setSelectedGroup(g); setModal("edit");
  };
  const openStudents = (g: Group) => {
    setSelectedGroup(g); setModal("students");
  };
  const closeModal = () => { setModal(null); setSelectedGroup(null); setSelectedLesson(null); setAddSearch(""); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Guruh nomini kiriting");
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await createGroup({ name: form.name, subject_id: subjectId, description: form.description || undefined, max_students: form.max_students, schedule: form.schedule || undefined, teacher_id: form.teacher_id || undefined, price: form.price });
        if (!res.success) throw new Error(res.error);
        toast.success("Guruh yaratildi");
      } else if (modal === "edit" && form.id) {
        const res = await updateGroup(form.id, { name: form.name, description: form.description, max_students: form.max_students, schedule: form.schedule, teacher_id: form.teacher_id || undefined, status: form.status, price: form.price });
        if (!res.success) throw new Error(res.error);
        toast.success("Guruh saqlandi");
      }
      closeModal();
    } catch (e: any) { toast.error("Xatolik: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (g: Group) => {
    if (!confirm(g.name + " guruhini o'chirmoqchimisiz?")) return;
    await deleteGroup(g.id);
  };

  const handleToggleStatus = async (g: Group) => {
    await updateGroup(g.id, { status: g.status === "active" ? "archived" : "active" });
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedGroup) return;
    setAddingStudent(true);
    const res = await addStudentToGroup(selectedGroup.id, studentId);
    if (!res.success) toast.error(res.error || "Xatolik");
    setAddingStudent(false);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedGroup || !confirm("Bu o'quvchini guruhdan chiqarishni xohlaysizmi?")) return;
    await removeStudentFromGroup(selectedGroup.id, studentId);
  };

  // --- Video Lesson Functions ---
  const openCreateVideo = () => { setVideoForm({ ...emptyVideoForm }); setSelectedLesson(null); setModal("create_video"); };
  const openEditVideo = (lesson: Lesson) => {
    const mainVideo = materials[lesson.id]?.find(m => m.type === 'video');
    setVideoForm({ id: lesson.id, title: lesson.title, description: lesson.description || "", url: mainVideo?.url || "" });
    setSelectedLesson(lesson); setModal("edit_video");
  };

  const handleSaveVideo = async () => {
    if (!videoForm.title.trim()) return toast.error("Video nomini kiriting");
    if (!videoForm.url.trim()) return toast.error("Video havolasini (URL) kiriting");
    setSaving(true);
    try {
      if (modal === "create_video") {
        const order = lessons.length + 1;
        const res = await createVideoLesson(subjectId, videoForm.title, videoForm.description, videoForm.url, order);
        if (!res.success) throw new Error(res.error);
        toast.success("Video dars yaratildi");
      } else if (modal === "edit_video" && videoForm.id) {
        const res = await updateVideoLesson(videoForm.id, videoForm.title, videoForm.description, videoForm.url);
        if (!res.success) throw new Error(res.error);
        toast.success("Video dars saqlandi");
      }
      closeModal();
    } catch (e: any) { toast.error("Xatolik: " + e.message); } finally { setSaving(false); }
  };

  const handleDeleteVideo = async (lesson: Lesson) => {
    if (!confirm(lesson.title + " videosini o'chirmoqchimisiz?")) return;
    const res = await deleteVideoLesson(lesson.id);
    if (!res.success) toast.error(res.error || "Xatolik");
    else toast.success("O'chirildi");
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('uz-UZ') + " so'm";
  };

  if (isLoading) {
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
          <Link
            href="/admin/courses"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Orqaga"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              {subject?.title || "Fan Tafsilotlari"}
            </h1>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              Guruhlar va video darslarni boshqarish
            </p>
          </div>
        </div>

        {/* Tab Switcher & Primary Action */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "groups"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Layers size={15} />
              <span>Guruhlar ({groups.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "videos"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Video size={15} />
              <span>Video Darslar ({lessons.length})</span>
            </button>
          </div>

          {activeTab === "groups" ? (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10"
            >
              <Plus size={16} />
              <span>Guruh Yaratish</span>
            </button>
          ) : (
            <button
              onClick={openCreateVideo}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10"
            >
              <Plus size={16} />
              <span>Video Qo'shish</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Tab: Groups */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Layers size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Bu fanda hali guruhlar yaratilmagan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((g) => {
                const isArchived = g.status === "archived";

                return (
                  <div
                    key={g.id}
                    className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${
                      isArchived ? "opacity-60" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">{g.name}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            O'qituvchi: {g.teacher?.full_name || "Biriktirilmagan"}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {g.student_count || 0}/{g.max_students} sig'im
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{g.schedule || "Dars vaqti kiritilmagan"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span>Oylik to'lov: {formatMoney(g.price || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Box-free Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                      <button
                        onClick={() => openStudents(g)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
                      >
                        <Users size={14} />
                        <span>O'quvchilar ({g.student_count || 0})</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(g)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                          title={isArchived ? "Aktivlashtirish" : "Arxivlash"}
                        >
                          {isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Content Tab: Video Lessons */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Video size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Bu fanda hali video darslar yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lessons.map((lesson) => {
                const mainVideo = materials[lesson.id]?.find(m => m.type === 'video');

                return (
                  <div
                    key={lesson.id}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PlayCircle size={18} className="text-emerald-500 shrink-0" />
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{lesson.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400 line-clamp-2 font-medium">
                        {lesson.description || "Izoh yo'q"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                      {mainVideo?.url ? (
                        <a
                          href={mainVideo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-emerald-600 hover:underline truncate"
                        >
                          Videoni Ko'rish
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Havola yo'q</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditVideo(lesson)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(lesson)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Group Create/Edit */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                {modal === "create" ? "Yangi Guruh Yaratish" : "Guruhni Tahrirlash"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Guruh Nomi *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" placeholder="Masalan: M-101" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Oylik To'lov Summasi (so'm)</label>
                <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" placeholder="Masalan: 300000" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Sig'im (Max)</label>
                  <input type="number" min="1" max="100" value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 20 })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Dars Vaqti</label>
                  <input type="text" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" placeholder="Dush, Chor 14:00" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">O'qituvchi</label>
                <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100">
                  <option value="">— Tanlang —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.phone}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400">Bekor qilish</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50">
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Group Students Management */}
      {modal === "students" && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{selectedGroup.name} — O'quvchilari</h3>
                <p className="text-xs text-slate-400 font-medium">A'zolar soni: {groupStudents.length}/{selectedGroup.max_students}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Add Student Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">O'quvchi Qo'shish</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Qidiruv..."
                    value={addSearch}
                    onChange={e => setAddSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                {addSearch && availableStudents.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                    {availableStudents.map(s => (
                      <div key={s.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.full_name || s.phone}</span>
                        <button
                          onClick={() => handleAddStudent(s.id)}
                          disabled={addingStudent}
                          className="px-3 py-1 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                        >
                          Qo'shish
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Students List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Mavjud O'quvchilar</label>
                {studentsLoading ? (
                  <p className="text-xs text-slate-400">Yuklanmoqda...</p>
                ) : groupStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Guruhda hali o'quvchi yo'q</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {groupStudents.map(gs => (
                      <div key={gs.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{gs.student?.full_name || gs.student?.phone}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(gs.student_id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Guruhdan chiqarish"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Video Create/Edit */}
      {(modal === "create_video" || modal === "edit_video") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                {modal === "create_video" ? "Yangi Video Qo'shish" : "Videoni Tahrirlash"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Video Sarlavhasi *</label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" placeholder="Masalan: 1-Dars. Kirish" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Video Havolasi (URL) *</label>
                <input type="text" value={videoForm.url} onChange={e => setVideoForm({ ...videoForm, url: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100" placeholder="YouTube yoki Video URL" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Tavsif</label>
                <textarea value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-medium text-slate-800 dark:text-slate-100 resize-none h-20" placeholder="Qisqacha dars mazmuni..." />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400">Bekor qilish</button>
              <button onClick={handleSaveVideo} disabled={saving} className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50">
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
