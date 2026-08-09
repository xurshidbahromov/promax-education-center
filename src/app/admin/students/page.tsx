"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search, Users, Edit2, Trash2, Phone, X, GraduationCap,
  ChevronRight, UserPlus, UserCheck, ShieldCheck, Smartphone, PhoneCall
} from "lucide-react";
import { deleteStudent, promoteToTeacher, updateStudent } from "@/lib/admin-queries";
import { getSubjects, Subject } from "@/lib/supabase-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useStudents } from "@/hooks/useAdminData";
import { formatUzPhone, cleanUzPhone } from "@/lib/phone-formatter";

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

  const openEditModal = (student: any) => {
    setEditModal({
      open: true,
      studentId: student.id,
      fullName: student.full_name || "",
      phone: student.phone ? formatUzPhone(student.phone) : "+998 ",
      parentName: student.parent_name || "",
      parentPhone: student.parent_phone ? formatUzPhone(student.parent_phone) : "+998 ",
    });
  };

  const handleSaveStudentConfirm = async () => {
    if (!editModal) return;
    if (!editModal.fullName.trim()) {
      toast.error("Ismni kiriting!");
      return;
    }

    setIsSavingStudent(true);
    try {
      const res = await updateStudent(editModal.studentId, {
        full_name: editModal.fullName,
        phone: cleanUzPhone(editModal.phone) || "",
        parent_name: editModal.parentName || null,
        parent_phone: cleanUzPhone(editModal.parentPhone) || null,
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'quvchi ma'lumotlari saqlandi!");
        setEditModal(null);
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch (err) {
      console.error("Save student error:", err);
    } finally {
      setIsSavingStudent(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch subjects once for the modal
  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const { data: students, isLoading: loading } = useStudents(debouncedSearchTerm);
  const studentsList = students || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} ismli o'quvchini haqiqatan ham o'chirmoqchimisiz?`)) return;
    try {
      const result = await deleteStudent(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'quvchi muvaffaqiyatli o'chirildi");
      } else {
        toast.error("Xatolik: " + result.error);
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
    setSelectedSubjects(prev =>
      prev.includes(subjectTitle)
        ? prev.filter(s => s !== subjectTitle)
        : [...prev, subjectTitle]
    );
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
        toast.error("Xatolik: " + result.error);
      }
    } catch (error) {
      console.error("Promote error:", error);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            O'quvchilar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Platformadagi barcha o'quvchilar ro'yxati va boshqaruvi ({studentsList.length} ta)
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki telefon raqami orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Students List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : studentsList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hech qanday o'quvchi topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentsList.map((student) => {
            const initial = (student.full_name || "?")[0].toUpperCase();

            return (
              <div
                key={student.id}
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0 text-sm">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <h3
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                        className="font-bold text-slate-800 dark:text-slate-100 text-base truncate hover:text-brand-blue cursor-pointer transition-colors"
                      >
                        {student.full_name || "Ism kiritilmagan"}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{student.phone ? formatUzPhone(student.phone) : "Telefon kiritilmagan"}</span>
                      </p>
                      <div className="mt-2.5">
                        {student.parent_phone ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-[11px] font-bold overflow-hidden">
                            <UserCheck size={13} className="text-brand-blue shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Ota-onasi:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate">
                              {student.parent_name || 'Ota-ona'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">{formatUzPhone(student.parent_phone)}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[11px] font-medium">
                            <PhoneCall size={12} className="shrink-0" />
                            <span>Ota-ona biriktirilmagan</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box-free Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <button
                    onClick={() => openPromoteModal(student.id, student.full_name || "Ism yo'q")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    title="O'qituvchi qilish"
                  >
                    <GraduationCap size={16} />
                    <span>O'qituvchi qilish</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-1.5 text-slate-400 hover:text-brand-blue transition-colors"
                      title="Ota-ona ma'lumotlarini tahrirlash"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/students/${student.id}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Profilini ko'rish"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id, student.full_name || "O'quvchi")}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promote Modal */}
      {promoteModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <GraduationCap size={20} className="text-emerald-500" />
                <h3 className="font-bold text-base">O'qituvchi tayinlash</h3>
              </div>
              <button
                onClick={closePromoteModal}
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
                  subjects.map(subject => {
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
                onClick={closePromoteModal}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePromoteConfirm}
                disabled={isPromoting || selectedSubjects.length === 0}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {isPromoting ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student & Parent CRM Modal */}
      {editModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Edit2 size={18} className="text-brand-blue" />
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
                <div className="flex items-center gap-2 text-brand-blue">
                  <UserCheck size={16} className="text-brand-blue shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">Ota-ona Ma'lumotlari (CRM Telegram Bot)</h4>
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
                    Ota-ona Telefon Raqami (Telegram Bot Ulanishi Uchun) *
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
                    <span>Ota-ona botimizga kirib kontaktingizni yuborganda, shu raqam orqali avtomatik bog'lanadi.</span>
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-brand-blue/10"
              >
                {isSavingStudent ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
