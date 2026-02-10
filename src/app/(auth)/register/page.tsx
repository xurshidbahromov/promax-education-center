"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft, Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();

    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                        role: role,
                    },
                },
            });

            if (error) throw error;

            router.push('/dashboard');
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
                        {t('setup.future.title')}
                    </h1>
                    <p className="text-xl text-blue-100/90 leading-relaxed">
                        {t('setup.future.subtitle')}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold mb-1">500+</div>
                            <div className="text-blue-200 text-sm">{t('stats.students')}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="text-3xl font-bold mb-1">98%</div>
                            <div className="text-blue-200 text-sm">{t('stats.success_rate')}</div>
                        </div>
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
                    {/* Role Switcher */}
                    <div className="bg-gray-100 dark:bg-slate-900/50 p-1 rounded-xl flex relative">
                        <motion.div
                            className="absolute inset-y-1 rounded-lg bg-white dark:bg-slate-800 shadow-sm"
                            initial={false}
                            animate={{
                                x: role === 'student' ? '0%' : '100%',
                                width: '50%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setRole('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors ${role === 'student' ? 'text-brand-blue dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <GraduationCap size={18} />
                            {t('auth.register.role.student')}
                        </button>
                        <button
                            onClick={() => setRole('teacher')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors ${role === 'teacher' ? 'text-brand-blue dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <Briefcase size={18} />
                            {t('auth.register.role.teacher')}
                        </button>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('auth.register.title')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">{t('auth.register.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t('auth.register.name')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all dark:text-white"
                                        placeholder="Ismingiz"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t('auth.register.phone')}</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all dark:text-white"
                                        placeholder="+998 90 123 45 67"
                                    />
                                </div>
                            </div>

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
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{t('auth.login.password')}</label>
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
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>{t('auth.register.button')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        {t('auth.register.have_account')}{' '}
                        <Link href="/login" className="text-brand-blue font-bold hover:underline underline-offset-2">
                            {t('auth.register.login')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
