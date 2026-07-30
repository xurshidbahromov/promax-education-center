import os

code = """"use client";

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
  max_students: 20, schedule: "", teacher_id: "", status: "active" as "active" | "archived",
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
    setForm({ id: g.id, name: g.name, description: g.description || "", max_students: g.max_students, schedule: g.schedule || "", teacher_id: g.teacher_id || "", status: g.status });
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
        const res = await createGroup({ name: form.name, subject_id: subjectId, description: form.description || undefined, max_students: form.max_students, schedule: form.schedule || undefined, teacher_id: form.teacher_id || undefined });
        if (!res.success) throw new Error(res.error);
        toast.success("Guruh yaratildi");
      } else if (modal === "edit" && form.id) {
        const res = await updateGroup(form.id, { name: form.name, description: form.description, max_students: form.max_students, schedule: form.schedule, teacher_id: form.teacher_id || undefined, status: form.status });
        if (!res.success) throw new Error(res.error);
        toast.success("Guruh saqlandi");
      }
      closeModal();
    } catch (e: any) { toast.error("Xatolik: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (g: Group) => {
    if (!confirm(g.name + " guruhini ochirmoqchimisiz?")) return;
    await deleteGroup(g.id);
  };

  const handleToggleStatus = async (g: Group) => {
    await updateGroup(g.id, { status: g.status === "active" ? "archived" : "active" });
  };

  const searchAvailable = (q: string) => {
    setAddSearch(q);
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedGroup) return;
    setAddingStudent(true);
    const res = await addStudentToGroup(selectedGroup.id, studentId);
    if (!res.success) toast.error(res.error || "Xatolik");
    setAddingStudent(false);
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedGroup || !confirm("Bu oquvchini guruhdan chiqarishni xohlaysizmi?")) return;
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

  if (isLoading) return (
    <div className="flex items-center justify-center py-32 text-slate-500">
      <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
      Yuklanmoqda...
    </div>
  );

  const activeGroups = groups.filter(g => g.status === "active");
  const archivedGroups = groups.filter(g => g.status === "archived");
  const totalStudents = groups.reduce((s, g) => s + (g.student_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-sm mb-1">
            <Link href="/admin/courses" className="text-slate-400 hover:text-brand-blue transition-colors">Fanlar</Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">{subject?.title}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Boshqaruv Paneli
          </h1>
        </div>
        {activeTab === "groups" ? (
          <button onClick={openCreate} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-blue/20 active:scale-95">
            <Plus size={18} />Yangi guruh
          </button>
        ) : (
          <button onClick={openCreateVideo} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 active:scale-95">
            <Video size={18} />Yangi video dars
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "groups" ? "border-brand-blue text-brand-blue" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}
        >
          <Layers size={18} />
          Guruhlar ({groups.length})
        </button>
        <button 
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "videos" ? "border-emerald-500 text-emerald-500 dark:text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"}`}
        >
          <PlayCircle size={18} />
          Video Darslar ({lessons.length})
        </button>
      </div>

      {/* CONTENT: GROUPS */}
      {activeTab === "groups" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Jami guruhlar", value: groups.length, color: "text-slate-800 dark:text-slate-100" },
              { label: "Faol guruhlar", value: activeGroups.length, color: "text-emerald-600" },
              { label: "Jami oquvchilar", value: totalStudents, color: "text-brand-blue" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGroups.map(g => (
              <GroupCard key={g.id} group={g} onEdit={openEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onStudents={openStudents} />
            ))}
          </div>

          {archivedGroups.length > 0 && (
            <div className="pt-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Archive size={20} className="text-slate-400" />
                Arxivlangan guruhlar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition-opacity">
                {archivedGroups.map(g => (
                  <GroupCard key={g.id} group={g} onEdit={openEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onStudents={openStudents} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* CONTENT: VIDEO LESSONS */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              Bu fanga tegishli video darslar halicha yo'q.
            </div>
          ) : (
            lessons.map(lesson => {
              const mainVideo = materials[lesson.id]?.find(m => m.type === 'video');
              return (
                <div key={lesson.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                    <PlayCircle size={48} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{lesson.title}</h3>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => openEditVideo(lesson)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors active:scale-90" title="Tahrirlash">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteVideo(lesson)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90" title="O'chirish">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {lesson.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{lesson.description}</p>
                    )}
                    {mainVideo && (
                      <a href={mainVideo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Video size={14} /> Videoni korish
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Group Create/Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{modal === "create" ? "Yangi guruh" : "Guruhni tahrirlash"}</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Guruh nomi <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="Masalan: M-101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Izoh</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100 resize-none h-20" placeholder="Qoshimcha malumotlar..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Oquvchilar sigimi</label>
                  <input type="number" min="1" max="100" value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 20 })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dars vaqti</label>
                  <input type="text" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="Dush, Chor 14:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Oqituvchi (ixtiyoriy)</label>
                <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100">
                  <option value="">— Tanlang —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.phone}</option>)}
                </select>
              </div>
              {modal === "edit" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100">
                    <option value="active">Faol</option>
                    <option value="archived">Arxivlangan</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800">
              <button onClick={closeModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95">Bekor</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-brand-blue/20 disabled:opacity-60 active:scale-95">{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Create/Edit Modal */}
      {(modal === "create_video" || modal === "edit_video") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Video size={20} className="text-emerald-500" />
                {modal === "create_video" ? "Yangi video dars" : "Video darsni tahrirlash"}
              </h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dars nomi <span className="text-red-500">*</span></label>
                <input type="text" value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="Masalan: 1-dars. Kirish" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Video havola (URL) <span className="text-red-500">*</span></label>
                <input type="url" value={videoForm.url} onChange={e => setVideoForm({ ...videoForm, url: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="https://youtube.com/..." />
                <p className="text-[11px] text-slate-500 mt-1.5">YouTube, Vimeo yoki boshqa serverdagi to'g'ridan-to'g'ri video linki.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Izoh</label>
                <textarea value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100 resize-none h-20" placeholder="Dars haqida qisqacha..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800">
              <button onClick={closeModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95">Bekor</button>
              <button onClick={handleSaveVideo} disabled={saving} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-60 active:scale-95">{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {modal === "students" && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{selectedGroup.name} — Oquvchilar</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Users size={16} className="text-brand-blue" />
                  Guruh oquvchilari ({groupStudents.length} / {selectedGroup.max_students})
                </h4>
                {studentsLoading ? (
                  <div className="text-center py-8 text-slate-400 animate-pulse">Yuklanmoqda...</div>
                ) : groupStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">Hali oquvchi yoq</div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {groupStudents.map(gs => (
                      <div key={gs.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-sm flex-shrink-0">{gs.student?.full_name?.[0]?.toUpperCase() || "?"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{gs.student?.full_name || "Ism yoq"}</p>
                          <p className="text-xs text-slate-500 truncate">{gs.student?.phone}</p>
                        </div>
                        <button onClick={() => handleRemoveStudent(gs.student_id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-95"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <UserPlus size={16} className="text-emerald-600" />
                  Oquvchi qoshish
                </h4>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={addSearch} onChange={e => searchAvailable(e.target.value)} placeholder="Ism yoki telefon..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all" />
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {availableStudents.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">{addSearch ? "Topilmadi" : "Qoshish uchun oquvchilar yoq"}</p>
                  ) : availableStudents.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-semibold text-sm flex-shrink-0">{s.full_name?.[0]?.toUpperCase() || "?"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{s.full_name || "Ism yoq"}</p>
                        <p className="text-xs text-slate-500 truncate">{s.phone}</p>
                      </div>
                      <button onClick={() => handleAddStudent(s.id)} disabled={addingStudent} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors active:scale-95 disabled:opacity-50">
                        <Plus size={14} />Qosh
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-slate-800">
              <button onClick={closeModal} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95">Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, onEdit, onDelete, onToggleStatus, onStudents }: {
  group: Group; onEdit: (g: Group) => void; onDelete: (g: Group) => void;
  onToggleStatus: (g: Group) => void; onStudents: (g: Group) => void;
}) {
  const pct = group.max_students > 0 ? Math.round(((group.student_count || 0) / group.max_students) * 100) : 0;
  const isArchived = group.status === "archived";
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className={"group relative bg-white dark:bg-slate-900 rounded-2xl border " + (isArchived ? "border-dashed border-slate-200 dark:border-slate-700/60" : "border-gray-100 dark:border-slate-800") + " p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{group.name}</h3>
            {isArchived && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide">Arxiv</span>
            )}
          </div>
          {group.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(group)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-90" title="Tahrirlash"><Edit2 size={15} /></button>
          <button onClick={() => onToggleStatus(group)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors active:scale-90" title={isArchived ? "Aktivlashtirish" : "Arxivlash"}>{isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</button>
          <button onClick={() => onDelete(group)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90" title="O'chirish"><Trash2 size={15} /></button>
        </div>
      </div>

      {(group.schedule || group.teacher?.full_name) && (
        <div className="flex flex-col gap-1">
          {group.schedule && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={12} className="text-slate-400 flex-shrink-0" />
              <span>{group.schedule}</span>
            </div>
          )}
          {group.teacher?.full_name && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User size={12} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{group.teacher.full_name}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">O'quvchilar</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
            {group.student_count || 0}<span className="text-slate-300 dark:text-slate-600 font-normal"> / {group.max_students}</span>
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={"h-full rounded-full transition-all duration-700 " + barColor}
            style={{ width: Math.min(pct, 100) + "%" }}
          />
        </div>
      </div>

      <button
        onClick={() => onStudents(group)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-brand-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/35 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
      >
        <Users size={15} />O'quvchilarni boshqarish
      </button>
    </div>
  );
}
"""

with open("src/app/admin/courses/[subjectId]/page.tsx", "w") as f:
    f.write(code)
print("Subject details page refactored!")
