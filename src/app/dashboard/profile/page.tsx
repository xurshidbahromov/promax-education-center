"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  updateUserProfile,
  uploadAvatar,
  updateUserSettings,
  updatePassword,
} from "@/lib/profile";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Shield,
  Key,
  ArrowLeft,
  Loader2,
  Settings,
  Bell,
  Palette,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  MessageSquare,
  LogOut,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle2,
  Volume2,
  VolumeX,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  useCurrentUser,
  useFullUserProfile,
} from "@/hooks/useDashboardData";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { soundFx } from "@/lib/sound-effects";

type ProfileView =
  | "main"
  | "profile"
  | "security"
  | "notifications"
  | "themes"
  | "help"
  | "contact"
  | "statistics";

function formatUzPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "";
  if (cleaned.length <= 3 && "998".startsWith(cleaned)) return "+998 ";
  let digits = cleaned.startsWith("998") ? cleaned : "998" + cleaned;
  digits = digits.slice(0, 12);
  let formatted = "+998";
  if (digits.length > 3) formatted += " " + digits.slice(3, 5);
  if (digits.length > 5) formatted += " " + digits.slice(5, 8);
  if (digits.length > 8) formatted += " " + digits.slice(8, 10);
  if (digits.length > 10) formatted += " " + digits.slice(10, 12);
  return formatted;
}

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [activeView, _setActiveView] = useState<ProfileView>("main");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const setActiveView = (view: ProfileView) => {
    setDirection(view === "main" ? "backward" : "forward");
    _setActiveView(view);
    if (typeof window !== "undefined") {
      const mainEl = document.querySelector("main");
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Escape returns to main profile view or closes logout confirm
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false);
        } else if (activeView !== "main") {
          setActiveView("main");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeView, showLogoutConfirm]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Data hooks
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useFullUserProfile(
    user?.id
  );

  // Form States
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  useEffect(() => {
    setSoundEnabled(soundFx.isEnabled());
    const syncSound = () => setSoundEnabled(soundFx.isEnabled());
    window.addEventListener("promax_sound_toggled", syncSound);
    return () => window.removeEventListener("promax_sound_toggled", syncSound);
  }, []);

  // Initialize form from profile (preserves multi-word last names cleanly)
  useEffect(() => {
    if (profile) {
      const parts = (profile.full_name || "").trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      setAvatarUrl(profile.avatar_url || null);
      setFormData({
        firstName,
        lastName,
        phone: profile.phone ? formatUzPhoneInput(profile.phone) : "",
      });
      if (profile.settings?.notifications) {
        setNotifications(profile.settings.notifications);
      }
    }
  }, [profile]);

  const invalidateProfileCaches = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["fullUserProfile", user.id] });
    }
    window.dispatchEvent(new CustomEvent("promax_profile_updated"));
  };

  // Handlers
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Iltimos, faqat rasm faylini tanlang");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5 MB dan oshmasligi kerak");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        const { success } = await updateUserProfile({ avatar_url: url });
        if (success) {
          setAvatarUrl(url);
          invalidateProfileCaches();
          soundFx.playSuccess();
          toast.success(
            t("profile.success_update") || "Rasm muvaffaqiyatli yuklandi"
          );
        } else {
          toast.error(t("profile.error_update") || "Rasmni saqlashda xatolik");
        }
      } else {
        toast.error(t("profile.error_update") || "Rasmni yuklashda xatolik");
      }
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    if (!fullName) {
      toast.error("Iltimos, ismingizni kiriting");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length < 9) {
      toast.error("To'liq telefon raqamini kiriting: +998 XX XXX XX XX");
      return;
    }

    setSavingProfile(true);
    try {
      const normalizedPhone =
        phoneDigits.length >= 9
          ? phoneDigits.length === 9
            ? `+998${phoneDigits}`
            : `+${phoneDigits}`
          : "";

      const result = await updateUserProfile({
        full_name: fullName,
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
      });

      // Also persist via server route so RLS never blocks phone sync
      if (normalizedPhone) {
        await fetch("/api/profile/phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneDigits }),
        }).catch(() => {});
      }

      if (result.success) {
        invalidateProfileCaches();
        soundFx.playSuccess();
        toast.success(t("profile.success_update") || "Ma'lumotlar saqlandi");
        setActiveView("main");
      } else {
        toast.error(t("profile.error_update") || "Xatolik yuz berdi");
      }
    } catch {
      toast.error(t("profile.error_update") || "Xatolik yuz berdi");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yangi parollar mos kelmayapti");
      return;
    }

    setChangingPassword(true);
    try {
      const { success } = await updatePassword(passwordData.newPassword);
      if (success) {
        soundFx.playSuccess();
        toast.success("Parol muvaffaqiyatli o'zgartirildi");
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setActiveView("main");
      } else {
        toast.error("Parolni o'zgartirishda xatolik yuz berdi");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setChangingPassword(false);
    }
  };

  const saveSetting = async (key: string, value: unknown) => {
    if (!user) return;
    const newSettings = {
      theme: key === "theme" ? value : theme,
      language: key === "language" ? value : language,
      notifications: key === "notifications" ? value : notifications,
    };
    await updateUserSettings(newSettings);
  };

  // Shared Sub-View Header
  const ViewHeader = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) => (
    <div className="flex items-center gap-3.5 mb-5">
      <button
        type="button"
        onClick={() => setActiveView("main")}
        aria-label="Orqaga"
        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 hover:border-brand-blue/40 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
      >
        <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
      </button>
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // Clean Menu Row Component
  const MenuRow = ({
    icon: Icon,
    iconStyle,
    title,
    description,
    badge,
    onClick,
  }: {
    icon: typeof User;
    iconStyle: string;
    title: string;
    description: string;
    badge?: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3.5 sm:p-4 flex items-center gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 active:bg-slate-100/70 dark:active:bg-slate-800/60 transition-colors group cursor-pointer text-left"
    >
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconStyle}`}
      >
        <Icon size={19} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-[15px] leading-tight truncate">
            {title}
          </h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold shrink-0">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
          {description}
        </p>
      </div>
      <ChevronRight
        size={17}
        className="text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-brand-blue transition-all shrink-0"
      />
    </button>
  );

  // ── VIEW 0: MAIN PROFILE HUB (Minimalist Premium) ──
  const renderMain = () => {
    const cleanPhone = (profile?.phone || "").replace(/\D/g, "");
    const hasPhone = cleanPhone.length >= 9;

    return (
      <div className="space-y-4">
        {/* Clean Centered Profile Identity */}
        <div className="flex flex-col items-center text-center pt-2 pb-3">
          <div className="relative mb-3.5">
            <div className="relative w-24 h-24 rounded-[28px] border-2 border-white/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-black font-fredoka text-brand-blue dark:text-blue-400 uppercase select-none">
                  {(profile?.full_name || "O")[0]}
                </span>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Rasmni o'zgartirish"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Camera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>

          <h1 className="text-2xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
            {profile?.full_name || "O'quvchi"}
          </h1>

          {hasPhone ? (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {formatUzPhoneInput(profile?.phone || "")}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("profile")}
              className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[11px] hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <AlertCircle size={12} />
              <span>Telefon raqam qo&apos;shish</span>
            </button>
          )}
        </div>

        {/* Main Settings Card */}
        <div className="bg-white/65 dark:bg-slate-900/65 backdrop-blur-xl rounded-[26px] border border-white/70 dark:border-slate-800/70 overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-800/70">
          <MenuRow
            icon={TrendingUp}
            iconStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            title={
              t("profile.menu.statistics") === "profile.menu.statistics"
                ? "Statistika"
                : t("profile.menu.statistics")
            }
            description={
              t("profile.menu.statistics_desc") ===
              "profile.menu.statistics_desc"
                ? "O'zlashtirish ko'rsatkichlari va grafik"
                : t("profile.menu.statistics_desc")
            }
            onClick={() => setActiveView("statistics")}
          />
          <MenuRow
            icon={Settings}
            iconStyle="bg-brand-blue/10 text-brand-blue dark:text-blue-400"
            title={t("profile.menu.settings") || "Shaxsiy ma'lumotlar"}
            description={
              t("profile.menu.settings_desc") ||
              "Ism, familiya va telefon raqam"
            }
            badge={!hasPhone ? "Raqam yo'q" : undefined}
            onClick={() => setActiveView("profile")}
          />
          <MenuRow
            icon={Shield}
            iconStyle="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            title={t("profile.menu.parental") || "Xavfsizlik"}
            description={
              t("profile.menu.parental_desc") ||
              "Parolni yangilash"
            }
            onClick={() => setActiveView("security")}
          />
          <MenuRow
            icon={Bell}
            iconStyle="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            title={t("profile.menu.notifications") || "Bildirishnomalar"}
            description={
              t("profile.menu.notifications_desc") ||
              "Xabarnomalarni boshqarish"
            }
            onClick={() => setActiveView("notifications")}
          />
          <MenuRow
            icon={Palette}
            iconStyle="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            title={t("profile.menu.themes") || "Til, Mavzu va Ovoz"}
            description={
              t("profile.menu.themes_desc") ||
              "Yorug'/tungi rejim, til va ovoz"
            }
            onClick={() => setActiveView("themes")}
          />
        </div>

        {/* Help & Support Card */}
        <div className="bg-white/65 dark:bg-slate-900/65 backdrop-blur-xl rounded-[26px] border border-white/70 dark:border-slate-800/70 overflow-hidden divide-y divide-slate-200/50 dark:divide-slate-800/70">
          <MenuRow
            icon={HelpCircle}
            iconStyle="bg-teal-500/10 text-teal-600 dark:text-teal-400"
            title={t("profile.menu.help") || "Yordam va Qo'llanma"}
            description={
              t("profile.menu.help_desc") || "Ko'p beriladigan savollar"
            }
            onClick={() => setActiveView("help")}
          />
          <MenuRow
            icon={Mail}
            iconStyle="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            title={t("profile.menu.contact") || "Biz bilan aloqa"}
            description={
              t("profile.menu.contact_desc") ||
              "Admin va texnik yordam"
            }
            onClick={() => setActiveView("contact")}
          />
        </div>

        {/* Clean Logout Action */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-rose-500/[0.06] dark:bg-rose-500/10 hover:bg-rose-500/10 rounded-[24px] p-4 flex items-center justify-center gap-2 border border-rose-500/15 active:scale-[0.99] transition-all text-rose-600 dark:text-rose-400 font-bold text-sm cursor-pointer"
        >
          <LogOut size={17} strokeWidth={2.2} />
          <span>{t("profile.menu.logout") || "Hisobdan chiqish"}</span>
        </button>
      </div>
    );
  };

  // ── VIEW 1: STATISTICS ──
  const renderStatistics = () => (
    <div className="w-full pb-6 space-y-5">
      <ViewHeader
        title={
          t("profile.menu.statistics") === "profile.menu.statistics"
            ? "Statistika"
            : t("profile.menu.statistics")
        }
        subtitle="O'zlashtirish ko'rsatkichlari va dinamika"
      />
      <div className="space-y-4">
        <StatsGrid userId={user?.id} />
        <ProgressChart userId={user?.id} />
        <Link
          href="/dashboard/results"
          className="w-full p-4 rounded-[22px] bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/70 dark:border-slate-800/70 hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all group"
        >
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Barcha natijalar tarixi
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Topshirgan barcha imtihon va testlaringiz tahlili
            </p>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </Link>
      </div>
    </div>
  );

  // ── VIEW 2: PROFILE EDIT ──
  const renderProfileEdit = () => (
    <div className="w-full">
      <ViewHeader
        title={t("profile.view.settings.title") || "Shaxsiy ma'lumotlar"}
        subtitle="Ism, familiya va aloqa raqamingizni yangilang"
      />
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                {t("profile.view.settings.first_name") || "Ism"}
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Ismingiz"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                {t("profile.view.settings.last_name") || "Familiya"}
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Familiyangiz"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white text-sm font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
              {t("profile.view.settings.phone") || "Telefon raqam"}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: formatUzPhoneInput(e.target.value),
                })
              }
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white text-sm font-semibold tabular-nums"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm sm:text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {savingProfile ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{t("profile.view.settings.save") || "Saqlash"}</span>
        </button>
      </form>
    </div>
  );

  // ── VIEW 3: SECURITY / PASSWORD ──
  const renderSecurity = () => {
    const isLongEnough = passwordData.newPassword.length >= 6;
    const isMatching =
      passwordData.confirmPassword.length > 0 &&
      passwordData.newPassword === passwordData.confirmPassword;

    return (
      <div className="w-full">
        <ViewHeader
          title={t("profile.view.security.title") || "Xavfsizlik"}
          subtitle="Hisobingiz parolini yangilang"
        />
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                {t("profile.view.security.new_password") || "Yangi parol"}
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Kamida 6 ta belgi"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((p) => !p)}
                  aria-label="Parolni ko'rsatish"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider ml-1">
                {t("profile.view.security.confirm_password") ||
                  "Yangi parolni tasdiqlang"}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Parolni qayta kiriting"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-brand-blue transition-colors text-slate-900 dark:text-white text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((p) => !p)}
                  aria-label="Parolni ko'rsatish"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Live Validation Hints */}
            <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  isLongEnough ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                )}
              >
                <CheckCircle2 size={13} />
                Kamida 6 ta belgi
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  isMatching ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                )}
              >
                <CheckCircle2 size={13} />
                Parollar mos
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword || !isLongEnough || !isMatching}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm sm:text-[15px] transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {changingPassword ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Key size={18} />
            )}
            <span>
              {t("profile.view.security.button") || "Parolni o'zgartirish"}
            </span>
          </button>
        </form>
      </div>
    );
  };

  // ── VIEW 4: THEMES, LANGUAGE & SOUND ──
  const renderThemes = () => {
    const langOptions = [
      { code: "UZ" as const, label: "O'zbekcha" },
      { code: "RU" as const, label: "Русский" },
      { code: "EN" as const, label: "English" },
    ];

    return (
      <div className="w-full">
        <ViewHeader
          title={t("profile.view.themes.title") || "Til, Mavzu va Ovoz"}
          subtitle="Ilovaning tashqi ko'rinishi va ovoz sozlamalari"
        />

        <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              {t("profile.view.themes.select_theme") || "Mavzuni tanlang"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  saveSetting("theme", "light");
                  toast.success("Yorug' rejim yoqildi");
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer",
                  theme === "light"
                    ? "border-brand-blue bg-brand-blue/[0.06] text-brand-blue"
                    : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500"
                )}
              >
                <Sun size={26} />
                <span className="font-bold text-xs sm:text-sm">
                  {t("profile.view.themes.light") || "Yorug'"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  saveSetting("theme", "dark");
                  toast.success("Tungi rejim yoqildi");
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer",
                  theme === "dark"
                    ? "border-brand-blue bg-brand-blue/15 text-brand-blue dark:text-blue-400"
                    : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500"
                )}
              >
                <Moon size={26} />
                <span className="font-bold text-xs sm:text-sm">
                  {t("profile.view.themes.dark") || "Tungi"}
                </span>
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Language */}
          <div>
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              {t("profile.view.themes.select_lang") || "Tilni tanlang"}
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {langOptions.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    saveSetting("language", item.code);
                    toast.success(`Til: ${item.label}`);
                  }}
                  className={cn(
                    "py-3 px-2 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all active:scale-[0.98] cursor-pointer",
                    language === item.code
                      ? "border-brand-blue bg-brand-blue/[0.06] text-brand-blue dark:text-blue-400"
                      : "border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Ovoz effektlari
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  Tugmalar, test va o&apos;yinlar ovozi
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => {
                const next = soundFx.toggle();
                setSoundEnabled(next);
              }}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative shrink-0 cursor-pointer",
                soundEnabled ? "bg-brand-blue" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform",
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── VIEW 5: NOTIFICATIONS ──
  const renderNotifications = () => (
    <div className="w-full">
      <ViewHeader
        title={t("profile.view.notifications.title") || "Bildirishnomalar"}
        subtitle="Qaysi xabarnomalarni olishni tanlang"
      />

      <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mail size={19} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {t("profile.view.notifications.email") || "Elektron pochta"}
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t("profile.view.notifications.email_desc") ||
                  "Muhim xabarlarni pochtaga yuborish"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.email}
            onClick={() => {
              const updated = { ...notifications, email: !notifications.email };
              setNotifications(updated);
              saveSetting("notifications", updated);
              toast.success("Sozlama saqlandi");
            }}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative shrink-0 cursor-pointer",
              notifications.email
                ? "bg-brand-blue"
                : "bg-slate-200 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform",
                notifications.email ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone size={19} />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {t("profile.view.notifications.push") || "Push xabarnomalar"}
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t("profile.view.notifications.push_desc") ||
                  "Qurilma va Telegram orqali xabarlar"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.push}
            onClick={() => {
              const updated = { ...notifications, push: !notifications.push };
              setNotifications(updated);
              saveSetting("notifications", updated);
              toast.success("Sozlama saqlandi");
            }}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative shrink-0 cursor-pointer",
              notifications.push
                ? "bg-brand-blue"
                : "bg-slate-200 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform",
                notifications.push ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );

  // ── VIEW 6: HELP & FAQ ──
  const renderHelp = () => {
    const title = t("profile.view.help.title") || "Yordam va Qo'llanma";
    const faqs = [
      {
        q:
          t("profile.view.help.faq1.q") ||
          "Platformadan qanday foydalanaman?",
        a:
          t("profile.view.help.faq1.a") ||
          "Fanlar bo'yicha video darslarni ko'ring, Online Testlar hamda Milliy va Xalqaro imtihonlarni yeching va rasmiy sertifikat oling.",
      },
      {
        q:
          t("profile.view.help.faq2.q") ||
          "Tangalarni qanday yig'ish va ishlatish mumkin?",
        a: "Har kunlik kirish (Streak), intellektual o'yinlar (Matematika, Mantiq, Vocab) va testlardan tangalar yig'ib, Do'kon bo'limida sovg'alarga almashtirishingiz mumkin.",
      },
      {
        q:
          t("profile.view.help.faq3.q") ||
          "Tizim tilini va tungi rejimni qanday o'zgartiraman?",
        a:
          t("profile.view.help.faq3.a") ||
          "Profil sahifasidagi 'Til, Mavzu va Ovoz' bo'limidan o'zingizga qulay til, yorug'/tungi rejim va ovoz sozlamalarini tanlashingiz mumkin.",
      },
      {
        q:
          t("profile.view.help.faq4.q") ||
          "Texnik muammoga duch kelsam nima qilaman?",
        a:
          t("profile.view.help.faq4.a") ||
          "'Biz bilan aloqa' bo'limi orqali o'quv markazi admini yoki dasturchiga Telegramdan to'g'ridan-to'g'ri yozishingiz mumkin.",
      },
    ];

    return (
      <div className="w-full">
        <ViewHeader title={title} subtitle="Ko'p beriladigan savollarga javoblar" />
        <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-4 sm:p-5 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={17}
                    className={cn(
                      "text-slate-400 transition-transform shrink-0",
                      isOpen && "rotate-90 text-brand-blue"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── VIEW 7: CONTACT ──
  const renderContact = () => {
    const title = t("profile.view.contact.title") || "Biz bilan aloqa";
    const subtitle =
      t("profile.view.contact.subtitle") ||
      "Savollaringiz yoki texnik muammolar bormi? Biz doim yordamga tayyormiz!";

    const contacts = [
      {
        href: "https://t.me/promax_admin",
        external: true,
        icon: MessageSquare,
        iconStyle: "bg-brand-blue/10 text-brand-blue dark:text-blue-400",
        title:
          t("profile.view.contact.telegram_admin") ||
          "O'quv markazi va darslar bo'yicha",
        sub: "@promax_admin",
      },
      {
        href: "https://t.me/xurshidbahromov",
        external: true,
        icon: MessageSquare,
        iconStyle: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        title:
          t("profile.view.contact.telegram_tech") ||
          "Texnik muammolar (Dasturchi)",
        sub: "@xurshidbahromov",
      },
      {
        href: "tel:+998901234567",
        external: false,
        icon: Phone,
        iconStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        title: t("profile.view.contact.call_center") || "Call Center",
        sub: "+998 (90) 123-45-67",
      },
      {
        href: "mailto:support@promax.uz",
        external: false,
        icon: Mail,
        iconStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        title: t("profile.view.contact.email") || "Email yordam",
        sub: "support@promax.uz",
      },
    ];

    return (
      <div className="w-full space-y-4">
        <ViewHeader title={title} subtitle={subtitle} />

        <div className="bg-white/90 dark:bg-slate-900/90 rounded-[24px] border border-slate-200/70 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {contacts.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.sub}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3.5 p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.iconStyle}`}
                >
                  <Icon size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {item.sub}
                  </p>
                </div>
                <ExternalLink
                  size={15}
                  className="text-slate-300 dark:text-slate-600 group-hover:text-brand-blue shrink-0 transition-colors"
                />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  const variants = {
    enter: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 24 : -24,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -24 : 24,
      opacity: 0,
    }),
  };

  const renderAnimatedView = (children: React.ReactNode, key: string) => (
    <motion.div
      key={key}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-8">
      <div className="relative z-10 w-full max-w-2xl mx-auto pt-1 sm:pt-2 pb-4 overflow-x-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {activeView === "main" && renderAnimatedView(renderMain(), "main")}
          {activeView === "statistics" &&
            renderAnimatedView(renderStatistics(), "statistics")}
          {activeView === "profile" &&
            renderAnimatedView(renderProfileEdit(), "profile")}
          {activeView === "security" &&
            renderAnimatedView(renderSecurity(), "security")}
          {activeView === "themes" &&
            renderAnimatedView(renderThemes(), "themes")}
          {activeView === "notifications" &&
            renderAnimatedView(renderNotifications(), "notifications")}
          {activeView === "help" && renderAnimatedView(renderHelp(), "help")}
          {activeView === "contact" &&
            renderAnimatedView(renderContact(), "contact")}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Bottom Sheet / Modal */}
      {showLogoutConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !loggingOut) {
              setShowLogoutConfirm(false);
            }
          }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/55 backdrop-blur-[3px]"
        >
          <div className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-2" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <LogOut size={19} />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-fredoka text-slate-900 dark:text-white">
                  Hisobdan chiqasizmi?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Keyin yana login orqali kirishingiz mumkin.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {loggingOut ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <span>Ha, chiqish</span>
                )}
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
