"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getSubjectById, getLessonsBySubjectId, getMaterialsByLessonId, type Subject, type Lesson, type Material } from "@/lib/supabase-queries";
import { Plus, Edit2, Trash2, ArrowLeft, GripVertical, FileText, PlayCircle, FileDown, Link as LinkIcon, Save } from "lucide-react";

export default function AdminSubjectDetailPage({ params }: { params: Promise<{ subjectId: string }> }) {
 const router = useRouter();
 const resolvedParams = use(params);
 const subjectId = resolvedParams.subjectId;

 const [subject, setSubject] = useState<Subject | null>(null);
 const [lessons, setLessons] = useState<(Lesson & { materials: Material[] })[]>([]);
 const [loading, setLoading] = useState(true);

 // Modals state
 const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
 const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Form states
 const [lessonForm, setLessonForm] = useState({ id: "", title: "", description: "", order_num: 0 });
 const [materialForm, setMaterialForm] = useState({ id: "", lesson_id: "", title: "", type: "video" as "video"|"pdf"|"text"|"link", url: "", content: "" });
 const [isEditingLesson, setIsEditingLesson] = useState(false);
 const [isEditingMaterial, setIsEditingMaterial] = useState(false);

 const supabase = createClient();

 useEffect(() => {
 if (subjectId) {
 loadData();
 }
 }, [subjectId]);

 async function loadData() {
 setLoading(true);
 const subj = await getSubjectById(subjectId);
 setSubject(subj);

 if (subj) {
 const less = await getLessonsBySubjectId(subjectId);
 const lessonsWithMaterials = await Promise.all(less.map(async (l) => {
 const materials = await getMaterialsByLessonId(l.id);
 return { ...l, materials };
 }));
 setLessons(lessonsWithMaterials);
 }
 setLoading(false);
 }

 // --- LESSON HANDLERS ---
 const openLessonModal = (lesson?: Lesson) => {
 if (lesson) {
 setLessonForm({ id: lesson.id, title: lesson.title, description: lesson.description || "", order_num: lesson.order_num });
 setIsEditingLesson(true);
 } else {
 setLessonForm({ id: "", title: "", description: "", order_num: lessons.length + 1 });
 setIsEditingLesson(false);
 }
 setIsLessonModalOpen(true);
 };

 const handleLessonSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (isEditingLesson) {
 await supabase.from("lessons").update({
 title: lessonForm.title,
 description: lessonForm.description,
 order_num: lessonForm.order_num
 }).eq("id", lessonForm.id);
 } else {
 await supabase.from("lessons").insert({
 subject_id: subjectId,
 title: lessonForm.title,
 description: lessonForm.description,
 order_num: lessonForm.order_num
 });
 }
 await loadData();
 setIsLessonModalOpen(false);
 } catch (err: any) {
 console.error("Error saving lesson:", err.message || err);
 alert(`Xatolik: ${err.message || "Noma'lum xato"}`);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDeleteLesson = async (id: string) => {
 if (!confirm("Darsni o'chirmoqchimisiz? Undagi materiallar ham o'chib ketadi!")) return;
 try {
 const { error } = await supabase.from("lessons").delete().eq("id", id);
 if (error) throw error;
 await loadData();
 } catch (err: any) {
 console.error("Error deleting lesson:", err.message || err);
 alert(`Xatolik: ${err.message || "Noma'lum xato"}`);
 }
 };

 // --- MATERIAL HANDLERS ---
 const openMaterialModal = (lessonId: string, material?: Material) => {
 if (material) {
 setMaterialForm({ 
 id: material.id, 
 lesson_id: material.lesson_id, 
 title: material.title, 
 type: material.type, 
 url: material.url || "", 
 content: material.content || "" 
 });
 setIsEditingMaterial(true);
 } else {
 setMaterialForm({ id: "", lesson_id: lessonId, title: "", type: "video", url: "", content: "" });
 setIsEditingMaterial(false);
 }
 setIsMaterialModalOpen(true);
 };

 const handleMaterialSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 if (isEditingMaterial) {
 await supabase.from("materials").update({
 title: materialForm.title,
 type: materialForm.type,
 url: materialForm.url,
 content: materialForm.content
 }).eq("id", materialForm.id);
 } else {
 await supabase.from("materials").insert({
 lesson_id: materialForm.lesson_id,
 title: materialForm.title,
 type: materialForm.type,
 url: materialForm.url,
 content: materialForm.content
 });
 }
 await loadData();
 setIsMaterialModalOpen(false);
 } catch (err: any) {
 console.error("Error saving material:", err.message || err);
 alert(`Xatolik: ${err.message || "Noma'lum xato"}`);
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDeleteMaterial = async (id: string) => {
 if (!confirm("Materialni o'chirmoqchimisiz?")) return;
 try {
 const { error } = await supabase.from("materials").delete().eq("id", id);
 if (error) throw error;
 await loadData();
 } catch (err: any) {
 console.error("Error deleting material:", err.message || err);
 alert(`Xatolik: ${err.message || "Noma'lum xato"}`);
 }
 };

 if (loading) return <div className="text-center py-20 animate-pulse text-gray-500">Yuklanmoqda...</div>;
 if (!subject) return <div className="text-center py-20">Fan topilmadi</div>;

 const getMaterialIcon = (type: string) => {
 switch(type) {
 case 'video': return <PlayCircle size={16} className="text-red-500" />;
 case 'pdf': return <FileDown size={16} className="text-red-500" />;
 case 'link': return <LinkIcon size={16} className="text-blue-500" />;
 case 'text': return <FileText size={16} className="text-gray-500" />;
 default: return <FileText size={16} />;
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
 <ArrowLeft size={24} />
 </button>
 <div>
 <h1 className="text-2xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
 {subject.title}
 </h1>
 <p className="text-gray-500 dark:text-gray-400 text-sm">Fandagi barcha darslar va materiallar</p>
 </div>
 </div>

 <div className="flex justify-end">
 <button
 onClick={() => openLessonModal()}
 className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
 >
 <Plus size={20} />
 Yangi dars qo'shish
 </button>
 </div>

 <div className="space-y-4">
 {lessons.length === 0 ? (
 <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-gray-200 dark:border-slate-800">
 <p className="text-gray-500 dark:text-gray-400">Hech qanday dars qo'shilmagan.</p>
 </div>
 ) : (
 lessons.map((lesson) => (
 <div key={lesson.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
 <div className="p-4 sm:p-5 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="cursor-move text-gray-400 hover:text-gray-600">
 <GripVertical size={20} />
 </div>
 <div>
 <h3 className="font-medium text-slate-800 dark:text-slate-100">
 {lesson.order_num}-dars: {lesson.title}
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">{lesson.description}</p>
 </div>
 </div>
 <div className="flex gap-2">
 <button onClick={() => openMaterialModal(lesson.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
 <Plus size={16} /> Material
 </button>
 <button onClick={() => openLessonModal(lesson)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
 <Edit2 size={16} />
 </button>
 <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 
 <div className="p-4">
 {lesson.materials.length === 0 ? (
 <p className="text-sm text-gray-500 italic px-8">Materiallar yo'q...</p>
 ) : (
 <div className="space-y-2 px-2 sm:px-8">
 {lesson.materials.map(mat => (
 <div key={mat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
 <div className="flex items-center gap-3">
 {getMaterialIcon(mat.type)}
 <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{mat.title}</span>
 <span className="text-[10px] uppercase font-medium text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{mat.type}</span>
 </div>
 <div className="flex gap-1">
 <button onClick={() => openMaterialModal(lesson.id, mat)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors">
 <Edit2 size={14} />
 </button>
 <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>

 {/* Lesson Modal */}
 {isLessonModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
 <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
 <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">
 {isEditingLesson ? "Darsni tahrirlash" : "Yangi dars"}
 </h3>
 <button onClick={() => setIsLessonModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
 </div>
 <form onSubmit={handleLessonSubmit} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dars nomi</label>
 <input required type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavsif</label>
 <textarea value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" rows={2} />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tartib raqami</label>
 <input required type="number" value={lessonForm.order_num} onChange={e => setLessonForm({...lessonForm, order_num: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
 </div>
 <div className="pt-4 flex justify-end gap-3">
 <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">Bekor qilish</button>
 <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-brand-blue text-white rounded-xl disabled:opacity-70">Saqlash</button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Material Modal */}
 {isMaterialModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
 <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
 <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
 <h3 className="font-medium text-lg text-slate-800 dark:text-slate-100">
 {isEditingMaterial ? "Materialni tahrirlash" : "Yangi material"}
 </h3>
 <button onClick={() => setIsMaterialModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
 </div>
 <form onSubmit={handleMaterialSubmit} className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sarlavha</label>
 <input required type="text" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Turi</label>
 <select value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value as any})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700">
 <option value="video">Video (YouTube)</option>
 <option value="pdf">PDF fayl</option>
 <option value="link">Veb-sahifa havolasi</option>
 <option value="text">Matn</option>
 </select>
 </div>
 
 {materialForm.type !== 'text' && (
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL (Havola)</label>
 <input required type="url" value={materialForm.url} onChange={e => setMaterialForm({...materialForm, url: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" placeholder="https://..." />
 </div>
 )}

 {materialForm.type === 'text' && (
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matn (HTML bo'lishi mumkin)</label>
 <textarea required value={materialForm.content} onChange={e => setMaterialForm({...materialForm, content: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono text-sm" rows={5} />
 </div>
 )}
 
 <div className="pt-4 flex justify-end gap-3">
 <button type="button" onClick={() => setIsMaterialModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">Bekor qilish</button>
 <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-brand-blue text-white rounded-xl disabled:opacity-70">Saqlash</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
