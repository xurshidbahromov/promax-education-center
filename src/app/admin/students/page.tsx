"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search, Users, Edit2, Trash2, Phone, X, GraduationCap
} from "lucide-react";
import { deleteStudent, promoteToTeacher } from "@/lib/admin-queries";
import { getSubjects, Subject } from "@/lib/supabase-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useStudents } from "@/hooks/useAdminData";

export default function AdminStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Promote Modal states
  const [promoteModal, setPromoteModal] = useState<{ open: boolean; studentId: string; studentName: string } | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch subjects once for the modal
  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const { data: students, isLoading: loading } = useStudents(debouncedSearchTerm);
  const studentsList = students || [];

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu o'quvchini o'chirmoqchimisiz?")) return;
    try {
      const result = await deleteStudent(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'quvchi muvaffaqiyatli o'chirildi");
      } else {
        toast.error("Xatolik: "+ result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openPromoteModal = (id: string, name: string) => {
    setSelectedSubjects([]);
    setPromoteModal({ open: true, studentId: id, studentName: name || "Ism yo'q" });
  };

  const closePromoteModal = () => {
    setPromoteModal(null);
    setSelectedSubjects([]);
  };

  const toggleSubject = (subjectTitle: string) => {
    if (selectedSubjects.includes(subjectTitle)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subjectTitle));
    } else {
      setSelectedSubjects(prev => [...prev, subjectTitle]);
    }
  };

  const handlePromoteConfirm = async () => {
    if (!promoteModal) return;
    if (selectedSubjects.length === 0) {
      toast.error("Kamida bitta fanni tanlang!");
      return;
    }

    setIsPromoting(true);
    try {
      const result = await promoteToTeacher(promoteModal.studentId, selectedSubjects);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        toast.success(`${promoteModal.studentName} o'qituvchi etib belgilandi!`);
        closePromoteModal();
      } else {
        toast.error("Xatolik: "+ result.error);
      }
    } catch (error) {
      console.error("Promote error:", error);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users size={22} className="text-brand-blue" />
            O'quvchilar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Platformadagi barcha o'quvchilarni boshqarish</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism yoki telefon orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/30 transition-all outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
          Yuklanmoqda...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentsList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              O'quvchilar topilmadi
            </div>
          ) : (
            studentsList.map((student) => (
              <div key={student.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold shrink-0">
                      {(student.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{student.full_name || "Ism yo'q"}</h3>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Phone size={12} className="text-slate-400" /> {student.phone || "Telefon yo'q"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => openPromoteModal(student.id, student.full_name || "Ism yo'q")} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors active:scale-90" title="O'qituvchi qilish">
                      <GraduationCap size={15} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-90" title="Tahrirlash">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90" title="O'chirish">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {promoteModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap size={20} className="text-emerald-500" />
                O'qituvchi tayinlash
              </h3>
              <button onClick={closePromoteModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{promoteModal.studentName}</span> ni o'qituvchi qilib belgilash uchun, u qaysi fanlardan dars berishini tanlang:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {subjects.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Fanlar topilmadi.</p>
                ) : (
                  subjects.map(subject => (
                    <label key={subject.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedSubjects.includes(subject.title)}
                        onChange={() => toggleSubject(subject.title)}
                        className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{subject.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <button onClick={closePromoteModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Bekor
              </button>
              <button onClick={handlePromoteConfirm} disabled={isPromoting || selectedSubjects.length === 0} className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {isPromoting ? "Saqlanmoqda..." : "Saqlash va Tayinlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
