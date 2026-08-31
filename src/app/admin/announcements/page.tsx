'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Bell,
  CheckCircle2,
  X,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
  ArrowUpDown,
  Megaphone,
  Layers,
  PauseCircle
} from 'lucide-react';
import { broadcastNotification } from '@/lib/admin-queries';
import { useQueryClient } from '@tanstack/react-query';
import {
  Announcement,
  AnnouncementType,
  TargetAudience,
  getAllAnnouncements,
  saveAnnouncementData,
  deleteAnnouncementData,
  toggleAnnouncementActive
} from '@/lib/announcements';

// Lazy load Modal
const AnnouncementModal = dynamic(() => import('./components/AnnouncementModal'), {
  loading: () => null
});

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'banners' | 'bells' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | AnnouncementType>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'title'>('newest');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as AnnouncementType,
    priority: 0,
    target_audience: 'all' as TargetAudience,
    badge: '',
    image_url: '',
    is_featured: false,
    is_active: true,
    expires_at: ''
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("E'lonlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleUpdate = () => {
      fetchAnnouncements();
    };

    window.addEventListener('promax_announcements_updated', handleUpdate);
    return () => {
      window.removeEventListener('promax_announcements_updated', handleUpdate);
    };
  }, []);

  // KPI Stats
  const stats = useMemo(() => {
    const total = announcements.length;
    const banners = announcements.filter((a) => a.is_featured).length;
    const bells = announcements.filter((a) => !a.is_featured).length;
    const active = announcements.filter((a) => a.is_active).length;
    return { total, banners, bells, active };
  }, [announcements]);

  // Filtered & Sorted Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchesSearch =
          !searchTerm ||
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (a.badge || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab =
          activeTab === 'all' ||
          (activeTab === 'banners' && a.is_featured) ||
          (activeTab === 'bells' && !a.is_featured) ||
          (activeTab === 'active' && a.is_active) ||
          (activeTab === 'inactive' && !a.is_active);

        const matchesType = filterType === 'all' || a.type === filterType;

        return matchesSearch && matchesTab && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') return (b.priority || 0) - (a.priority || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [announcements, searchTerm, activeTab, filterType, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await saveAnnouncementData({
        id: editingId,
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: Number(formData.priority) || 0,
        target_audience: formData.target_audience,
        badge: formData.badge ? formData.badge.trim().toUpperCase() : null,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured || false,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
      });

      if (!editingId && !formData.is_featured) {
        // Broadcast notification only if it's a bell notification, NOT a cabinet banner
        await broadcastNotification(
          formData.title,
          formData.message,
          formData.type,
          formData.target_audience
        );
      }

      toast.success(editingId ? "E'lon yangilandi" : "E'lon muvaffaqiyatli yaratildi");
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
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
      badge: announcement.badge || '',
      image_url: announcement.image_url || '',
      is_featured: !!announcement.is_featured,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, titleName: string) => {
    if (!confirm(`"${titleName}" e'lonini haqiqatan ham o'chirmoqchimisiz?`)) return;

    setLoading(true);
    try {
      await deleteAnnouncementData(id);
      toast.success("E'lon o'chirildi");
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
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
      const newStatus = await toggleAnnouncementActive(id, currentStatus);
      toast.success(newStatus ? "E'lon faollashtirildi" : "E'lon nofaol qilindi");
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 0,
      target_audience: 'all',
      badge: '',
      image_url: '',
      is_featured: false,
      is_active: true,
      expires_at: ''
    });
    setEditingId(null);
  };

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'error':
        return { label: 'Muhim', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'warning':
        return { label: 'Ogohlantirish', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'success':
        return { label: 'Muvaffaqiyat', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      default:
        return { label: "Ma'lumot", bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
  };

  const getAudienceLabel = (aud: TargetAudience) => {
    switch (aud) {
      case 'students':
        return "O'quvchilarga";
      case 'teachers':
        return "O'qituvchilarga";
      case 'admin':
        return 'Adminlarga';
      default:
        return 'Barchaga';
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            E'lonlar va Xabarnomalar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Studentlar dashboardidagi yangilik bannerlari hamda bildirishnomalar boshqaruvi ({announcements.length} ta)
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus size={16} />
          <span>Yangi E'lon Yaratish</span>
        </button>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Jami E'lonlar", value: `${stats.total} ta`, icon: Megaphone, color: "text-blue-500" },
          { label: "Kabinet Bannerlari", value: `${stats.banners} ta`, icon: Sparkles, color: "text-indigo-500" },
          { label: "Qo'ng'iroqcha (Bell)", value: `${stats.bells} ta`, icon: Bell, color: "text-amber-500" },
          { label: "Faol E'lonlar", value: `${stats.active} ta`, icon: CheckCircle2, color: "text-emerald-500" }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">{s.value}</p>
            </div>
            <s.icon size={24} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── SEGMENTED CONTROL TABS ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl w-full sm:w-fit overflow-x-auto border border-slate-200/50 dark:border-slate-700/50">
        {[
          { id: 'all', label: "Barchasi", icon: Layers, count: stats.total },
          { id: 'banners', label: "Kabinet Bannerlari", icon: Sparkles, count: stats.banners },
          { id: 'bells', label: "Bildirishnomalar", icon: Bell, count: stats.bells },
          { id: 'active', label: "Faol", icon: CheckCircle2, count: stats.active },
          { id: 'inactive', label: "Nofaol", icon: PauseCircle, count: stats.total - stats.active }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={14} className={activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === tab.id
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH & FILTERS ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="E'lon sarlavhasi yoki mazmuni bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Type Filter */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">Barcha Turlar</option>
            <option value="info">Info (Ma'lumot)</option>
            <option value="warning">Warning (Ogohlantirish)</option>
            <option value="success">Success (Muvaffaqiyat)</option>
            <option value="error">Muhim (Error)</option>
          </select>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="newest">Yaratilgan vaqti (yangi)</option>
            <option value="priority">Muhimligi (ustuvorlik)</option>
            <option value="title">Sarlavhasi (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── ANNOUNCEMENTS LIST (CLEAN FULL-WIDTH ROWS) ── */}
      {loading ? (
        <div className="space-y-3 animate-pulse pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <Megaphone size={36} className="mx-auto opacity-40" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday e'lon topilmadi</p>
            <p className="text-xs text-slate-400 mt-1">Yangi e'lon qo'shing yoki filtrlarni o'zgartiring</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Yangi E'lon Yaratish</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAnnouncements.map((a) => {
            const typeBadge = getTypeBadge(a.type);
            const dateStr = new Date(a.created_at).toLocaleDateString('uz-UZ', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={a.id}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                {/* Left: Thumbnail & Content */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail / Icon */}
                  {a.image_url ? (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                      <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                      {a.is_featured && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-full bg-blue-600/90 text-[8px] font-black text-white uppercase tracking-wider">
                          Banner
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Bell size={24} />
                    </div>
                  )}

                  {/* Text Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate font-sans-pro">
                        {a.title}
                      </h3>

                      {a.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                          {a.badge}
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                        {getAudienceLabel(a.target_audience)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {a.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{dateStr}</span>
                      </span>

                      {a.priority > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          Prioritet: {a.priority}
                        </span>
                      )}

                      {a.expires_at && (
                        <span>Muddati: {new Date(a.expires_at).toLocaleDateString('uz-UZ')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Switch & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => toggleActive(a.id, a.is_active)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      a.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Statusni o'zgartirish"
                  >
                    {a.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{a.is_active ? 'Faol' : 'Nofaol'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(a)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <AnnouncementModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
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
