"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            // Check user role
            const role = data.user?.user_metadata?.role;

            if (role === 'teacher') {
                // Future: Redirect to teacher dashboard or admin panel
                // For now, we'll send them to dashboard but maybe with a query param or just normal
                router.push('/dashboard?role=teacher');
            } else {
                router.push('/dashboard');
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
            {/* Left Side - Info/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-blue dark:bg-slate-900 items-center justify-center p-12 text-white">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-[10%] right-[10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] left-[10%] w-[60%] h-[60%] bg-brand-orange/20 rounded-full blur-3xl"></div>
                    <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
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
                            className="object-contain filter brightness-0 invert"
                        />
                    </div>

                    <h1 className="text-5xl font-bold leading-tight">
                        {t('auth.welcome')}
                    </h1>
                    <p className="text-xl text-blue-100/90 leading-relaxed">
                        {t('auth.welcome_subtitle_login')}
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
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth.login.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{t('auth.login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t('auth.login.email')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all dark:text-white"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('auth.login.password')}</label>
                                    <Link href="/forgot-password" className="text-xs text-brand-blue hover:underline underline-offset-2">
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
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed mt-6 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('auth.login.button')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        {t('auth.login.no_account')}{' '}
                        <Link href="/register" className="text-brand-blue font-bold hover:underline underline-offset-2">
                            {t('auth.login.register')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
