"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { getUserRole, getRedirectPath } from '@/lib/auth-helpers';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<'role' | 'form'>('role'); // Two-step flow
    const [loginAs, setLoginAs] = useState<'student' | 'staff' | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRoleSelect = (role: 'student' | 'staff') => {
        setLoginAs(role);
        setStep('form'); // Move to form step
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

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
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
        <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
            {/* Left Side - Info/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-blue dark:bg-slate-900 items-start justify-center pt-20 p-12 text-white">
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

                    <h1 className="text-5xl font-bold leading-tight">
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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <Link href="/" className="absolute top-8 left-8 lg:hidden group flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-colors">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{t('auth.back_to_home')}</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
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
                                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                                        {t('auth.login.title') || 'Xush kelibsiz'}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-base">
                                        Qaysi sifatda kirmoqchisiz?
                                    </p>
                                </div>

                                {/* Minimal Role Selector */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                                    {/* Student Button */}
                                    <motion.button
                                        onClick={() => handleRoleSelect('student')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 p-5 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-blue hover:bg-brand-blue/5 transition-all group"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 group-hover:bg-brand-blue flex items-center justify-center transition-all">
                                                <GraduationCap className="text-brand-blue group-hover:text-white transition-colors" size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                                                    O'quvchi
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Student
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Teacher/Staff Button */}
                                    <motion.button
                                        onClick={() => handleRoleSelect('staff')}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 p-5 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center transition-all">
                                                <Users className="text-brand-orange group-hover:text-white transition-colors" size={24} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-orange transition-colors">
                                                    O'qituvchi
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
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
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
                                            {t('auth.login.email')}
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-blue bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('auth.login.password')}
                                            </label>
                                            <Link href="/forgot-password" className="text-xs text-brand-blue hover:underline">
                                                {t('auth.login.forgot')}
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                                                <Lock size={20} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-blue bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                                                required
                                            />
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {t('auth.login.button')}
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

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
            </div>
        </div>
    );
}
