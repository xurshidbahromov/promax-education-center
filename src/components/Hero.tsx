"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-300 pt-8 pb-16">

            {/* Abstract Background Element (Removed - moved to global layout) */}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-brand-blue dark:text-blue-300 text-sm font-semibold tracking-wide uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-blue-400"></span>
                        </span>
                        Promax Education Platform
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-gray-900 dark:text-white leading-[1.1] mb-6 break-words max-w-full"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    {t('hero.headline').split('.').map((part, i) => (
                        part.trim() && (
                            <span key={i} className={`block ${i === 1 ? 'text-brand-blue dark:text-blue-400' : ''}`}>
                                {part.trim()}.
                            </span>
                        )
                    ))}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium leading-relaxed px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                >
                    {t('hero.subheadline')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Link
                        href="/register"
                        className="group bg-brand-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 dark:shadow-none hover:shadow-2xl hover:shadow-orange-200 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        {t('hero.cta.primary')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/results"
                        className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:border-brand-blue dark:hover:border-blue-500 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center active:scale-95 w-full sm:w-auto"
                    >
                        {t('hero.cta.secondary')}
                    </Link>
                </motion.div>

                {/* Minimal Trust Indicators */}
                <motion.div
                    className="mt-20 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.cert')}</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.exam')}</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.mock')}</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
