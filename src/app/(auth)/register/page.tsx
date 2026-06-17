"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, Link2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TelegramLoginWidget, { TelegramAuthPayload } from '@/components/auth/TelegramLoginWidget';

export default function RegisterPage() {
 const { t } = useLanguage();
 const router = useRouter();
 const supabase = createClient();

  // Students only - no role selection needed
  const [step, setStep] = useState<'form' | 'link'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Linking state
  const [linkingUser, setLinkingUser] = useState<any>(null);
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

  const validatePhone = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;
  return phoneRegex.test(phoneNumber);
  };

  const handleBack = () => {
    setStep('form');
    setLinkingUser(null);
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
        toast.success("Telegram orqali muvaffaqiyatli kirdingiz");
        router.push('/dashboard');
      } else {
        const normalizedUser = {
          id: user.user.id,
          first_name: user.user.name,
          username: user.user.preferred_username,
          photo_url: user.user.picture,
        };
        
        if (data.linked && data.needsPassword) {
          setLinkingUser(normalizedUser);
          setLinkPhone(data.phone || '');
          setStep('link');
        } else {
          setLinkingUser(normalizedUser);
          setStep('link');
        }
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

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);

 if (!name || !phone || !password) {
 toast.error(t('auth.error_fill_all_fields') || "Barcha maydonlarni to'ldiring");
 setLoading(false);
 return;
 }

 if (!validatePhone(phone)) {
 toast.error(t('auth.error_invalid_phone') || 'Telefon raqam xato');
 setLoading(false);
 return;
 }

 if (password.length < 6) {
 toast.error(t('auth.error_password_too_short') || "Parol kamida 6ta belgidan iborat bo'lishi kerak");
 setLoading(false);
 return;
 }

 // AUTO-GENERATE EMAIL FROM PHONE
 // Example: +998 90 123 45 67 -> 998901234567@promax.uz
 const cleanPhone = phone.replace(/\D/g, '');
 const generatedEmail = `${cleanPhone}@promax.uz`;

 try {
 const { data, error } = await supabase.auth.signUp({
 email: generatedEmail,
 password,
 options: {
 data: {
 full_name: name,
 phone: phone,
 role: 'student', // Always student for self-registration
 },
 emailRedirectTo: `${window.location.origin}/dashboard`,
 },
 });

 if (error) {
 if (error.message.includes('Email address')) {
 throw new Error(t('auth.error_email_invalid')); // Should not happen usually
 }
 if (error.message.includes('User already registered')) {
 throw new Error(t('auth.error_already_registered'));
 }
 throw error;
 }

 if (data?.user) {
 // Manually create profile in profiles table
 const { error: profileError } = await supabase
 .from('profiles')
 .upsert({
 id: data.user.id,
 full_name: name,
 email: generatedEmail,
 phone: phone,
 role: 'student'
 });

 if (profileError) {
 console.error('Profile creation error:', profileError);
 }

 toast.success(t('auth.success_registration') || "Muvaffaqiyatli ro'yxatdan o'tdingiz");

 // Redirect to dashboard (user is already logged in after signup)
 setTimeout(() => {
 router.push('/dashboard');
 }, 2000);
 }
 } catch (err: any) {
 console.error('Registration error:', err);
 toast.error(err.message || t('auth.error_registration_failed') || "Ro'yxatdan o'tishda xatolik yuz berdi");
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
 <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-3xl"></div>
 <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-brand-orange/20 rounded-full blur-3xl"></div>
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
 {t('setup.future.title')}
 </h1>
 <p className="text-xl text-blue-100/90 leading-relaxed">
 {t('setup.future.subtitle')}
 </p>

 <div className="grid grid-cols-2 gap-4 mt-8">
 <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
 <div className="text-3xl font-medium mb-1">500+</div>
 <div className="text-blue-200 text-sm">{t('stats.students')}</div>
 </div>
 <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
 <div className="text-3xl font-medium mb-1">98%</div>
 <div className="text-blue-200 text-sm">{t('stats.success_rate')}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Right Side - Registration Form */}
 <div className="w-full lg:w-1/2 h-screen overflow-y-auto relative bg-transparent flex flex-col">
        {/* Mobile & Right side Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/60 blur-[130px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-300/60 blur-[130px] opacity-60" />
        </div>
 <Link href="/" className="absolute top-8 left-8 lg:hidden group flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-colors z-20">
 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
 <span>{t('auth.back_to_home')}</span>
 </Link>

  <div className="flex-1 flex flex-col items-center justify-center p-6 pt-24 sm:p-12 sm:pt-24 min-h-full relative">
  <motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
  className="w-full max-w-md font-fredoka relative z-10 my-auto"
  >
  <AnimatePresence mode="wait">
  {step === 'form' ? (
  <motion.form
  key="register-form"
  onSubmit={handleRegister}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ delay: 0.2 }}
  className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-sm border border-white/60 dark:border-slate-700/50 space-y-6"
  >
 <div className="text-center mb-8">
 <h2 className="text-3xl font-medium text-slate-800 dark:text-slate-100 mb-2">
 {t('auth.register.title')}
 </h2>
 <p className="text-gray-500 dark:text-gray-400">
 {t('auth.register.subtitle')}
 </p>
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
 {t('auth.register.name')}
 </label>
 <div className="relative group">
  <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder={t('auth.register.name_placeholder')}
    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-brand-blue bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-colors"
    required
  />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors pointer-events-none z-10">
 <User size={20} />
 </div>
 </div>
 </div>

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
    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-brand-blue bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-colors"
  />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors pointer-events-none z-10">
 <Phone size={20} />
 </div>
 </div>
 </div>



 <div className="space-y-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
 {t('auth.register.password')}
 </label>
 <div className="relative group">
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-brand-blue bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 transition-colors"
    required
  />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors pointer-events-none z-10">
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
 <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
 {t('auth.register.password_hint')}
 </p>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 bg-brand-blue hover:bg-blue-700 text-white font-medium rounded-full text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={20} />
 ) : (
 <>
 {t('auth.register.button')}
 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
 </>
 )}
 </button>

 <div className="relative my-6">
   <div className="absolute inset-0 flex items-center">
     <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
   </div>
   <div className="relative flex justify-center text-sm">
     <span className="px-2 bg-white/60 dark:bg-slate-900/60 text-gray-500">yoki</span>
   </div>
 </div>

 <div className="flex flex-col items-center justify-center">
 <TelegramLoginWidget 
      clientId="8736423754" 
      onAuth={handleTelegramAuth} 
    />
 </div>

 <p className="text-center text-sm text-gray-500 dark:text-gray-400">
 {t('auth.register.have_account')}{' '}
 <Link href="/login" className="text-brand-blue font-medium hover:underline">
 {t('auth.register.login')}
 </Link>
 </p>
  </motion.form>
  ) : (
    // STEP 2: Link Account Form
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
 </div>
 </div>
 );
}
