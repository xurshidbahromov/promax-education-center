"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile, uploadAvatar, updateUserSettings, updatePassword } from "@/lib/profile";
import { createClient } from "@/utils/supabase/client";
import {
  User, Mail, Phone, MapPin, Camera, Save, Shield, Key, ArrowLeft, Loader2,
  Settings, Bell, Palette, HelpCircle, ChevronRight, Moon, Sun, Languages,
  Smartphone, MessageSquare, LogOut, TrendingUp
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCurrentUser, useDashboardStats, useFullUserProfile } from "@/hooks/useDashboardData";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ProgressChart from "@/components/dashboard/ProgressChart";

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [activeView, _setActiveView] = useState<'main' | 'profile' | 'security' | 'notifications' | 'themes' | 'help' | 'contact' | 'statistics'>('main');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const setActiveView = (view: typeof activeView) => {
    if (view === 'main') {
      setDirection('backward');
    } else {
      setDirection('forward');
    }
    _setActiveView(view);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Data hooks
  const { data: user } = useCurrentUser();
  const { data: dashboardStats } = useDashboardStats(user?.id);
  const { data: profile, isLoading: isProfileLoading } = useFullUserProfile(user?.id);

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
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true
  });

  // Initialize data
  useEffect(() => {
    if (profile) {
      const [firstName = "", lastName = ""] = (profile.full_name || "").split(" ");
      setAvatarUrl(profile.avatar_url || null);
      setFormData({
        firstName,
        lastName,
        phone: profile.phone || "",
      });
      if (profile.settings?.notifications) {
        setNotifications(profile.settings.notifications);
      }
    }
  }, [profile]);

  // Handlers
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const url = await uploadAvatar(file);
    if (url) {
      const { success } = await updateUserProfile({ avatar_url: url });
      if (success) {
        setAvatarUrl(url);
        toast.success(t("profile.success_update") || "Rasm muvaffaqiyatli yuklandi");
      } else {
        toast.error(t("profile.error_update") || "Rasmni saqlashda xatolik");
      }
    } else {
      toast.error(t("profile.error_update") || "Rasmni yuklashda xatolik");
    }
    setIsUploadingAvatar(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const result = await updateUserProfile({
        full_name: fullName,
        phone: formData.phone,
      });

      if (result.success) {
        toast.success(t("profile.success_update") || "Saqlandi");
        setActiveView('main');
      } else {
        toast.error(t("profile.error_update") || "Xatolik yuz berdi");
      }
    } catch (error) {
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
        toast.success("Parol muvaffaqiyatli o'zgartirildi");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setActiveView('main');
      } else {
        toast.error("Parolni o'zgartirishda xatolik yuz berdi");
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setChangingPassword(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    if (!user) return;
    const newSettings = {
      theme: key === 'theme' ? value : theme,
      language: key === 'language' ? value : language,
      notifications: key === 'notifications' ? value : notifications
    };
    await updateUserSettings(newSettings);
  };

  // Components
  const ViewHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <button onClick={() => setActiveView('main')} className="p-2.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
      </button>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-fredoka tracking-wide">{title}</h2>
    </div>
  );

  const MenuButton = ({ icon: Icon, title, description, onClick }: any) => (
    <button onClick={onClick} className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm border border-white/60 dark:border-slate-700/50 hover:shadow-md hover:-translate-y-0.5 hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all duration-300 group">
      <div className="w-10 h-10 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-all duration-300">
        <Icon size={26} className="stroke-[2.5px]" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">{title}</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{description}</p>
      </div>
      <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-brand-blue transition-all" />
    </button>
  );

  // Views
  const renderMain = () => (
    <div className="flex flex-col items-center">
      {/* Top Header / Avatar */}
      <div className="relative w-full flex flex-col items-center pt-2 pb-8">
        <div className="relative w-[110px] h-[110px] rounded-[2rem] shadow-lg border-[3px] border-white/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-center overflow-hidden mb-4 group transition-transform hover:scale-105">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <User size={48} className="text-brand-blue/50 dark:text-slate-500" />
          )}
          <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-white mb-1" />
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">O'zgartirish</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
          )}
        </div>
        <h2 className="text-[24px] font-bold text-slate-800 dark:text-slate-100 font-fredoka tracking-wide">
          {profile?.full_name || "O'quvchi"}
        </h2>
      </div>

      {/* Menu List */}
      <div className="w-full space-y-3">
        <MenuButton 
          icon={TrendingUp} title={t('profile.menu.statistics') === 'profile.menu.statistics' ? "Statistika" : t('profile.menu.statistics')} description={t('profile.menu.statistics_desc') === 'profile.menu.statistics_desc' ? "O'zlashtirish statistikasini ko'rish" : t('profile.menu.statistics_desc')} 
          onClick={() => setActiveView('statistics')} 
        />
        <MenuButton 
          icon={Settings} title={t('profile.menu.settings') || "Sozlamalar"} description={t('profile.menu.settings_desc') || "Shaxsiy ma'lumotlarni o'zgartirish"} 
          onClick={() => setActiveView('profile')} 
        />
        <MenuButton 
          icon={Shield} title={t('profile.menu.parental') || "Xavfsizlik"} description={t('profile.menu.parental_desc') || "Parol va xavfsizlik sozlamalari"} 
          onClick={() => setActiveView('security')} 
        />
        <MenuButton 
          icon={Bell} title={t('profile.menu.notifications') || "Bildirishnomalar"} description={t('profile.menu.notifications_desc') || "Xabarnomalarni boshqarish"} 
          onClick={() => setActiveView('notifications')} 
        />
        <MenuButton 
          icon={Palette} title={t('profile.menu.themes') || "Tizim tili va Mavzu"} description={t('profile.menu.themes_desc') || "Tashqi ko'rinishni o'zgartirish"} 
          onClick={() => setActiveView('themes')} 
        />
        <MenuButton 
          icon={HelpCircle} title={t('profile.menu.help') || "Yordam va Qo'llanma"} description={t('profile.menu.help_desc') || "Ko'p beriladigan savollar"} 
          onClick={() => setActiveView('help')} 
        />
        <MenuButton 
          icon={Mail} title={t('profile.menu.contact') || "Biz bilan aloqa"} description={t('profile.menu.contact_desc') || "Taklif va muammolar uchun"} 
          onClick={() => setActiveView('contact')} 
        />
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-500/5 dark:bg-red-500/5 backdrop-blur-xl rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm border border-red-500/10 dark:border-red-500/20 hover:shadow-md hover:border-red-500/30 dark:hover:border-red-500/40 hover:-translate-y-0.5 transition-all duration-300 group mt-4"
        >
          <div className="w-10 h-10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <LogOut size={26} className="stroke-[2.5px]" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-red-600 dark:text-red-400 text-[15px]">
              {t('profile.menu.logout') || "Chiqish"}
            </h3>
            <p className="text-[13px] text-red-500/70 dark:text-red-400/60 mt-0.5 font-medium">
              {t('profile.menu.logout_desc') || "Tizimdan chiqish"}
            </p>
          </div>
          <ChevronRight size={20} className="text-red-300 dark:text-red-700 group-hover:translate-x-1 group-hover:text-red-500 transition-transform" />
        </button>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="w-full pt-2 pb-10 space-y-6">
      <ViewHeader title={t('profile.menu.statistics') === 'profile.menu.statistics' ? "Statistika" : t('profile.menu.statistics')} />
      <div className="space-y-6">
        <StatsGrid userId={user?.id} />
        <ProgressChart userId={user?.id} />
      </div>
    </div>
  );

  const renderProfileEdit = () => (
    <div className="w-full pt-2">
      <ViewHeader title={t('profile.view.settings.title') || "Shaxsiy ma'lumotlar"} />
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t('profile.view.settings.first_name') || "Ism"}</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:text-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t('profile.view.settings.last_name') || "Familiya"}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:text-slate-100 font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t('profile.view.settings.phone') || "Telefon raqam"}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:text-slate-100 font-medium"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingProfile}
          className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-blue-600 hover:shadow-lg hover:-translate-y-0.5 text-white rounded-xl font-bold text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {t('profile.view.settings.save') || "Saqlash"}
        </button>
      </form>
    </div>
  );

  const renderSecurity = () => (
    <div className="w-full pt-2">
      <ViewHeader title={t('profile.view.security.title') || "Xavfsizlik"} />
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t('profile.view.security.new_password') || "Yangi parol"}</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:text-slate-100 font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t('profile.view.security.confirm_password') || "Yangi parolni tasdiqlang"}</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all dark:text-slate-100 font-medium"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={changingPassword}
          className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-blue-600 hover:shadow-lg hover:-translate-y-0.5 text-white rounded-xl font-bold text-[15px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {changingPassword ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
          {t('profile.view.security.button') || "Parolni o'zgartirish"}
        </button>
      </form>
    </div>
  );

  const renderThemes = () => (
    <div className="w-full pt-2">
      <ViewHeader title={t('profile.view.themes.title') || "Tizim tili va Mavzu"} />
      
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-6">
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-4">{t('profile.view.themes.select_theme') || "Mavzuni tanlang"}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setTheme('light'); saveSetting('theme', 'light'); }}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-5 rounded-[1.25rem] border-2 transition-all bg-white/50 dark:bg-slate-800/50 hover:-translate-y-0.5",
                  theme === 'light' ? "border-brand-blue bg-blue-50/50 dark:bg-slate-800 shadow-md" : "border-gray-200/50 dark:border-slate-700/50 hover:border-brand-blue/30 shadow-sm"
                )}
              >
                <div className="transition-all duration-300">
                  <Sun size={32} className={theme === 'light' ? "text-brand-blue" : "text-slate-400"} />
                </div>
                <span className={cn("font-bold text-[14px]", theme === 'light' ? "text-brand-blue" : "text-slate-600 dark:text-slate-400")}>{t('profile.view.themes.light') || "Yorug'"}</span>
              </button>
              <button
                onClick={() => { setTheme('dark'); saveSetting('theme', 'dark'); }}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-5 rounded-[1.25rem] border-2 transition-all bg-white/50 dark:bg-slate-800/50 hover:-translate-y-0.5",
                  theme === 'dark' ? "border-brand-blue bg-blue-50/50 dark:bg-slate-800 shadow-md" : "border-gray-200/50 dark:border-slate-700/50 hover:border-brand-blue/30 shadow-sm"
                )}
              >
                <div className="transition-all duration-300">
                  <Moon size={32} className={theme === 'dark' ? "text-brand-blue" : "text-slate-400"} />
                </div>
                <span className={cn("font-bold text-[14px]", theme === 'dark' ? "text-brand-blue" : "text-slate-600 dark:text-slate-400")}>{t('profile.view.themes.dark') || "Tungi"}</span>
              </button>
            </div>
          </div>
          <div className="h-px bg-slate-200/50 dark:bg-slate-700/50" />
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-4">{t('profile.view.themes.select_lang') || "Tilni tanlang"}</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['UZ', 'RU', 'EN'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLanguage(l); saveSetting('language', l); }}
                  className={cn(
                    "py-3 rounded-xl border-2 font-bold text-[14px] transition-all bg-white/50 dark:bg-slate-800/50",
                    language === l 
                    ? "border-brand-blue bg-brand-blue/5 text-brand-blue shadow-sm" 
                    : "border-gray-200/50 dark:border-slate-700/50 text-slate-500 hover:border-brand-blue/30"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="w-full pt-2">
      <ViewHeader title={t('profile.view.notifications.title') || "Bildirishnomalar"} />
      
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-6">
        {/* Email Notifications */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-brand-blue">
                <Mail size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">{t('profile.view.notifications.email') || "Elektron pochta"}</h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">{t('profile.view.notifications.email_desc') || "Muhim xabarlarni pochtaga yuborish"}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const newVal = !notifications.email;
                setNotifications({...notifications, email: newVal});
                saveSetting('notifications', {...notifications, email: newVal});
              }}
              className={cn("w-14 h-7 rounded-full transition-colors relative shadow-inner", notifications.email ? "bg-brand-blue" : "bg-slate-200 dark:bg-slate-700")}
            >
              <div className={cn("absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm", notifications.email ? "translate-x-7" : "translate-x-0")} />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-brand-blue">
                <Smartphone size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100">{t('profile.view.notifications.push') || "Push xabarnomalar"}</h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">{t('profile.view.notifications.push_desc') || "Brauzer va qurilmada bildirishnoma olish"}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const newVal = !notifications.push;
                setNotifications({...notifications, push: newVal});
                saveSetting('notifications', {...notifications, push: newVal});
              }}
              className={cn("w-14 h-7 rounded-full transition-colors relative shadow-inner", notifications.push ? "bg-brand-blue" : "bg-slate-200 dark:bg-slate-700")}
            >
              <div className={cn("absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm", notifications.push ? "translate-x-7" : "translate-x-0")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelp = () => {
    const title = t('profile.view.help.title') || "Yordam va Qo'llanma";
    const faqs = [
      { q: t('profile.view.help.faq1.q') || "Platformadan qanday foydalanaman?", a: t('profile.view.help.faq1.a') || "Siz fanlar bo'yicha video darslarni ko'rishingiz, testlar ishlashingiz va natijalaringizni tahlil qilishingiz mumkin." },
      { q: t('profile.view.help.faq2.q') || "Natijalarimni qayerdan ko'raman?", a: t('profile.view.help.faq2.a') || "'Natijalar' bo'limiga o'tib, ishlagan barcha testlaringizning batafsil tahlili bilan tanishishingiz mumkin." },
      { q: t('profile.view.help.faq3.q') || "Tizim tilini qanday o'zgartiraman?", a: t('profile.view.help.faq3.a') || "Profil sahifasidagi 'Tizim tili va Mavzu' qismidan o'zingizga qulay tilni tanlashingiz mumkin." },
      { q: t('profile.view.help.faq4.q') || "Muammoga duch kelsam nima qilishim kerak?", a: t('profile.view.help.faq4.a') || "Agar qandaydir texnik muammo yuzaga kelsa, 'Biz bilan aloqa' bo'limi orqali adminlar bilan bog'laning." }
    ];

    return (
      <div className="w-full pt-2">
        <ViewHeader title={title} />
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-6 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100/50 dark:border-slate-700/50 hover:shadow-sm transition-all cursor-pointer">
              <summary className="flex items-center justify-between text-[15px] font-bold text-slate-800 dark:text-slate-100 cursor-pointer outline-none">
                <span>{faq.q}</span>
                <ChevronRight size={18} className="transform group-open:rotate-90 transition-transform text-slate-400" />
              </summary>
              <p className="mt-3 text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 select-none">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    );
  };

  const renderContact = () => {
    const title = t('profile.view.contact.title') || "Biz bilan aloqa";
    const subtitle = t('profile.view.contact.subtitle') || "Savollaringiz yoki texnik muammolar bormi? Biz doim yordamga tayyormiz!";
    
    return (
      <div className="w-full pt-2">
        <ViewHeader title={title} />
        <div className="mt-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-8 shadow-sm border border-white/60 dark:border-slate-700/50 text-center space-y-3 mb-6">
            <div className="text-brand-blue flex items-center justify-center mx-auto mb-2 transition-all duration-300">
              <MessageSquare size={40} strokeWidth={2} />
            </div>
            <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <a 
              href="https://t.me/promax_admin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 hover:border-brand-blue/30 dark:hover:border-brand-blue/30 hover:shadow-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <MessageSquare size={26} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">
                  {t('profile.view.contact.telegram_admin') || "O'quv markazi va darslar bo'yicha"}
                </h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">@promax_admin (Admin)</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 group-hover:text-brand-blue transition-all" />
            </a>

            <a 
              href="https://t.me/xurshidbahromov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 hover:border-purple-500/30 dark:hover:border-purple-500/30 hover:shadow-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <MessageSquare size={26} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                  {t('profile.view.contact.telegram_tech') || "Texnik muammolar (Dasturchi)"}
                </h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">@xurshidbahromov (Developer)</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
            </a>

            <a 
              href="tel:+998901234567" 
              className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 hover:border-green-500/30 dark:hover:border-green-500/30 hover:shadow-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 text-green-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Phone size={26} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-green-600 transition-colors">
                  {t('profile.view.contact.call_center') || "Call Center"}
                </h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">+998 (90) 123-45-67</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 group-hover:text-green-600 transition-all" />
            </a>

            <a 
              href="mailto:support@promax.uz" 
              className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 hover:border-orange-500/30 dark:hover:border-orange-500/30 hover:shadow-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Mail size={26} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[15px] text-slate-800 dark:text-slate-100 group-hover:text-orange-600 transition-colors">
                  {t('profile.view.contact.email') || "Email yordam"}
                </h4>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">support@promax.uz</p>
              </div>
              <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 group-hover:text-orange-600 transition-all" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  const variants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -30 : 30,
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
      transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto pt-4 sm:pt-6 pb-10 overflow-x-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {activeView === 'main' && renderAnimatedView(renderMain(), 'main')}
          {activeView === 'statistics' && renderAnimatedView(renderStatistics(), 'statistics')}
          {activeView === 'profile' && renderAnimatedView(renderProfileEdit(), 'profile')}
          {activeView === 'security' && renderAnimatedView(renderSecurity(), 'security')}
          {activeView === 'themes' && renderAnimatedView(renderThemes(), 'themes')}
          {activeView === 'notifications' && renderAnimatedView(renderNotifications(), 'notifications')}
          {activeView === 'help' && renderAnimatedView(renderHelp(), 'help')}
          {activeView === 'contact' && renderAnimatedView(renderContact(), 'contact')}
        </AnimatePresence>
      </div>
    </div>
  );
}
