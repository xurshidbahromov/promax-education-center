"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { getUserRole, getRedirectPath } from '@/lib/auth-helpers';
import { Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<'role' | 'form'>('role'); // Two-step flow
    const [loginAs, setLoginAs] = useState<'student' | 'staff' | null>(null);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        setStep('role');
        setLoginAs(null);
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
                setError(t('auth.error_wrong_portal') || 'Please use student login portal');
                await supabase.auth.signOut();
                return;
            }

            if (loginAs === 'student' && ['teacher', 'staff', 'admin'].includes(userRole)) {
                setError(t('auth.error_wrong_portal') || 'Please use teacher/staff login portal');
                await supabase.auth.signOut();
                return;
            }

            // Redirect based on role
            const redirectPath = getRedirectPath(userRole);
            router.push(redirectPath);
        } catch (err: any) {
            console.error('Login error:', err);
            // Use translation for common errors
            if (err.message.includes('Invalid login credentials')) {
                setError(t('auth.error_invalid_credentials'));
            } else if (err.message.includes('Email not confirmed')) {
                setError(t('auth.error_email_not_confirmed'));
            } else {
                setError(err.message || t('auth.error_login_failed'));
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

                    <h1 className="text-5xl font-bold leading-tight font-fredoka">
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                <AnimatePresence>
                    {loginAs && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="pointer-events-none absolute inset-0 z-0"
                        >
                            <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[100px] opacity-20 transition-colors duration-700 ${loginAs === 'student' ? 'bg-brand-blue' : 'bg-brand-orange'}`} />
                            <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[100px] opacity-20 transition-colors duration-700 ${loginAs === 'student' ? 'bg-brand-blue' : 'bg-brand-orange'}`} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <Link href="/" className="absolute top-8 left-8 lg:hidden group flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-colors z-20">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{t('auth.back_to_home')}</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md font-fredoka relative z-10"
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
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
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

                                        {/* Floating Mini Icons (Bubbles) */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, -15, 10] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.2 }}
                                                className="absolute right-12 bottom-0 z-0 text-brand-blue/20"
                                            >
                                                <GraduationCap className="w-6 h-6 rotate-12" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, 15, -5] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
                                                className="absolute right-24 bottom-0 z-0 text-brand-blue/15"
                                            >
                                                <GraduationCap className="w-5 h-5 -rotate-12" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, -10, 20] }}
                                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 2.5 }}
                                                className="absolute right-4 bottom-0 z-0 text-brand-blue/10"
                                            >
                                                <GraduationCap className="w-4 h-4 rotate-45" />
                                            </motion.div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 group-hover:bg-brand-blue flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-blue/20 group-hover:scale-110">
                                                <GraduationCap className="text-brand-blue group-hover:text-white transition-colors duration-300" size={26} />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-fredoka text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors duration-300">
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

                                        {/* Floating Mini Icons (Bubbles) */}
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, -15, 10] }}
                                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.3 }}
                                                className="absolute right-12 bottom-0 z-0 text-brand-orange/20"
                                            >
                                                <Users className="w-6 h-6 rotate-12" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, 15, -5] }}
                                                transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 1.8 }}
                                                className="absolute right-24 bottom-0 z-0 text-brand-orange/15"
                                            >
                                                <Users className="w-5 h-5 -rotate-12" />
                                            </motion.div>
                                            <motion.div
                                                animate={{ y: [40, -150], opacity: [0, 1, 0], x: [0, -10, 20] }}
                                                transition={{ duration: 3.8, repeat: Infinity, ease: "linear", delay: 2.8 }}
                                                className="absolute right-4 bottom-0 z-0 text-brand-orange/10"
                                            >
                                                <Users className="w-4 h-4 rotate-45" />
                                            </motion.div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-orange/20 group-hover:scale-110">
                                                <Users className="text-brand-orange group-hover:text-white transition-colors duration-300" size={26} />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-fredoka text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-orange transition-colors duration-300">
                                                    O'qituvchi
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                                                    Teacher/Staff
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>

                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('auth.login.no_account') || "Akkauntingiz yo'qmi?"}{' '}
                                    <Link href="/register" className="text-brand-blue hover:underline font-medium">
                                        {t('auth.login.register') || "Ro'yxatdan o'tish"}
                                    </Link>
                                </p>
                            </motion.div>
                        ) : (
                            // STEP 2: Login Form
                            <motion.form
                                key="login-form"
                                onSubmit={handleLogin}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6"
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
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                        {t('auth.login.title')}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('auth.login.subtitle')}
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

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
                                                className={`w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none bg-white dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-white placeholder-gray-400 transition-colors ${loginAs === 'student' ? 'focus:border-brand-blue' : 'focus:border-brand-orange'}`}
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
                                                className={`w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none bg-white dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-white placeholder-gray-400 transition-colors ${loginAs === 'student' ? 'focus:border-brand-blue' : 'focus:border-brand-orange'}`}
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
                                    className={`w-full py-4 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden ${
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

                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('auth.login.no_account')}{' '}
                                    <Link href="/register" className="text-brand-blue font-bold hover:underline">
                                        {t('auth.login.register')}
                                    </Link>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {t("auth.forgot_password.title")}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {t("auth.forgot_password.message")}
                            </p>
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium py-2.5 rounded-xl transition-colors"
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
