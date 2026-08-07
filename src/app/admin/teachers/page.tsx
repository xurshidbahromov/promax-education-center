"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, GraduationCap, Phone, ShieldAlert } from "lucide-react";
import { demoteToStudent } from "@/lib/admin-queries";
import { useQueryClient } from "@tanstack/react-query";
import { useTeachers } from "@/hooks/useAdminData";

export default function AdminTeachersPage() {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: teachers, isLoading: loading } = useTeachers(debouncedSearchTerm);
  const teachersList = teachers || [];

  const handleDemote = async (id: string, name: string) => {
    if (!confirm(`${name} ni o'qituvchilar safiga chiqarib, oddiy o'quvchiga aylantirmoqchimisiz?`)) return;
    try {
      const result = await demoteToStudent(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'qituvchi maqomi olib tashlandi va o'quvchiga o'tkazildi");
      } else {
        toast.error("Xatolik: " + result.error);
      }
    } catch (error) {
      console.error("Demote error:", error);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            O'qituvchilar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Platformadagi barcha o'qituvchilar va ularning biriktirilgan fanlari ({teachersList.length} ta)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'qituvchi ismi yoki fani bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : teachersList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hech qanday o'qituvchi topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teachersList.map((teacher) => {
            const initial = (teacher.full_name || "?")[0].toUpperCase();

            return (
              <div
                key={teacher.id}
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm shrink-0">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base truncate">
                        {teacher.full_name || "Ismsiz O'qituvchi"}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{teacher.phone || "Telefon kiritilmagan"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Subject Badges */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Biriktirilgan Fanlar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Fanlar kiritilmagan</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Box-free Demote Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Maqomi: O'qituvchi</span>
                  <button
                    onClick={() => handleDemote(teacher.id, teacher.full_name || "O'qituvchi")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    title="O'quvchi qilish"
                  >
                    <ShieldAlert size={15} />
                    <span>O'quvchi qilish</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
