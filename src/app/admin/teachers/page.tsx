"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search, GraduationCap, Edit2, Trash2, Phone, Mail, BookOpen, UserCheck
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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: teachers, isLoading: loading } = useTeachers(debouncedSearchTerm);
  const teachersList = teachers || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} ni o'qituvchilar ro'yxatidan chiqarmoqchimisiz? U o'quvchi roliga o'tkaziladi.`)) return;
    try {
      const result = await demoteTeacher(id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        toast.success("O'qituvchi o'quvchi roliga o'tkazildi");
      } else {
        toast.error("Xatolik: " + result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            O'qituvchilar
          </h1>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Platformadagi barcha o'qituvchilar ro'yxati va dars beradigan fanlari ({teachersList.length} ta)
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2 rounded-2xl flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'qituvchi ismi yoki telefon raqami orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Teachers List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : teachersList.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hech qanday o'qituvchi topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachersList.map((teacher) => {
            const initial = (teacher.full_name || "?")[0].toUpperCase();

            return (
              <div
                key={teacher.id}
                className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Box-free initial badge */}
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                          {teacher.full_name || "Ism kiritilmagan"}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium truncate">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{teacher.phone || "Telefon yo'q"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Box-free Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(teacher.id, teacher.full_name || "O'qituvchi")}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="O'qituvchilikdan chiqarish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subjects Tags */}
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center gap-1.5">
                    <BookOpen size={12} className="text-slate-400 shrink-0 mr-1" />
                    {teacher.subjects.map((sub: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 text-[11px] font-medium text-slate-400">
                    Fanlar biriktirilmagan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
