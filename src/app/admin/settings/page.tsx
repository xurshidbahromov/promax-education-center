"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";
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
  CheckCircle2,
  Lock,
  Sparkles
} from "lucide-react";

type SettingsCategory = 'general' | 'test' | 'payment' | 'notification';

const DEFAULT_SETTINGS: Record<string, any> = {
  platform_name: "Promax Education Center",
  contact_email: "info@promax.uz",
  contact_phone: "+998 90 123 45 67",
  maintenance_mode: false,
  test_duration_default: 60,
  passing_score_percent: 70,
  allow_retakes: true,
  currency: "UZS",
  monthly_fee: 450000,
  email_notifications: true,
  system_notifications: true
};

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SettingsCategory>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) {
        console.warn("platform_settings read warning, using default settings:", error.message);
      } else if (data && data.length > 0) {
        const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
        data.forEach((item: { key: string; value: any }) => {
          settingsMap[item.key] = item.value;
        });
        setSettings(settingsMap);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.keys(settings).map(key => ({
        key,
        value: settings[key],
        updated_at: new Date().toISOString()
      }));

      // Try upserting settings
      for (const update of updates) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' });

        if (error) {
          console.warn(`Upsert error for key ${update.key}:`, error.message);
        }
      }

      toast.success("Sozlamalar muvaffaqiyatli saqlandi!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Sozlamalarni saqlashda xatolik yuz berdi");
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

  const tabs = [
    { id: 'general' as SettingsCategory, label: "Umumiy", icon: Globe },
    { id: 'test' as SettingsCategory, label: "Test Sozlamalari", icon: BookOpen },
    { id: 'payment' as SettingsCategory, label: "To'lovlar", icon: CreditCard },
    { id: 'notification' as SettingsCategory, label: "Bildirishnomalar", icon: Bell },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Tizim Sozlamalari
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Markaziy platforma konfiguratsiyasi, test va to'lov parametrlari
          </p>
        </div>

        {/* Tab Switcher & Save */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-900 text-brand-blue shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "Saqlanmoqda..." : "Saqlash"}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card Box Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Globe size={20} className="text-brand-blue" />
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    Umumiy Platforma Sozlamalari
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                  Asosiy
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  O'quv Markaz / Platforma Nomi *
                </label>
                <input
                  type="text"
                  value={settings.platform_name || ''}
                  onChange={(e) => handleChange('platform_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Bog'lanish Email Adresi
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={settings.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>

              {/* Maintenance Mode Switch Card */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    <span>Profilaktika Rejimi (Maintenance Mode)</span>
                  </h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">
                    Yoqilganda platforma o'quvchilar uchun vaqtincha texnik tanaffus rejimiga o'tadi
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode || false}
                    onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>
            </div>
          )}

          {/* TEST SETTINGS TAB */}
          {activeTab === 'test' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <BookOpen size={20} className="text-brand-blue" />
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    Test va Imtihon Konfiguratsiyasi
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600">
                  Imtihonlar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Standart Test Vaqti (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={settings.test_duration_default || 60}
                    onChange={(e) => handleChange('test_duration_default', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    O'tish Bal Foizi (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.passing_score_percent || 70}
                    onChange={(e) => handleChange('passing_score_percent', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Qayta Topshirishga Ruxsat Berish (Retakes)
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Talabalarga testni muvaffaqiyatsiz topshirgandan so'ng qayta urinish imkonini beradi
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.allow_retakes || false}
                    onChange={(e) => handleChange('allow_retakes', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue" />
                </label>
              </div>
            </div>
          )}

          {/* PAYMENT SETTINGS TAB */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard size={20} className="text-brand-blue" />
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    To'lov va Valyuta Parametrlari
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                  Moliya
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Valyuta Birligi
                  </label>
                  <select
                    value={settings.currency || 'UZS'}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="UZS">UZS (So'm)</option>
                    <option value="USD">USD (AQSH Dollari)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Standart Oylik Kurs To'lovi
                  </label>
                  <input
                    type="number"
                    value={settings.monthly_fee || 0}
                    onChange={(e) => handleChange('monthly_fee', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS TAB */}
          {activeTab === 'notification' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Bell size={20} className="text-brand-blue" />
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    Bildirishnoma Tizimi
                  </h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                  Ogohlantirishlar
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      Tizim Ichki Bildirishnomalari (In-app Bell)
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      O'quvchilar dashboardi va o'qituvchilar kabinetidagi bildirishnoma qo'ng'iroqchasini faollashtirish
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.system_notifications !== false}
                      onChange={(e) => handleChange('system_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      Email Bildirishnomalar
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Yangi testlar va to'lov kvitansiyalarini o'quvchi pochta manziliga yuborish
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications !== false}
                      onChange={(e) => handleChange('email_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
