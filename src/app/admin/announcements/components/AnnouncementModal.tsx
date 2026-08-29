'use client';

import { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Sparkles,
  Bell,
  Megaphone,
  UploadCloud,
  Loader2,
  Trash2,
  Tag
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
type TargetAudience = 'all' | 'students' | 'teachers' | 'admin';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: {
    title: string;
    message: string;
    type: AnnouncementType;
    priority: number;
    target_audience: TargetAudience;
    badge?: string;
    image_url?: string;
    is_featured?: boolean;
    is_active: boolean;
    expires_at: string;
  };
  setFormData: (data: any) => void;
  editingId: string | null;
  loading: boolean;
}

const PRESET_BANNER_IMAGES = [
  { name: "MOCK Exam", badge: "MOCK EXAM", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80" },
  { name: "Yangi Kurs", badge: "YANGI KURS", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80" },
  { name: "To'garak", badge: "TO'GARAK", url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80" },
  { name: "Speaking Club", badge: "SPEAKING CLUB", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80" },
  { name: "G'oliblar", badge: "G'OLIBLAR", url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&auto=format&fit=crop&q=80" },
  { name: "Dasturlash", badge: "DASTURLASH", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
];

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingId,
  loading
}: AnnouncementModalProps) {
  const [uploadingImg, setUploadingImg] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Faqat rasm fayllarini yuklash mumkin!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5 MB dan oshmasligi kerak!");
      return;
    }

    setUploadingImg(true);
    const toastId = toast.loading("Rasm yuklanmoqda...");

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `announcement_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `announcements/${fileName}`;

      // 1. Try 'test-images' bucket
      const { error: err1 } = await supabase.storage
        .from('test-images')
        .upload(filePath, file, { upsert: true });

      if (!err1) {
        const { data } = supabase.storage.from('test-images').getPublicUrl(filePath);
        setFormData((prev: any) => ({ ...prev, image_url: data.publicUrl, is_featured: true }));
        toast.success("Rasm muvaffaqiyatli yuklandi", { id: toastId });
        return;
      }

      // 2. Try 'avatars' bucket
      const { error: err2 } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!err2) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setFormData((prev: any) => ({ ...prev, image_url: data.publicUrl, is_featured: true }));
        toast.success("Rasm muvaffaqiyatli yuklandi", { id: toastId });
        return;
      }

      // 3. Fallback to base64 DataURL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, image_url: reader.result as string, is_featured: true }));
        toast.success("Rasm muvaffaqiyatli yuklandi", { id: toastId });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, image_url: reader.result as string, is_featured: true }));
        toast.success("Rasm muvaffaqiyatli yuklandi", { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Megaphone size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              {editingId ? "E'lonni Tahrirlash" : "Yangi E'lon Yaratish"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* ── FORMAT TANLOV — katta, tushunarli kartochkalar ── */}
          <div className="space-y-2">
            <span className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              E'lon Formati — qaysi biri kerak? *
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* BELL NOTIFICATION */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: false, image_url: '' })}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                  !formData.is_featured
                    ? 'border-blue-600 bg-blue-500/8 dark:bg-blue-950/30 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  !formData.is_featured
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {!formData.is_featured && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  !formData.is_featured
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  <Bell size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    Bildirishnoma
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Faqat qo'ng'iroqcha (Bell) xabarlarida chiqadi. Rasm kerak emas.
                  </p>
                </div>
              </button>

              {/* CABINET BANNER */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: true })}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                  formData.is_featured
                    ? 'border-indigo-600 bg-indigo-500/8 dark:bg-indigo-950/30 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  formData.is_featured
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {formData.is_featured && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  formData.is_featured
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                    Kabinet Banneri
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Studentlar kabinetida katta rasmli banner sifatida chiqadi.
                  </p>
                </div>
              </button>
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              E'lon Sarlavhasi *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Masalan: Navbatdagi MOCK IELTS Imtihoni"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              E'lon Matni / Mazmuni *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={3}
              placeholder="E'lon haqida batafsil ma'lumot..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          {/* Banner Badge Text (e.g. MOCK EXAM, YANGI KURS, etc.) */}
          {formData.is_featured && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Banner Nishoni (Badge Text)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Masalan: MOCK EXAM, YANGI KURS, TO'GARAK"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none text-slate-800 dark:text-slate-100 uppercase"
                />
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}

          {/* Banner Image Upload & Selection */}
          {formData.is_featured && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Kabinet Banner Rasmi (Studentlar kabinetida ko'rinadi)
              </label>

              {/* Local File Upload Box */}
              <div className="relative">
                <input
                  type="file"
                  id="announcement-image-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImg}
                  className="hidden"
                />
                <label
                  htmlFor="announcement-image-upload"
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    uploadingImg
                      ? 'opacity-60 pointer-events-none bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                      : 'border-blue-500/30 hover:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/40'
                  }`}
                >
                  {uploadingImg ? (
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold py-1">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Rasm yuklanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Kompyuter / Qurilmadan rasm tanlang
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG, WEBP (Maksimal 5 MB)
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* Live Preview */}
              {formData.image_url && (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-sm">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  {formData.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {formData.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Rasmni olib tashlash</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Preset Options */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Yoki tayyor shablonlardan tanlang:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {PRESET_BANNER_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          image_url: preset.url,
                          badge: formData.badge || preset.badge
                        })
                      }
                      className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all text-left cursor-pointer ${
                        formData.image_url === preset.url
                          ? 'border-blue-600 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white text-center px-0.5 truncate">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Yoki rasm havolasi (URL)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none text-slate-800 dark:text-slate-100"
                />
                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Kategoriya
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="info">Info (Ma'lumot)</option>
                <option value="warning">Warning (Ogohlantirish)</option>
                <option value="success">Success (Yutuq / Muvaffaqiyat)</option>
                <option value="error">Error (Muhim xabar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Auditoriya
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as TargetAudience })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="all">Barchaga</option>
                <option value="students">Faqat O'quvchilarga</option>
                <option value="teachers">Faqat O'qituvchilarga</option>
                <option value="admin">Adminlarga</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Amal Qilish Muddati (Tugash sanasi)
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Faol holatda (Platformada ko'rinsin)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImg}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-600/10 cursor-pointer"
            >
              {loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "E'lon Qilish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
