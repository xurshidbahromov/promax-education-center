import {
    X
} from "lucide-react";
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
        is_active: boolean;
        expires_at: string;
    };
    setFormData: (data: any) => void;
    editingId: string | null;
    loading: boolean;
}

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {editingId ? t('admin.announcements.modal.edit_title') : t('admin.announcements.modal.create_title')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.announcements.form.title')}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.announcements.form.message')}
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={4}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('admin.announcements.form.type')}
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="success">Success</option>
                                <option value="error">Error</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('admin.announcements.form.target')}
                            </label>
                            <select
                                value={formData.target_audience}
                                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as TargetAudience })}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="all">Hammasi</option>
                                <option value="students">Talabalar</option>
                                <option value="teachers">O'qituvchilar</option>
                                <option value="admin">Adminlar</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('admin.announcements.form.expiry')}
                        </label>
                        <input
                            type="date"
                            value={formData.expires_at}
                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                            {t('admin.announcements.form.active')}
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('admin.announcements.form.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? t('admin.announcements.form.saving') : editingId ? t('admin.announcements.form.update') : t('admin.announcements.form.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
