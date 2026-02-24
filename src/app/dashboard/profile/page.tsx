"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile, uploadAvatar } from "@/lib/profile";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Shield,
    Key,
    ArrowLeft,
    Loader2
} from "lucide-react";
import Image from "next/image";
import { useCurrentUser, useDashboardStats, useFullUserProfile } from "@/hooks/useDashboardData";

export default function ProfilePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        location: ""
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");

    // Fetch real stats and profile
    const { data: user } = useCurrentUser();
    const { data: dashboardStats } = useDashboardStats(user?.id);
    const { data: profile, isLoading: isProfileLoading } = useFullUserProfile(user?.id);

    // Initialize form when profile data is loaded
    useEffect(() => {
        if (profile) {
            const [firstName = "", lastName = ""] = (profile.full_name || "").split(" ");

            setAvatarUrl(profile.avatar_url || null);
            setFormData({
                firstName,
                lastName,
                email: profile.email || "",
                phone: profile.phone || "",
                bio: profile.bio || "",
                location: profile.location || ""
            });
        }
    }, [profile]);

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
                showToast(t("profile.success_update"), "success");
            } else {
                showToast(t("profile.error_update"), "error");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast(t("profile.error_update"), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        const url = await uploadAvatar(file);
        if (url) {
            const { success } = await updateUserProfile({ avatar_url: url });
            if (success) {
                setAvatarUrl(url);
                showToast(t("profile.success_update") || "Rasm muvaffaqiyatli yuklandi", "success");
            } else {
                showToast(t("profile.error_update") || "Rasmni saqlashda xatolik", "error");
            }
        } else {
            showToast(t("profile.error_update") || "Rasmni yuklashda xatolik", "error");
        }
        setIsUploadingAvatar(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Barcha maydonlarni to'ldiring");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Yangi parollar mos kelmayapti");
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError("Yangi parol joriy paroldan farq qilishi kerak");
            return;
        }

        setChangingPassword(true);

        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();

            // Get current user email
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                setPasswordError("Foydalanuvchi ma'lumotlari topilmadi");
                setChangingPassword(false);
                return;
            }

            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.currentPassword
            });

            if (signInError) {
                setPasswordError("Joriy parol noto'g'ri kiritilgan");
                setChangingPassword(false);
                return;
            }

            // Current password is correct, now update to new password
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) {
                setPasswordError(error.message || "Parol o'zgartirishda xatolik");
            } else {
                showToast("Parol muvaffaqiyatli o'zgartirildi!", "success");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setShowPasswordForm(false);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError("Kutilmagan xatolik yuz berdi");
        } finally {
            setChangingPassword(false);
        }
    };

    if (isProfileLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-8 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-slate-800 rounded-md"></div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="w-48 h-8 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column Skeleton */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-white/20 dark:border-slate-800/50 shadow-sm text-center">
                            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                            <div className="w-3/4 h-6 mx-auto bg-gray-200 dark:bg-slate-800 rounded-lg mb-2"></div>
                            <div className="w-1/2 h-4 mx-auto bg-gray-200 dark:bg-slate-800 rounded-lg mb-6"></div>
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
                                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                            </div>
                        </div>

                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-white/20 dark:border-slate-800/50 shadow-sm">
                            <div className="w-1/2 h-6 bg-gray-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                            <div className="w-full h-4 bg-gray-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                            <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-800 rounded-full mt-6"></div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-8 border border-white/20 dark:border-slate-800/50 shadow-sm">
                            <div className="flex justify-between mb-8">
                                <div className="w-1/3 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                                <div className="w-32 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="w-1/4 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                        <div className="w-full h-12 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                                    </div>
                                ))}
                                <div className="sm:col-span-2 space-y-2 mt-2">
                                    <div className="w-1/6 h-4 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                    <div className="w-full h-32 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-8 border border-white/20 dark:border-slate-800/50 shadow-sm">
                            <div className="w-1/3 h-8 bg-gray-200 dark:bg-slate-800 rounded-lg mb-6"></div>
                            <div className="w-full h-16 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors w-fit"
            >
                <ArrowLeft size={20} />
                <span>{t("common.back")}</span>
            </button>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <User className="text-brand-blue" size={32} />
                {t("profile.title")}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Stats */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] text-center relative overflow-hidden group">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-blue to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 overflow-hidden relative">
                                    {isUploadingAvatar ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                                        </div>
                                    ) : avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-4xl font-bold text-gray-400 uppercase">
                                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {formData.firstName} {formData.lastName}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>

                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-brand-blue">{dashboardStats?.totalTests || 0}</div>
                                <div className="text-xs text-gray-500">{t("sidebar.onlinetests")}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-brand-orange">{dashboardStats?.totalCoins || 0}</div>
                                <div className="text-xs text-gray-500">{t("dashboard.stats.coins")}</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-brand-blue to-indigo-600 rounded-3xl p-6 text-white shadow-[0_8px_30px_rgb(59,130,246,0.3)] overflow-hidden group">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl group-hover:bg-black/20 transition-all duration-700 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="fill-white/20 text-white" />
                                <h3 className="font-bold">{t("profile.student_status")}</h3>
                            </div>
                            <p className="text-blue-100 text-sm mb-4">{t("profile.student_desc")}</p>
                            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                <div
                                    className="h-full bg-gradient-to-r from-white/60 to-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, ((dashboardStats?.totalTests || 0) % 10) * 10)}%` }}
                                />
                            </div>
                            <p className="text-xs text-blue-200 mt-3 text-right font-medium tracking-wide">
                                {t("profile.level")} {Math.floor((dashboardStats?.totalTests || 0) / 10) + 1}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
                        {/* Decorative gradients */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -z-10" />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                    <User size={18} />
                                </span>
                                {t("profile.personal_info")}
                            </h3>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-brand-blue/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none w-full sm:w-auto justify-center"
                            >
                                {saving ? t("profile.saving") : (
                                    <>
                                        <Save size={18} /> {t("profile.save")}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-brand-blue transition-colors">{t("profile.first_name")}</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 focus:border-brand-blue/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-brand-blue transition-colors">{t("profile.last_name")}</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 focus:border-brand-blue/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none"
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
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800/80 text-gray-500 border border-transparent cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-brand-blue transition-colors">{t("profile.phone")}</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={18} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 focus:border-brand-blue/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none"
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

                            <div className="sm:col-span-2 space-y-2 group">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-focus-within:text-brand-blue transition-colors">{t("profile.bio")}</label>
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder={t("profile.bio_placeholder")}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 focus:border-brand-blue/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-blue/10 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </form>

                    {/* Security Section */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative overflow-hidden">
                        {/* Decorative gradients */}
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -z-10" />

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-brand-orange border border-orange-200 dark:border-orange-500/30">
                                <Key size={18} />
                            </span>
                            {t("profile.security")}
                        </h3>

                        {!showPasswordForm ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t("profile.password")}</p>
                                    <p className="text-sm text-gray-500">********</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(true)}
                                    className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors w-full sm:w-auto"
                                >
                                    {t("profile.change_password")}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                {passwordError && (
                                    <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Joriy parol
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        placeholder="Joriy parolingizni kiriting"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Yangi parol
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        placeholder="Kamida 6 ta belgi"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Yangi parolni tasdiqlang
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        placeholder="Yangi parolni qayta kiriting"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-blue to-indigo-600 hover:shadow-lg hover:shadow-brand-blue/30 hover:-translate-y-0.5 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none order-1 sm:order-2"
                                    >
                                        {changingPassword ? "Saqlanmoqda..." : "Parolni o'zgartirish"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                            setPasswordError("");
                                        }}
                                        className="px-4 py-3 bg-gray-100 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors order-2 sm:order-1 border border-transparent"
                                    >
                                        Bekor qilish
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
