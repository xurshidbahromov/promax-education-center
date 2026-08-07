"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { type Subject } from "@/lib/supabase-queries";
import { useSubjects } from "@/hooks/useAdminData";
import { Plus, Edit2, Trash2, Library, ChevronRight, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AdminCoursesPage() {
  const { data: subjects = [], isLoading: loading } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ id: "", title: "", description: "", cover_image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const supabase = createClient();

  // Clean up preview url when component unmounts or changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const openModal = (subject?: Subject) => {
    if (subject) {
      setFormData({ id: subject.id, title: subject.title, description: subject.description || "", cover_image: subject.cover_image || "" });
      setImagePreview(subject.cover_image || "");
      setImageFile(null);
      setIsEditing(true);
    } else {
      setFormData({ id: "", title: "", description: "", cover_image: "" });
      setImagePreview("");
      setImageFile(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", title: "", description: "", cover_image: "" });
    setImageFile(null);
    setImagePreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({...formData, cover_image: ""});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverImageUrl = formData.cover_image;

      // Handle image upload if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `subject-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        coverImageUrl = publicUrl;
      }

      if (isEditing) {
        const { error } = await supabase
          .from("subjects")
          .update({
            title: formData.title,
            name: formData.title,
            description: formData.description,
            cover_image: coverImageUrl || null
          })
          .eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subjects")
          .insert({
            title: formData.title,
            name: formData.title,
            description: formData.description,
            cover_image: coverImageUrl || null
          });
        if (error) throw error;
      }
      closeModal();
      toast.success("Fan saqlandi!");
    } catch (error: any) {
      console.error("Error saving subject:", error);
      toast.error(`Xatolik yuz berdi: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`${title} fanini haqiqatan ham o'chirmoqchimisiz? Undagi barcha darslar ham o'chib ketishi mumkin!`)) return;
    
    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Fan o'chirildi");
    } catch (error: any) {
      console.error("Error deleting subject:", error.message || error);
      toast.error(`O'chirishda xatolik yuz berdi: ${error.message || "Noma'lum xato"}`);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Fanlar va Guruhlar
          </h1>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Platformadagi o'qitiladigan fanlar hamda dars guruhlarini boshqarish ({subjects.length} ta fan)
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi Fan Qo'shish</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-52 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Library size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hech qanday fan topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Cover Image or Neutral Placeholder */}
              <div className="h-36 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {subject.cover_image ? (
                  <Image src={subject.cover_image} alt={subject.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                    Rasm kiritilmagan
                  </div>
                )}
              </div>

              {/* Subject Content */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{subject.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                    {subject.description || "Qo'shimcha izoh kiritilmagan"}
                  </p>
                </div>

                {/* Box-free Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(subject)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id, subject.title)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <Link
                    href={`/admin/courses/${subject.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-brand-blue hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <span>Guruhlar va Darslar</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimalist Box-free Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                {isEditing ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Fan Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none transition-all text-xs font-bold text-slate-800 dark:text-slate-100"
                  placeholder="Masalan: Matematika"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Izoh / Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none transition-all text-xs font-medium text-slate-800 dark:text-slate-100 resize-none h-24"
                  placeholder="Fan haqida qisqacha..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Fan Muqovasi (Cover Image)
                </label>
                
                {imagePreview ? (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <Upload size={20} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-500">Rasm yuklash uchun bosing</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
