"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Users, Clock, Trash2, Edit2,
  User, Archive, ArchiveRestore,
  Search, X, UserPlus
} from "lucide-react";
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  getGroupStudents, addStudentToGroup, removeStudentFromGroup, getStudentsNotInGroup,
  getTeachers,
  type Group, type GroupStudent
} from "@/lib/admin-queries";
import { getSubjectById } from "@/lib/supabase-queries";

interface PageProps { params: Promise<{ subjectId: string }> }
type ModalMode = "create" | "edit" | "students" | null;

const emptyForm = {
  id: "", name: "", description: "",
  max_students: 20, schedule: "", teacher_id: "", status: "active" as "active" | "archived",
};

export default function SubjectGroupsPage({ params }: PageProps) {
  const { subjectId } = use(params);
  const [subject, setSubject] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [groupStudents, setGroupStudents] = useState<GroupStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [addingStudent, setAddingStudent] = useState(false);

  const load = async () => {
    try {
      const [subj, grps, tchrs] = await Promise.all([
        getSubjectById(subjectId), getGroups(subjectId), getTeachers(),
      ]);
      setSubject(subj); setGroups(grps); setTeachers(tchrs);
    } catch (e: any) { 
      console.error("Load error details:", e?.message || e, JSON.stringify(e)); 
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [subjectId]);

  const openCreate = () => { setForm({ ...emptyForm }); setSelectedGroup(null); setModal("create"); };
  const openEdit = (g: Group) => {
    setForm({ id: g.id, name: g.name, description: g.description || "", max_students: g.max_students, schedule: g.schedule || "", teacher_id: g.teacher_id || "", status: g.status });
    setSelectedGroup(g); setModal("edit");
  };
  const openStudents = async (g: Group) => {
    setSelectedGroup(g); setModal("students"); setStudentsLoading(true);
    try {
      const [members, available] = await Promise.all([getGroupStudents(g.id), getStudentsNotInGroup(g.id, "")]);
      setGroupStudents(members); setAvailableStudents(available);
    } catch (e) { console.error(e); } finally { setStudentsLoading(false); }
  };
  const closeModal = () => { setModal(null); setSelectedGroup(null); setAddSearch(""); setAvailableStudents([]); setGroupStudents([]); };

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Guruh nomini kiriting");
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await createGroup({ name: form.name, subject_id: subjectId, description: form.description || undefined, max_students: form.max_students, schedule: form.schedule || undefined, teacher_id: form.teacher_id || undefined });
        if (!res.success) throw new Error(res.error);
      } else if (modal === "edit" && form.id) {
        const res = await updateGroup(form.id, { name: form.name, description: form.description, max_students: form.max_students, schedule: form.schedule, teacher_id: form.teacher_id || undefined, status: form.status });
        if (!res.success) throw new Error(res.error);
      }
      await load(); closeModal();
    } catch (e: any) { alert("Xatolik: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (g: Group) => {
    if (!confirm(g.name + " guruhini ochirmoqchimisiz?")) return;
    await deleteGroup(g.id); await load();
  };

  const handleToggleStatus = async (g: Group) => {
    await updateGroup(g.id, { status: g.status === "active" ? "archived" : "active" }); await load();
  };

  const searchAvailable = async (q: string) => {
    setAddSearch(q);
    if (!selectedGroup) return;
    const list = await getStudentsNotInGroup(selectedGroup.id, q);
    setAvailableStudents(list);
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedGroup) return;
    setAddingStudent(true);
    const res = await addStudentToGroup(selectedGroup.id, studentId);
    if (!res.success) { alert(res.error); setAddingStudent(false); return; }
    const [members, available] = await Promise.all([getGroupStudents(selectedGroup.id), getStudentsNotInGroup(selectedGroup.id, addSearch)]);
    setGroupStudents(members); setAvailableStudents(available); setAddingStudent(false); await load();
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedGroup || !confirm("Bu oquvchini guruhdan chiqarishni xohlaysizmi?")) return;
    await removeStudentFromGroup(selectedGroup.id, studentId);
    setGroupStudents(await getGroupStudents(selectedGroup.id)); await load();
  };

  if (loading) return (
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Guruhlar</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-blue/20 active:scale-95">
          <Plus size={18} />Yangi guruh
        </button>
      </div>


      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Jami guruhlar", value: groups.length, color: "text-slate-800 dark:text-slate-100" },
          { label: "Faol guruhlar", value: activeGroups.length, color: "text-emerald-600" },
          { label: "Jami oquvchilar", value: totalStudents, color: "text-brand-blue" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 px-5 py-4">
            <p className={"text-2xl font-bold " + s.color}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {activeGroups.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Faol Guruhlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGroups.map(g => <GroupCard key={g.id} group={g} onEdit={openEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onStudents={openStudents} />)}
          </div>
        </div>
      )}

      {archivedGroups.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Arxivlangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {archivedGroups.map(g => <GroupCard key={g.id} group={g} onEdit={openEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onStudents={openStudents} />)}
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-16 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Guruhlar yoq</h3>
          <p className="text-slate-500 text-sm mb-6">Bu fan uchun hali guruh yaratilmagan</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-xl font-medium active:scale-95 transition-transform shadow-lg shadow-brand-blue/20">
            <Plus size={18} />Birinchi guruhni yaratish
          </button>
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{modal === "create" ? "Yangi guruh" : "Guruhni tahrirlash"}</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Guruh nomi *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="Masalan: Ingliz tili - 1-guruh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tavsif</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all resize-none text-slate-800 dark:text-slate-100" placeholder="Qisqacha tavsif..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max oquvchi</label>
                  <input type="number" min={1} max={100} value={form.max_students} onChange={e => setForm({ ...form, max_students: parseInt(e.target.value) || 20 })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dars jadvali</label>
                  <input type="text" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100" placeholder="Dush, Chor 14:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Oqituvchi (ixtiyoriy)</label>
                <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100">
                  <option value="">— Tanlang —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
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
                          <p className="text-xs text-slate-500 truncate">{gs.student?.phone || gs.student?.email}</p>
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
                        <p className="text-xs text-slate-500 truncate">{s.phone || s.email}</p>
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
      {/* Top row: name + actions */}
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
        {/* Action buttons — always visible, compact */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(group)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-90" title="Tahrirlash"><Edit2 size={15} /></button>
          <button onClick={() => onToggleStatus(group)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors active:scale-90" title={isArchived ? "Aktivlashtirish" : "Arxivlash"}>{isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}</button>
          <button onClick={() => onDelete(group)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90" title="O'chirish"><Trash2 size={15} /></button>
        </div>
      </div>

      {/* Meta info */}
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

      {/* Students progress */}
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

      {/* CTA button */}
      <button
        onClick={() => onStudents(group)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-brand-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/35 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
      >
        <Users size={15} />O'quvchilarni boshqarish
      </button>
    </div>
  );
}
