"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { broadcastNotification } from "@/lib/admin-queries";

// Lazy load Modal
const AnnouncementModal = dynamic(() => import('./components/AnnouncementModal'), {
  loading: () => null
});

type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
type TargetAudience = 'all' | 'students' | 'teachers' | 'admin';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: number;
  target_audience: TargetAudience;
  image_url?: string | null;
  is_featured?: boolean | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | AnnouncementType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: 'info' as AnnouncementType,
    priority: 0,
    target_audience: 'all' as TargetAudience,
    image_url: "",
    is_featured: false,
    is_active: true,
    expires_at: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("E'lonlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: Number(formData.priority) || 0,
        target_audience: formData.target_audience,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured || false,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
      };

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("E'lon yangilandi");
      } else {
        // Create
        const { error } = await supabase
          .from('announcements')
          .insert([payload]);

        if (error) throw error;
        toast.success("E'lon muvaffaqiyatli yaratildi");

        // Broadcast notification if it's targeted for students/all
        await broadcastNotification(
          formData.title,
          formData.message,
          formData.type,
          formData.target_audience
        );
      }

      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error saving announcement:", error);
      toast.error("E'lonni saqlashda xatolik: " + (error?.message || "Noma'lum xato"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority || 0,
      target_audience: announcement.target_audience,
      image_url: announcement.image_url || "",
      is_featured: !!announcement.is_featured,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ushbu e'lonni haqiqatan ham o'chirmoqchimisiz?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("E'lon o'chirildi");
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(!currentStatus ? "E'lon faollashtirildi" : "E'lon nofaol qilindi");
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: 'info',
      priority: 0,
      target_audience: 'all',
      image_url: "",
      is_featured: false,
      is_active: true,
      expires_at: ""
    });
    setEditingId(null);
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            E'lonlar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Studentlar dashboardi hamda qo'ng'iroqcha (Bell) bildirishnomalari ({announcements.length} ta)
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Yangi E'lon Yaratish</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="E'lon sarlavhasi yoki mazmuni bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="all">Barcha Turlar</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Bell size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">Hali hech qanday e'lon yaratilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                {/* Optional Banner Image Preview Header */}
                {a.image_url ? (
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles size={11} />
                      <span>Kabinet Banneri</span>
                    </span>
                  </div>
                ) : null}

                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base line-clamp-2">
                      {a.title}
                    </h3>

                    {!a.image_url && a.is_featured && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                        Banner
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                    {a.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold capitalize">
                      {a.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold capitalize">
                      Auditoriya: {a.target_audience}
                    </span>
                    {a.expires_at && (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <Clock size={12} />
                        {new Date(a.expires_at).toLocaleDateString('uz-UZ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Box-free Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-2">
                <button
                  onClick={() => toggleActive(a.id, a.is_active)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    a.is_active ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {a.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  <span>{a.is_active ? "Faol" : "Nofaol"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AnnouncementModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          loading={loading}
        />
      )}
    </div>
  );
}
