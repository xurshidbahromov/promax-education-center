"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/profile";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Shield,
    Key
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        location: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await getUserProfile();
            if (profile) {
                // Split full name into first/last name if possible
                const [firstName = "", lastName = ""] = (profile.full_name || "").split(" ");

                setFormData({
                    firstName,
                    lastName,
                    email: profile.email || "",
                    phone: profile.phone || "",
                    bio: profile.bio || "",
                    location: profile.location || ""
                });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const result = await updateUserProfile({
                full_name: fullName,
                phone: formData.phone,
                bio: formData.bio,
                location: formData.location
            });

            if (result.success) {
                alert(t("profile.success_update"));
            } else {
                alert(t("profile.error_update"));
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(t("profile.error_update"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <User className="text-brand-blue" size={32} />
                {t("profile.title")}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Stats */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-blue to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden relative">
                                    {/* Placeholder Avatar */}
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-4xl font-bold text-gray-400">
                                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                                    </div>
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-brand-blue">0</div>
                                <div className="text-xs text-gray-500">{t("sidebar.onlinetests")}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-brand-orange">0</div>
                                <div className="text-xs text-gray-500">{t("dashboard.stats.coins")}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-brand-blue to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="fill-white/20" />
                            <h3 className="font-bold">{t("profile.student_status")}</h3>
                        </div>
                        <p className="text-blue-100 text-sm mb-4">{t("profile.student_desc")}</p>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white/40 w-[20%]" />
                        </div>
                        <p className="text-xs text-blue-200 mt-2 text-right">{t("profile.level")} 1</p>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("profile.personal_info")}</h3>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? t("profile.saving") : (
                                    <>
                                        <Save size={18} /> {t("profile.save")}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.first_name")}</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.last_name")}</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.email")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800/50 text-gray-500 border-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.phone")}</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.location")}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder={t("profile.location_placeholder")}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("profile.bio")}</label>
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder={t("profile.bio_placeholder")}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Security Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Key size={20} className="text-brand-orange" />
                            {t("profile.security")}
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{t("profile.password")}</p>
                                <p className="text-sm text-gray-500">{t("profile.password_managed")}</p>
                            </div>
                            <button className="text-brand-blue hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                {t("profile.change_password")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
