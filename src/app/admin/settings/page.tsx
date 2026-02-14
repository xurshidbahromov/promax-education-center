"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/utils/supabase/client";
import {
    Settings,
    Globe,
    BookOpen,
    CreditCard,
    Bell,
    Save,
    AlertTriangle,
    Shield,
    Database
} from "lucide-react";

type SettingsCategory = 'general' | 'test' | 'payment' | 'notification' | 'security';

interface PlatformSetting {
    key: string;
    value: any;
    category: SettingsCategory;
    description: string;
}

export default function AdminSettingsPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<SettingsCategory>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [descriptions, setDescriptions] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const settingsMap: Record<string, any> = {};
                const descMap: Record<string, string> = {};

                data.forEach((item: PlatformSetting) => {
                    settingsMap[item.key] = item.value;
                    descMap[item.key] = item.description;
                });

                setSettings(settingsMap);
                setDescriptions(descMap);
            }
        } catch (error: any) {
            console.error("Error fetching settings:", error);
            if (error.code === '42P01') { // undefined_table
                showToast("Database table topilmadi. Migration run qiling!", "error");
            } else {
                showToast("Sozlamalarni yuklashda xatolik", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare updates array
            const updates = Object.keys(settings).map(key => ({
                key,
                value: settings[key],
                updated_at: new Date().toISOString()
            }));

            // Upsert all settings
            for (const update of updates) {
                const { error } = await supabase
                    .from('platform_settings')
                    .update({ value: update.value })
                    .eq('key', update.key);

                if (error) throw error;
            }

            showToast(t('admin.settings.saved'), "success");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            showToast(t('admin.settings.error'), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: t('admin.settings.tab.general'), icon: Globe },
        { id: 'test', label: t('admin.settings.tab.test'), icon: BookOpen },
        { id: 'payment', label: t('admin.settings.tab.payment'), icon: CreditCard },
        { id: 'notification', label: t('admin.settings.tab.notification'), icon: Bell },
    ];

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Settings className="text-brand-blue" size={32} />
                        {t('admin.settings.header.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('admin.settings.header.desc')}
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-10 px-6 flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save size={18} />
                    )}
                    {saving ? t('admin.settings.saving') : t('admin.settings.save')}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-gray-200 dark:border-slate-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SettingsCategory)}
                        className={`
                            flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-medium transition-colors whitespace-nowrap
                            ${activeTab === tab.id
                                ? "bg-white dark:bg-slate-900 text-brand-blue border-b-2 border-brand-blue"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }
                        `}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm min-h-[400px]">

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('admin.settings.general.platform_name')}
                            </label>
                            <input
                                type="text"
                                value={settings.platform_name || ''}
                                onChange={(e) => handleChange('platform_name', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                            />
                            <p className="mt-1 text-xs text-gray-400">{descriptions.platform_name}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.settings.general.contact_email')}
                                </label>
                                <input
                                    type="email"
                                    value={settings.contact_email || ''}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.settings.general.contact_phone')}
                                </label>
                                <input
                                    type="text"
                                    value={settings.contact_phone || ''}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                            <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-500">{t('admin.settings.general.maintenance_mode')}</h4>
                                <p className="text-sm text-yellow-600 dark:text-yellow-600/80">
                                    {t('admin.settings.general.maintenance_mode.desc')}
                                </p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenance_mode || false}
                                    onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Settings */}
                {activeTab === 'test' && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('admin.settings.test.duration')}
                            </label>
                            <input
                                type="number"
                                value={settings.test_duration_default || 60}
                                onChange={(e) => handleChange('test_duration_default', parseInt(e.target.value))}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                            />
                            <p className="mt-1 text-xs text-gray-400">{descriptions.test_duration_default}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('admin.settings.test.passing_score')}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.passing_score_percent || 70}
                                    onChange={(e) => handleChange('passing_score_percent', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                                />
                                <span className="text-gray-500">%</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">{descriptions.passing_score_percent}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{t('admin.settings.test.retakes')}</h4>
                                <p className="text-sm text-gray-500">
                                    {t('admin.settings.test.retakes.desc')}
                                </p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allow_retakes || false}
                                    onChange={(e) => handleChange('allow_retakes', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Settings */}
                {activeTab === 'payment' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.settings.payment.currency')}
                                </label>
                                <select
                                    value={settings.currency || 'UZS'}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                                >
                                    <option value="UZS">UZS (So'm)</option>
                                    <option value="USD">USD (Dollar)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.settings.payment.monthly_fee')}
                                </label>
                                <input
                                    type="number"
                                    value={settings.monthly_fee || 0}
                                    onChange={(e) => handleChange('monthly_fee', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <p>{t('admin.settings.payment.warning')}</p>
                        </div>
                    </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notification' && (
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{t('admin.settings.notification.email')}</h4>
                                <p className="text-sm text-gray-500">
                                    {t('admin.settings.notification.email.desc')}
                                </p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.email_notifications || false}
                                    onChange={(e) => handleChange('email_notifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{t('admin.settings.notification.system')}</h4>
                                <p className="text-sm text-gray-500">
                                    {t('admin.settings.notification.system.desc')}
                                </p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system_notifications || false}
                                    onChange={(e) => handleChange('system_notifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-blue"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
