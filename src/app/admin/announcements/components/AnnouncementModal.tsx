"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Sparkles, Bell, Megaphone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
  { name: "MOCK Exam", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80" },
  { name: "Yangi Kurs", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80" },
  { name: "To'garak", url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80" },
  { name: "Speaking Club", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80" },
  { name: "G'oliblar", url: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&auto=format&fit=crop&q=80" },
  { name: "Dasturlash", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
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
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Megaphone size={20} className="text-brand-blue" />
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              {editingId ? "E'lonni Tahrirlash" : "Yangi E'lon Yaratish"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Announcement Type Selector (Bell vs Cabinet Banner) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              E'lon Turini Tanlang
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: false, image_url: "" })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !formData.is_featured
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bell size={15} />
                <span>Bildirishnoma (Bell - Rasmsiz)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: true })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.is_featured
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Sparkles size={15} />
                <span>Kabinet Banneri (Rasmli)</span>
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
            />
          </div>

          {/* Banner Image URL (Only shown when Kabinet Banner is selected!) */}
          {formData.is_featured && (
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Kabinet Banner Rasmi (Studentlar kabinetining eng pastida ko'rinadi)
              </label>

              {/* Presets */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_BANNER_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: preset.url })}
                    className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all text-left ${
                      formData.image_url === preset.url
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white text-center px-0.5 truncate">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                />
                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {formData.image_url && (
                <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-bold">
                    Kabinet Banner Prevyu
                  </span>
                </div>
              )}
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
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
            />
            <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Faol holatda (Platformada ko'rinsin)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-brand-blue/10"
            >
              {loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "E'lon Qilish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
