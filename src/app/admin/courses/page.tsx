"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BookOpen, Plus, Edit2, Trash2, Layers, Video, Search, ChevronRight, X
} from "lucide-react";
import { createSubject, updateSubject, deleteSubject } from "@/lib/admin-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useSubjects } from "@/hooks/useAdminData";

interface SubjectItem {
  id: string;
  title: string;
  description: string | null;
  groups_count?: number;
  lessons_count?: number;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: dbSubjects, isLoading: loading } = useSubjects();
  const subjectsList: SubjectItem[] = (dbSubjects || []).map(s => ({
    id: s.id,
    title: s.title,
    description: s.description || null,
  }));

  const filteredSubjects = subjectsList.filter(s =>
    s.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingSubject(null);
    setTitle("");
    setDescription("");
    setModalOpen(true);
  };

  const openEditModal = (subject: SubjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setTitle(subject.title);
    setDescription(subject.description || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Fan nomini kiriting!");
      return;
    }

    setSaving(true);
    try {
      if (editingSubject) {
        const res = await updateSubject(editingSubject.id, title, description);
        if (res.success) {
          toast.success("Fan yangilandi!");
          queryClient.invalidateQueries({ queryKey: ['subjects'] });
          setModalOpen(false);
        } else {
          toast.error("Xatolik: " + res.error);
        }
      } else {
        const res = await createSubject(title, description);
        if (res.success) {
          toast.success("Yangi fan qo'shildi!");
          queryClient.invalidateQueries({ queryKey: ['subjects'] });
          setModalOpen(false);
        } else {
          toast.error("Xatolik: " + res.error);
        }
      }
    } catch (e) {
      console.error("Save subject error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, titleName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`${titleName} fanini o'chirib tashlamoqchimisiz?`)) return;

    try {
      const res = await deleteSubject(id);
      if (res.success) {
        toast.success("Fan o'chirildi");
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (e) {
      console.error("Delete subject error:", e);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Fanlar va Darslar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Markazdagi ta'lim fanlari, guruhlar va video kontentlar boshqaruvi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi Fan Qo'shish</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Fan nomi yoki tavsifi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Fanlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => router.push(`/admin/courses/${sub.id}`)}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BookOpen size={22} className="text-brand-blue shrink-0" />
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-tight group-hover:text-brand-blue transition-colors">
                      {sub.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-2">
                  {sub.description || "Tavsif kiritilmagan"}
                </p>
              </div>

              {/* Box-free Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-brand-blue transition-colors">
                  <span>Guruhlar & Darslar</span>
                  <ChevronRight size={16} />
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => openEditModal(sub, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(sub.id, sub.title, e)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                {editingSubject ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Fan Nomi *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Matematika"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Fan Tavsifi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fan haqida qisqacha ma'lumot..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50"
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
