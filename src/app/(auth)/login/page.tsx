"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { getUserRole, getRedirectPath } from '@/lib/auth-helpers';
import { Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, GraduationCap, Users, Link2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TelegramLoginWidget, { TelegramAuthPayload } from '@/components/auth/TelegramLoginWidget';

export default function LoginPage() {
 const { t } = useLanguage();
 const router = useRouter();
 const supabase = createClient();

 const [step, setStep] = useState<'role' | 'form' | 'link'>('role'); // Two-step flow + linking
 const [loginAs, setLoginAs] = useState<'student' | 'staff' | null>(null);
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [showForgotPassword, setShowForgotPassword] = useState(false);

 // Linking state
 const [linkingUser, setLinkingUser] = useState<TelegramUser | null>(null);
 const [linkPhone, setLinkPhone] = useState('');
 const [linkPassword, setLinkPassword] = useState('');
 const [showLinkPassword, setShowLinkPassword] = useState(false);

 // Phone number formatting
 const formatPhoneNumber = (value: string) => {
 const cleaned = value.replace(/\D/g, '');
 if (cleaned.length === 0) return '';

 let digits = cleaned;
 if (!cleaned.startsWith('998')) {
 digits = '998' + cleaned;
 }
 digits = digits.slice(0, 12);

 let formatted = '+998';
 if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
 if (digits.length > 5) formatted += ' ' + digits.slice(5, 8);
 if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
 if (digits.length > 10) formatted += ' ' + digits.slice(10, 12);

 return formatted;
 };

 const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const formatted = formatPhoneNumber(e.target.value);
 setPhone(formatted);
 };

 const handleRoleSelect = (role: 'student' | 'staff') => {
 setLoginAs(role);
 setTimeout(() => {
 setStep('form'); // Move to form step after a tiny delay to allow press animation to be felt
 }, 150);
 };

 const handleBack = () => {
    if (step === 'link') {
      setStep('role');
      setLinkingUser(null);
    } else {
      setStep('role');
      setLoginAs(null);
    }
 };

 const handleTelegramAuth = async (user: TelegramAuthPayload) => {
    try {
      setLoading(true);
      const res = await fetch('/api/telegram/widget-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      
      if (data.linked && !data.needsPassword) {
        // Logged in successfully via deterministic auth
        toast.success("Telegram orqali muvaffaqiyatli kirdingiz");
        router.push(data.profile?.role === 'student' ? '/dashboard' : '/dashboard');
      } else if (data.linked && data.needsPassword) {
        // Linked but needs password
        setLinkingUser(user);
        setLinkPhone(data.phone || '');
        setStep('link');
      } else {
        // Not linked, prompt to link
        setLinkingUser(user);
        setStep('link');
      }
    } catch (err) {
      toast.error('Telegram orqali kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
 };

 const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingUser || !linkPhone) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/telegram/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: linkPhone,
          password: linkPassword,
          telegramUser: linkingUser
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.needsPassword) {
          toast.error("Bu raqam band. Iltimos, parolingizni kiriting!");
          return;
        }
        if (data.wrongPassword) {
          toast.error("Parol noto'g'ri. Qaytadan urinib ko'ring.");
          return;
        }
        throw new Error(data.error || "Xatolik yuz berdi");
      }
      
      toast.success(data.created ? "Yangi hisob yaratildi va Telegram ulandi" : "Hisobingiz Telegram bilan bog'landi");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
 };

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 // Auto-generate email from phone for login
 const cleanPhone = phone.replace(/\D/g, '');
 const generatedEmail = `${cleanPhone}@promax.uz`;

 try {
 const { data, error } = await supabase.auth.signInWithPassword({
 email: generatedEmail,
 password,
 });

 if (error) throw error;

 if (!data.user) {
 throw new Error('Login failed');
 }

 // Get user's actual role from database
 const userRole = await getUserRole(data.user.id);

 if (!userRole) {
 throw new Error('Could not determine user role');
 }

 // Validate login type matches user role
 if (loginAs === 'staff' && userRole === 'student') {
 toast.error(t('auth.error_wrong_portal') || 'Please use student login portal');
 await supabase.auth.signOut();
 return;
 }

 if (loginAs === 'student' && ['teacher', 'staff', 'admin'].includes(userRole)) {
 toast.error(t('auth.error_wrong_portal') || 'Please use teacher/staff login portal');
 await supabase.auth.signOut();
 return;
 }

 toast.success(t('auth.login_success') || 'Muvaffaqiyatli kirdingiz');
 // Redirect based on role
 const redirectPath = getRedirectPath(userRole);
 router.push(redirectPath);
 } catch (err: any) {
 console.error('Login error:', err);
 // Use translation for common errors
 if (err.message.includes('Invalid login credentials')) {
 toast.error(t('auth.error_invalid_credentials') || "Telefon raqam yoki parol noto'g'ri");
 } else if (err.message.includes('Email not confirmed')) {
 toast.error(t('auth.error_email_not_confirmed') || "Email tasdiqlanmagan");
 } else {
 toast.error(err.message || t('auth.error_login_failed') || "Tizimga kirishda xatolik yuz berdi");
 }
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex bg-gray-50 dark:bg-slate-800/80 backdrop-blur-sm">
 {/* Left Side - Info/Branding (Hidden on mobile) */}
 <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-blue dark:bg-slate-800/80 backdrop-blur-sm items-start justify-center pt-20 p-12 text-white">
 {/* Background Elements */}
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
 <motion.div 
 animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0], x: [0, 30, 0] }}
 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
 className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-3xl"
 />
 <motion.div 
 animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0], x: [0, -30, 0] }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-brand-orange/20 rounded-full blur-3xl"
 />
 </div>

 <div className="relative z-10 max-w-lg space-y-12">
 <Link href="/" className="inline-block group">
 <div className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8">
 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
 <span>{t('auth.back_to_home')}</span>
 </div>
 </Link>

 <div className="w-24 h-24 relative mb-6">
 <Image
 src="/logo.png"
 alt="Promax Logo"
 fill
 sizes="96px"
 className="object-contain filter brightness-0 invert"
 />
 </div>

 <h1 className="text-5xl font-medium leading-tight font-fredoka">
 Xush kelibsiz
 </h1>
 <p className="text-xl text-blue-100/90 leading-relaxed">
 O'quv platformangizga kiring va darslarni davom ettiring.
 </p>

 <div className="mt-12 bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 border-l-4 border-l-brand-orange">
 <p className="text-lg italic text-blue-50">{t('quote.education')}</p>
 </div>
 </div>
 </div>

 {/* Right Side - Form */}
 <div className="w-full lg:w-1/2 h-screen overflow-y-auto relative bg-transparent flex flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
          <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] opacity-60 transition-colors duration-700 ${loginAs === 'student' ? 'bg-blue-300' : loginAs === 'staff' ? 'bg-orange-300' : 'bg-blue-200'}`} />
          <div className={`absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] opacity-60 transition-colors duration-700 ${loginAs === 'student' ? 'bg-purple-300' : loginAs === 'staff' ? 'bg-yellow-300' : 'bg-purple-200'}`} />
        </div>

 {step === 'role' && (
   <Link href="/" className="absolute top-8 left-8 lg:hidden group flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-colors z-20">
   <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
   <span>{t('auth.back_to_home')}</span>
   </Link>
 )}

  <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 sm:p-12 sm:pt-24 min-h-full relative">
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-md font-fredoka relative z-10 my-auto"
 >
 <AnimatePresence mode="wait">
 {step === 'role' ? (
 // STEP 1: Minimal Role Selection
 <motion.div
 key="role-selection"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ duration: 0.3 }}
 className="w-full space-y-8 relative z-10"
 >
 <div className="text-center">
 <h1 className="text-4xl font-medium text-slate-800 dark:text-slate-100 mb-3">
 {t('auth.login.title') || 'Xush kelibsiz'}
 </h1>
 <p className="text-gray-600 dark:text-gray-400 text-base">
 Qaysi sifatda kirmoqchisiz?
 </p>
 </div>

 {/* Minimal Role Selector */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mx-auto">
 <motion.button
 onClick={() => handleRoleSelect('student')}
 whileTap={{ scale: 0.95 }}
 className="relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:border-brand-blue/30 dark:hover:border-brand-blue/20 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
 >
 {/* Dynamic Glowing Blobs */}
 <div className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
 <motion.div 
 animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -right-4 -top-8 w-24 h-24 bg-brand-blue/10 rounded-full blur-xl"
 />
 <motion.div 
 animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }}
 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
 className="absolute -left-8 bottom-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"
 />
 </div>

 {/* Main Animated Watermark */}
 <motion.div 
 animate={{ y: [0, -6, 0], rotate: [-12, -8, -12] }}
 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -right-4 -bottom-4 z-0 text-brand-blue/5 dark:text-brand-blue/10 group-hover:text-brand-blue/10 dark:group-hover:text-brand-blue/20 transition-colors duration-500"
 >
 <GraduationCap className="w-32 h-32" />
 </motion.div>

 <div className="relative z-10 flex flex-col items-center gap-3">
 <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 group-hover:bg-brand-blue flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-blue/20 group-hover:scale-110">
 <GraduationCap className="text-brand-blue group-hover:text-white transition-colors duration-300" size={26} />
 </div>
 <div className="text-center">
 <div className="font-fredoka text-lg font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors duration-300">
 O'quvchi
 </div>
 <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
 Student
 </div>
 </div>
 </div>
 </motion.button>

 <motion.button
 onClick={() => handleRoleSelect('staff')}
 whileTap={{ scale: 0.95 }}
 className="relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:border-brand-orange/30 dark:hover:border-brand-orange/20 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
 >
 {/* Dynamic Glowing Blobs */}
 <div className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700">
 <motion.div 
 animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
 transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -right-4 -top-8 w-24 h-24 bg-brand-orange/10 rounded-full blur-xl"
 />
 <motion.div 
 animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }}
 transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
 className="absolute -left-8 bottom-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl"
 />
 </div>

 {/* Main Animated Watermark */}
 <motion.div 
 animate={{ y: [0, -6, 0], rotate: [-12, -8, -12] }}
 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
 className="absolute -right-4 -bottom-4 z-0 text-brand-orange/5 dark:text-brand-orange/10 group-hover:text-brand-orange/10 dark:group-hover:text-brand-orange/20 transition-colors duration-500"
 >
 <Users className="w-32 h-32" />
 </motion.div>

 <div className="relative z-10 flex flex-col items-center gap-3">
 <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-orange/20 group-hover:scale-110">
 <Users className="text-brand-orange group-hover:text-white transition-colors duration-300" size={26} />
 </div>
 <div className="text-center">
 <div className="font-fredoka text-lg font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-orange transition-colors duration-300">
 O'qituvchi
 </div>
 <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
 Teacher/Staff
 </div>
 </div>
 </div>
 </motion.button>
 </div>



 <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
 {t('auth.login.no_account') || "Akkauntingiz yo'qmi?"}{' '}
 <Link href="/register" className="text-brand-blue hover:underline font-medium">
 {t('auth.login.register') || "Ro'yxatdan o'tish"}
 </Link>
 </p>
 </motion.div>
 ) : step === 'form' ? (
 // STEP 2: Login Form
 <motion.form
 key="login-form"
 onSubmit={handleLogin}
 initial={{ opacity: 0, x: 50 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -50 }}
 transition={{ duration: 0.4 }}
 className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-6 relative z-10"
 >
 {/* Back Button + Role Badge */}
 <div className="flex items-center justify-between mb-6">
 <button
 type="button"
 onClick={handleBack}
 className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue transition-colors"
 >
 <ArrowLeft size={20} />
 <span>Ortga</span>
 </button>
 <div className={`px-4 py-2 rounded-full text-sm font-medium ${loginAs === 'student'
 ? 'bg-brand-blue/10 text-brand-blue'
 : 'bg-brand-orange/10 text-brand-orange'
 }`}>
 {loginAs === 'student' ? "O'quvchi" : "O'qituvchi/Xodim"}
 </div>
 </div>

 <div className="text-center mb-8">
 <h2 className="text-3xl font-medium text-slate-800 dark:text-slate-100 mb-2">
 {t('auth.login.title')}
 </h2>
 <p className="text-gray-500 dark:text-gray-400">
 {t('auth.login.subtitle')}
 </p>
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
 {t('auth.register.phone')}
 </label>
 <div className="relative group">
 <input
 type="tel"
 value={phone}
 onChange={handlePhoneChange}
 placeholder="+998 XX XXX XX XX"
 className={`w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:!outline-none focus:!ring-0 focus:!shadow-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-colors ${loginAs === 'student' ? 'focus:!border-brand-blue' : 'focus:!border-brand-orange'}`}
 required
 />
 <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none z-10 ${loginAs === 'student' ? 'group-focus-within:text-brand-blue' : 'group-focus-within:text-brand-orange'}`}>
 <Users size={20} />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex justify-between items-center ml-1">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {t('auth.login.password')}
 </label>
 <button
 type="button"
 onClick={() => setShowForgotPassword(true)}
 className="text-xs text-brand-blue hover:underline font-medium"
 >
 {t('auth.login.forgot')}
 </button>
 </div>
 <div className="relative group">
 <input
 type={showPassword ? "text" : "password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className={`w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:!outline-none focus:!ring-0 focus:!shadow-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-colors ${loginAs === 'student' ? 'focus:!border-brand-blue' : 'focus:!border-brand-orange'}`}
 required
 />
 <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors pointer-events-none z-10 ${loginAs === 'student' ? 'group-focus-within:text-brand-blue' : 'group-focus-within:text-brand-orange'}`}>
 <Lock size={20} />
 </div>
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
 >
 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 </div>
 </div>
 </div>

 <motion.button
 whileTap={{ scale: 0.95 }}
 type="submit"
 disabled={loading}
 className={`w-full py-4 text-white font-medium rounded-full text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden ${
 loginAs === 'student' ? 'bg-brand-blue shadow-brand-blue/30 hover:bg-blue-700' : 'bg-brand-orange shadow-brand-orange/30 hover:bg-orange-600'
 }`}
 >
 <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
 <span className="relative z-10 flex items-center gap-2">
 {loading ? (
 <Loader2 className="animate-spin" size={24} />
 ) : (
 <>
 {t('auth.login.button')}
 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
 </>
 )}
 </span>
 </motion.button>

  <div className="relative mt-8 mb-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-4 bg-slate-50 dark:bg-[#0B1120] text-gray-400">Yoki</span>
    </div>
  </div>

  <div className="flex flex-col items-center justify-center">
    <TelegramLoginWidget 
      clientId="8736423754" 
      onAuth={handleTelegramAuth} 
    />
  </div>

 <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
 {t('auth.login.no_account')}{' '}
 <Link href="/register" className="text-brand-blue font-medium hover:underline">
 {t('auth.login.register')}
 </Link>
 </p>
 </motion.form>
 ) : (
    // STEP 3: Link Account Form
    <motion.form
      key="link-form"
      onSubmit={handleLinkAccount}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-6 relative z-10"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center gap-2">
          <Link2 size={16} /> Telegramni ulash
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand-blue/20">
          {linkingUser?.photo_url ? (
            <img src={linkingUser.photo_url} alt="Telegram Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-blue flex items-center justify-center text-white text-xl font-bold">
              {linkingUser?.first_name?.[0] || 'T'}
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {linkingUser?.first_name} {linkingUser?.last_name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Akkauntni yakunlash uchun telefon raqamingizni kiriting.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Telefon raqam
          </label>
          <input
            type="tel"
            value={linkPhone}
            onChange={(e) => setLinkPhone(formatPhoneNumber(e.target.value))}
            placeholder="+998 90 123 45 67"
            required
            className="w-full px-4 py-3 bg-white/50 dark:bg-[#0B1120]/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Parol (Mavjud bo'lsa)
          </label>
          <div className="relative">
            <input
              type={showLinkPassword ? "text" : "password"}
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              placeholder="Agar raqamingiz tizimda bo'lsa, parolni kiriting"
              className="w-full px-4 py-3 bg-white/50 dark:bg-[#0B1120]/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowLinkPassword(!showLinkPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              {showLinkPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !linkPhone}
        className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={18} /> Ulash va Kirish</>}
      </button>
    </motion.form>
 )}
 </AnimatePresence>
 </motion.div>
 </div>

 {/* Forgot Password Modal */}
 {showForgotPassword && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
 <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2">
 {t("auth.forgot_password.title")}
 </h3>
 <p className="text-gray-600 dark:text-gray-300 mb-6">
 {t("auth.forgot_password.message")}
 </p>
 <button
 onClick={() => setShowForgotPassword(false)}
 className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-medium py-2.5 rounded-xl transition-colors"
 >
 {t("auth.forgot_password.close")}
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
