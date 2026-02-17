"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useToast } from "@/context/ToastContext";
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
    X
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
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    created_by: string | null;
}

export default function AdminAnnouncementsPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
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
            showToast(t('admin.announcements.toast.save_error'), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                expires_at: formData.expires_at || null,
                priority: Number(formData.priority)
            };

            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('announcements')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                showToast(t('admin.announcements.toast.updated'), "success");
            } else {
                // Create
                const { error } = await supabase
                    .from('announcements')
                    .insert([payload]);

                if (error) throw error;
                showToast(t('admin.announcements.toast.created'), "success");

                // Broadcast notification
                await broadcastNotification(
                    t('notification.announcement.title') || "Yangi E'lon",
                    t('notification.announcement.message') || "Yangi e'lon joylandi. Batafsil ma'lumotni Dashboard sahifasidagi e'lonlar bo'limidan o'qishingiz mumkin.",
                    payload.type,
                    payload.target_audience
                );
            }

            setShowModal(false);
            resetForm();
            fetchAnnouncements();
        } catch (error: any) {
            console.error("Error saving announcement:", error);
            console.error("Error details:", {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                full: error
            });

            // More user-friendly error message
            let errorMsg = t('admin.announcements.toast.save_error');
            if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
                errorMsg = "Database table mavjud emas. Migration run qilish kerak!";
            } else if (error?.message) {
                errorMsg = error.message;
            }

            showToast(errorMsg, "error");
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
            priority: announcement.priority,
            target_audience: announcement.target_audience,
            is_active: announcement.is_active,
            expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('common.delete_confirm') || "Bu e'lonni o'chirishni xohlaysizmi?")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showToast(t('admin.announcements.toast.deleted'), "success");
            fetchAnnouncements();
        } catch (error: any) {
            console.error("Error deleting announcement:", error);
            showToast(t('admin.announcements.toast.save_error'), "error");
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
            showToast(t('admin.announcements.toast.updated'), "success");
            fetchAnnouncements();
        } catch (error: any) {
            console.error("Error toggling active:", error);
            showToast(t('admin.announcements.toast.status_error'), "error");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            message: "",
            type: 'info',
            priority: 0,
            target_audience: 'all',
            is_active: true,
            expires_at: ""
        });
        setEditingId(null);
    };

    const getTypeIcon = (type: AnnouncementType) => {
        switch (type) {
            case 'info': return <Info size={18} className="text-blue-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-yellow-500" />;
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
            case 'error': return <X size={18} className="text-red-500" />;
        }
    };

    const getTypeBadge = (type: AnnouncementType) => {
        const colors = {
            info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[type]} flex items-center gap-1`}>
                {getTypeIcon(type)}
                {type}
            </span>
        );
    };

    const filteredAnnouncements = announcements.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="text-brand-blue" size={32} />
                        {t('admin.announcements.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('admin.announcements.desc')}
                    </p>
                </div>

                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="h-10 px-4 flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    {t('admin.announcements.new')}
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="w-full sm:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('admin.announcements.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                </div>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                >
                    <option value="all">{t('admin.announcements.filter.all')}</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                </select>
            </div>

            {/* Announcements List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
                    <p className="mt-4 text-gray-500">{t('admin.announcements.loading')}</p>
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500">{t('admin.announcements.empty')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getTypeBadge(announcement.type)}
                                        <span className="text-xs text-gray-500">
                                            {announcement.target_audience}
                                        </span>
                                        {!announcement.is_active && (
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                                                {t('admin.announcements.status.inactive')}
                                            </span>
                                        )}
                                        {announcement.expires_at && (
                                            <span className="text-xs text-gray-500">
                                                {t('admin.announcements.expires')} {new Date(announcement.expires_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {announcement.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {announcement.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(announcement.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                                        className={`p-2 rounded-xl transition-colors ${announcement.is_active
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        title={announcement.is_active ? t('admin.announcements.actions.deactivate') : t('admin.announcements.actions.activate')}
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(announcement)}
                                        className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition-colors"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lazy Loaded Modal */}
            <AnnouncementModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                editingId={editingId}
                loading={loading}
            />
        </div>
    );
}
