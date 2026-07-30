"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search, GraduationCap, Edit2, Trash2, Phone, Mail
} from "lucide-react";
import { demoteTeacher } from "@/lib/admin-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useTeachers } from "@/hooks/useAdminData";

export default function AdminTeachersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: teachers, isLoading: loading } = useTeachers(debouncedSearchTerm);
  const teachersList = teachers || [];

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham bu o'qituvchini o'chirmoqchimisiz? U o'quvchi roliga qaytariladi.")) return;
    try {
      const result = await demoteTeacher(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        toast.success("O'qituvchi muvaffaqiyatli o'chirildi");
      } else {
        toast.error("Xatolik: "+ result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap size={22} className="text-brand-blue" />
            O'qituvchilar
          </h1>
          <p className="text-sm text-slate-500 mt-1">Platformadagi barcha o'qituvchilarni boshqarish</p>
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
          {teachersList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              O'qituvchilar topilmadi
            </div>
          ) : (
            teachersList.map((teacher) => (
              <div key={teacher.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-semibold shrink-0">
                      {(teacher.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{teacher.full_name || "Ism yo'q"}</h3>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Phone size={12} className="text-slate-400" /> {teacher.phone || "Telefon yo'q"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors active:scale-90" title="Tahrirlash">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors active:scale-90" title="O'chirish">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.subjects.map((sub: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-medium uppercase tracking-wide">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
