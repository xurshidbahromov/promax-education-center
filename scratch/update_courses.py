import os

code = """"use client";

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

       const { error: uploadError, data } = await supabase.storage
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

 const handleDelete = async (id: string) => {
   if (!confirm("Haqiqatan ham bu fanni o'chirmoqchimisiz? Undagi barcha darslar va materiallar ham o'chib ketadi!")) return;
   
   try {
     const { error } = await supabase.from("subjects").delete().eq("id", id);
     if (error) throw error;
     toast.success("Fan o'chirildi");
   } catch (error: any) {
     console.error("Error deleting subject:", error.message || error);
     toast.error(`O'chirishda xatolik yuz berdi: ${error.message || "Noma'lum xato"}`);
   }
 };

 if (loading) {
   return (
     <div className="flex items-center justify-center py-32 text-slate-500">
       <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
       Yuklanmoqda...
     </div>
   );
 }

 return (
   <div className="space-y-6">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
       <div>
         <h1 className="text-2xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <Library className="text-brand-blue" />
           Fanlar (Subjects)
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-1">Platformadagi barcha fanlarni boshqarish</p>
       </div>
       <button
         onClick={() => openModal()}
         className="flex items-center gap-2 bg-brand-blue active:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-brand-blue/20"
       >
         <Plus size={20} />
         Yangi fan qo'shish
       </button>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {subjects.length === 0 ? (
         <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-gray-200 dark:border-slate-800">
           <p className="text-gray-500 dark:text-gray-400">Hech qanday fan topilmadi.</p>
         </div>
       ) : (
         subjects.map((subject) => (
           <div key={subject.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-shadow flex flex-col">
             <div className="h-32 bg-gray-100 dark:bg-slate-800 relative">
               {subject.cover_image ? (
                 <Image src={subject.cover_image} alt={subject.title} fill className="object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                   Rasm yo'q
                 </div>
               )}
             </div>
             <div className="p-5 flex-1 flex flex-col">
               <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">{subject.title}</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 flex-1">
                 {subject.description || "Tavsif yo'q"}
               </p>
               
               <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex gap-2">
                   <button onClick={() => openModal(subject)} className="p-2 text-blue-500 active:bg-blue-50 dark:active:bg-blue-900/20 rounded-lg transition-colors" title="Tahrirlash">
                     <Edit2 size={18} />
                   </button>
                   <button onClick={() => handleDelete(subject.id)} className="p-2 text-red-500 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-colors" title="O'chirish">
                     <Trash2 size={18} />
                   </button>
                 </div>
                 <Link href={`/admin/courses/${subject.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-blue active:text-blue-600 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors">
                   Guruhlar
                   <ChevronRight size={16} />
                 </Link>
               </div>
             </div>
           </div>
         ))
       )}
     </div>

     {/* Modal */}
     {isModalOpen && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
         <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
           <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
             <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">
               {isEditing ? "Fanni tahrirlash" : "Yangi fan qo'shish"}
             </h3>
             <button onClick={closeModal} className="text-gray-400 active:text-gray-600 dark:active:text-gray-200">
               ✕
             </button>
           </div>
           <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fan nomi</label>
               <input
                 type="text"
                 required
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
                 className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all outline-none text-slate-800 dark:text-slate-100"
                 placeholder="Masalan: Matematika"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
               <textarea
                 rows={3}
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
                 className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all outline-none text-slate-800 dark:text-slate-100"
                 placeholder="Fanning qisqacha tavsifi"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Muqova rasmi</label>
               {imagePreview ? (
                 <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 group shadow-inner">
                   <img
                     src={imagePreview}
                     alt="Muqova rasmi preview"
                     className="w-full h-full object-cover transition-transform duration-300 group-active:scale-95"
                   />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
                     <label className="cursor-pointer bg-white text-slate-800 active:bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-colors flex items-center gap-1.5">
                       <Upload size={16} />
                       O'zgartirish
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                       />
                     </label>
                     <button
                       type="button"
                       onClick={handleRemoveImage}
                       className="bg-red-600 active:bg-red-700 text-white p-2 rounded-xl shadow-md transition-colors"
                       title="Rasmni o'chirish"
                     >
                       <X size={18} />
                     </button>
                   </div>
                 </div>
               ) : (
                 <label className="flex flex-col items-center justify-center h-44 w-full border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-2xl cursor-pointer active:bg-gray-50 dark:active:bg-slate-800/40 active:border-brand-blue/50 dark:active:border-brand-blue/50 transition-all group">
                   <div className="flex flex-col items-center justify-center px-4 text-center">
                     <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl group-active:bg-brand-blue group-active:text-white transition-all text-brand-blue mb-3">
                       <Upload className="h-6 w-6 transition-transform group-active:scale-95" />
                     </div>
                     <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                       Rasmni yuklash
                     </p>
                     <p className="text-xs text-gray-400">
                       PNG, JPG, WEBP formatlar (maksimal 5MB)
                     </p>
                   </div>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     className="hidden"
                   />
                 </label>
               )}
             </div>
             <div className="pt-4 flex justify-end gap-3">
               <button
                 type="button"
                 onClick={closeModal}
                 className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium active:bg-gray-100 dark:active:bg-slate-800 rounded-xl transition-colors"
               >
                 Bekor qilish
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-5 py-2.5 bg-brand-blue active:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-brand-blue/20 disabled:opacity-70"
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
"""

with open("src/app/admin/courses/page.tsx", "w") as f:
    f.write(code)
print("Admin courses page refactored!")
