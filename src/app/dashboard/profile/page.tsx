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
 <div className="flex items-center gap-4 mb-6 px-2">
 <button onClick={() => setActiveView('main')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
 <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
 </button>
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 font-fredoka">{title}</h2>
 </div>
 );

 const MenuButton = ({ icon: Icon, title, description, onClick }: any) => (
 <button onClick={onClick} className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-4 flex items-center gap-4 shadow-sm border border-gray-200/50 dark:border-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
 <div className="w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
 <Icon size={24} className="stroke-[2.5px]" />
 </div>
 <div className="flex-1 text-left">
 <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[16px]">{title}</h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
 </div>
 <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
 </button>
 );

 // Views
 const renderMain = () => (
 <div className="flex flex-col items-center">
 {/* Top Header / Avatar */}
 <div className="relative w-full flex flex-col items-center pt-6 pb-8">
 <div className="relative w-[100px] h-[100px] rounded-full shadow-lg border-4 border-white/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-center overflow-hidden mb-4">
 {avatarUrl ? (
 <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
 ) : (
 <User size={48} className="text-brand-blue/50 dark:text-slate-500" />
 )}
 <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 inset-x-0 h-8 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors">
 <Camera size={16} className="text-white" />
 </button>
 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
 {isUploadingAvatar && (
 <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
 </div>
 )}
 </div>
 <h2 className="text-[22px] font-medium text-slate-800 dark:text-slate-100 font-fredoka">
 {profile?.full_name || "O'quvchi"}
 </h2>

 </div>

 {/* Menu List */}
 <div className="w-full px-2 sm:px-0 space-y-3 mt-2">
 <MenuButton 
 icon={TrendingUp} title={t('profile.menu.statistics') === 'profile.menu.statistics' ? "Statistika" : t('profile.menu.statistics')} description={t('profile.menu.statistics_desc') === 'profile.menu.statistics_desc' ? "O'zlashtirish statistikasini ko'rish" : t('profile.menu.statistics_desc')} 
 onClick={() => setActiveView('statistics')} 
 />
 <MenuButton 
 icon={Settings} title={t('profile.menu.settings') || "Settings"} description={t('profile.menu.settings_desc') || "Customize your experience"} 
 onClick={() => setActiveView('profile')} 
 />
 <MenuButton 
 icon={Shield} title={t('profile.menu.parental') || "Security"} description={t('profile.menu.parental_desc') || "Safety and privacy settings"} 
 onClick={() => setActiveView('security')} 
 />
 <MenuButton 
 icon={Bell} title={t('profile.menu.notifications') || "Notifications"} description={t('profile.menu.notifications_desc') || "Manage your alerts"} 
 onClick={() => setActiveView('notifications')} 
 />
 <MenuButton 
 icon={Palette} title={t('profile.menu.themes') || "Themes & Language"} description={t('profile.menu.themes_desc') || "Change app appearance"} 
 onClick={() => setActiveView('themes')} 
 />
 <MenuButton 
 icon={HelpCircle} title={t('profile.menu.help') || "Help and Support"} description={t('profile.menu.help_desc') || "Frequently asked questions"} 
 onClick={() => setActiveView('help')} 
 />
 <MenuButton 
 icon={Mail} title={t('profile.menu.contact') || "Contact Us"} description={t('profile.menu.contact_desc') || "Send us a message"} 
 onClick={() => setActiveView('contact')} 
 />
 <button 
  onClick={handleLogout} 
  className="w-full bg-red-500/5 dark:bg-red-500/5 backdrop-blur-xl rounded-[28px] p-4 flex items-center gap-4 shadow-sm border border-red-500/10 dark:border-red-500/20 hover:shadow-md hover:border-red-500/30 dark:hover:border-red-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
  >
  <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
  <LogOut size={24} className="stroke-[2.5px]" />
  </div>
  <div className="flex-1 text-left">
  <h3 className="font-semibold text-red-600 dark:text-red-400 text-[16px]">
  {t('profile.menu.logout') || "Chiqish"}
  </h3>
  <p className="text-sm text-red-500/70 dark:text-red-400/60 mt-0.5">
  {t('profile.menu.logout_desc') || "Tizimdan chiqish"}
  </p>
  </div>
  <ChevronRight size={20} className="text-red-300 dark:text-red-700 group-hover:translate-x-1 transition-transform" />
  </button>
 </div>
 </div>
 );

  const renderStatistics = () => (
    <div className="w-full px-2 sm:px-0 pt-4 pb-10 space-y-6">
      <ViewHeader title={t('profile.menu.statistics') === 'profile.menu.statistics' ? "Statistika" : t('profile.menu.statistics')} />
      <div className="space-y-6">
        <StatsGrid userId={user?.id} />
        <ProgressChart userId={user?.id} />
      </div>
    </div>
  );

 const renderProfileEdit = () => (
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={t('profile.view.settings.title') || "Personal Information"} />
 <form onSubmit={handleProfileSubmit} className="space-y-6">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 space-y-5">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.view.settings.first_name') || "First Name"}</label>
 <input
 type="text"
 value={formData.firstName}
 onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-blue/20 transition-all dark:text-slate-100"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.view.settings.last_name') || "Last Name"}</label>
 <input
 type="text"
 value={formData.lastName}
 onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-blue/20 transition-all dark:text-slate-100"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.view.settings.phone') || "Phone Number"}</label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-blue/20 transition-all dark:text-slate-100"
 />
 </div>
 </div>
 <button
 type="submit"
 disabled={savingProfile}
 className="w-full py-4 bg-brand-blue hover:bg-blue-600 text-white rounded-2xl font-medium transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
 {t('profile.view.settings.save') || "Save"}
 </button>
 </form>
 </div>
 );

 const renderSecurity = () => (
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={t('profile.view.security.title') || "Security"} />
 <form onSubmit={handlePasswordSubmit} className="space-y-6">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 space-y-5">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.view.security.new_password') || "New Password"}</label>
 <input
 type="password"
 value={passwordData.newPassword}
 onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-blue/20 transition-all dark:text-slate-100"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('profile.view.security.confirm_password') || "Confirm New Password"}</label>
 <input
 type="password"
 value={passwordData.confirmPassword}
 onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
 className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-blue/20 transition-all dark:text-slate-100"
 />
 </div>
 </div>
 <button
 type="submit"
 disabled={changingPassword}
 className="w-full py-4 bg-brand-blue hover:bg-blue-600 text-white rounded-2xl font-medium transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {changingPassword ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
 {t('profile.view.security.button') || "Change Password"}
 </button>
 </form>
 </div>
 );

 const renderThemes = () => (
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={t('profile.view.themes.title') || "Themes & Language"} />
 
 <div className="space-y-6">
 {/* Theme Selection */}
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 space-y-6">
 <div>
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{t('profile.view.themes.select_theme') || "Select Theme"}</h3>
 <div className="grid grid-cols-2 gap-4">
 <button
 onClick={() => { setTheme('light'); saveSetting('theme', 'light'); }}
 className={cn(
 "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
 theme === 'light' ? "border-brand-blue bg-blue-50/50 dark:bg-slate-800" : "border-gray-100 dark:border-slate-800 hover:border-brand-blue/30"
 )}
 >
 <Sun size={32} className={theme === 'light' ? "text-brand-blue" : "text-slate-400"} />
 <span className={cn("font-medium", theme === 'light' ? "text-brand-blue" : "text-slate-600 dark:text-slate-400")}>{t('profile.view.themes.light') || "Light"}</span>
 </button>
 <button
 onClick={() => { setTheme('dark'); saveSetting('theme', 'dark'); }}
 className={cn(
 "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
 theme === 'dark' ? "border-brand-blue bg-blue-50/50 dark:bg-slate-800" : "border-gray-100 dark:border-slate-800 hover:border-brand-blue/30"
 )}
 >
 <Moon size={32} className={theme === 'dark' ? "text-brand-blue" : "text-slate-400"} />
 <span className={cn("font-medium", theme === 'dark' ? "text-brand-blue" : "text-slate-600 dark:text-slate-400")}>{t('profile.view.themes.dark') || "Dark"}</span>
 </button>
 </div>
 </div>
 <div className="h-px bg-gray-100 dark:bg-slate-800" />
 <div>
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{t('profile.view.themes.select_lang') || "Select Language"}</h3>
 <div className="grid grid-cols-3 gap-3">
 {(['UZ', 'RU', 'EN'] as const).map((l) => (
 <button
 key={l}
 onClick={() => { setLanguage(l); saveSetting('language', l); }}
 className={cn(
 "py-3 rounded-2xl border-2 font-medium transition-all",
 language === l 
 ? "border-brand-blue bg-blue-50 dark:bg-brand-blue/10 text-brand-blue" 
 : "border-gray-100 dark:border-slate-800 text-slate-500 hover:border-brand-blue/30"
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
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={t('profile.view.notifications.title') || "Notifications"} />
 
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 space-y-6">
 {/* Email Notifications */}
 <div className="flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue">
 <Mail size={20} />
 </div>
 <div>
 <h4 className="font-semibold text-slate-800 dark:text-slate-100">{t('profile.view.notifications.email') || "Email Notifications"}</h4>
 <p className="text-sm text-slate-500">{t('profile.view.notifications.email_desc') || "Receive news and updates via email"}</p>
 </div>
 </div>
 <button 
 onClick={() => {
 const newVal = !notifications.email;
 setNotifications({...notifications, email: newVal});
 saveSetting('notifications', {...notifications, email: newVal});
 }}
 className={cn("w-12 h-6 rounded-full transition-colors relative", notifications.email ? "bg-brand-blue" : "bg-gray-200 dark:bg-slate-700")}
 >
 <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", notifications.email ? "translate-x-6" : "translate-x-0")} />
 </button>
 </div>
 <div className="h-px bg-gray-100 dark:bg-slate-800" />
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-brand-blue">
 <Smartphone size={20} />
 </div>
 <div>
 <h4 className="font-semibold text-slate-800 dark:text-slate-100">{t('profile.view.notifications.push') || "Push Notifications"}</h4>
 <p className="text-sm text-slate-500">{t('profile.view.notifications.push_desc') || "Alerts on your mobile device"}</p>
 </div>
 </div>
 <button 
 onClick={() => {
 const newVal = !notifications.push;
 setNotifications({...notifications, push: newVal});
 saveSetting('notifications', {...notifications, push: newVal});
 }}
 className={cn("w-12 h-6 rounded-full transition-colors relative", notifications.push ? "bg-brand-blue" : "bg-gray-200 dark:bg-slate-700")}
 >
 <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", notifications.push ? "translate-x-6" : "translate-x-0")} />
 </button>
 </div>
 </div>
 </div>
 </div>
 );

 const renderHelp = () => {
 const title = t('profile.view.help.title') || "Help & Support";
 const faqs = [
 { q: t('profile.view.help.faq1.q') || "How do I use the platform?", a: t('profile.view.help.faq1.a') || "You can watch video lessons for various subjects, take online practice tests, and analyze your performance in real-time." },
 { q: t('profile.view.help.faq2.q') || "Where can I see my results?", a: t('profile.view.help.faq2.a') || "Go to the 'Results' tab in the dashboard to see detailed feedback, analytics, and scores of your completed tests." },
 { q: t('profile.view.help.faq3.q') || "How do I change the theme or language?", a: t('profile.view.help.faq3.a') || "Navigate to the 'Themes' section in your profile to choose between Light/Dark mode and set your preferred language." },
 { q: t('profile.view.help.faq4.q') || "What should I do if I encounter an issue?", a: t('profile.view.help.faq4.a') || "If you run into any technical difficulties, please contact us directly via the 'Contact Us' page." }
 ];

 return (
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={title} />
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 space-y-4">
 {faqs.map((faq, idx) => (
 <details key={idx} className="group border-b border-gray-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0 cursor-pointer">
 <summary className="flex items-center justify-between text-base font-medium text-slate-800 dark:text-slate-100 py-1 cursor-pointer">
 <span>{faq.q}</span>
 <ChevronRight size={18} className="transform group-open:rotate-90 transition-transform text-slate-400" />
 </summary>
 <p className="mt-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 select-none">
 {faq.a}
 </p>
 </details>
 ))}
 </div>
 </div>
 );
 };

 const renderContact = () => {
 const title = t('profile.view.contact.title') || "Contact Us";
 const subtitle = t('profile.view.contact.subtitle') || "Have questions or technical issues? We are here to help!";
 
 return (
 <div className="w-full px-2 sm:px-0 pt-4">
 <ViewHeader title={title} />
 <div className="mt-6">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 shadow-sm border border-gray-200/50 dark:border-slate-800/50 text-center space-y-2">
 <MessageSquare className="w-8 h-8 text-brand-blue mx-auto mb-2" />
 <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
 {subtitle}
 </p>
 </div>

 <div className="grid grid-cols-1 gap-3 mt-6">
 <a 
 href="https://t.me/promax_admin" 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex items-center gap-4 p-5 rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 hover:border-brand-blue/30 transition-all group"
 >
 <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-brand-blue/10 flex items-center justify-center text-brand-blue">
 <MessageSquare size={24} />
 </div>
 <div className="text-left">
 <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">
 {t('profile.view.contact.telegram_admin') || "O'quv markazi va darslar bo'yicha"}
 </h4>
 <p className="text-[13px] text-slate-500">@promax_admin (Admin)</p>
 </div>
 <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
 </a>

 <a 
 href="https://t.me/xurshidbahromov" 
 target="_blank" 
 rel="noopener noreferrer"
 className="flex items-center gap-4 p-5 rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 hover:border-brand-blue/30 transition-all group"
 >
 <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/10 flex items-center justify-center text-purple-600">
 <MessageSquare size={24} />
 </div>
 <div className="text-left">
 <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
 {t('profile.view.contact.telegram_tech') || "Texnik muammolar (Dasturchi)"}
 </h4>
 <p className="text-[13px] text-slate-500">@xurshidbahromov (Developer)</p>
 </div>
 <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
 </a>

 <a 
 href="tel:+998901234567" 
 className="flex items-center gap-4 p-5 rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 hover:border-brand-blue/30 transition-all group"
 >
 <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/10 flex items-center justify-center text-green-600">
 <Phone size={24} />
 </div>
 <div className="text-left">
 <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-green-600 transition-colors">
 {t('profile.view.contact.call_center') || "Call Center"}
 </h4>
 <p className="text-[13px] text-slate-500">+998 (90) 123-45-67</p>
 </div>
 <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
 </a>

 <a 
 href="mailto:support@promax.uz" 
 className="flex items-center gap-4 p-5 rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 hover:border-brand-blue/30 transition-all group"
 >
 <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/10 flex items-center justify-center text-orange-600">
 <Mail size={24} />
 </div>
 <div className="text-left">
 <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-orange-600 transition-colors">
 {t('profile.view.contact.email') || "Email Support"}
 </h4>
 <p className="text-[13px] text-slate-500">support@promax.uz</p>
 </div>
 <ChevronRight size={18} className="ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
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
      x: dir === 'forward' ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -120 : 120,
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
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="max-w-md mx-auto pt-8 sm:pt-12 pb-10 overflow-x-hidden relative min-h-[400px]">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
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
  );
}
