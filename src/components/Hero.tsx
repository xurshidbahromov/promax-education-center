"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden transition-colors duration-300 pt-20 pb-16 px-4">

            {/* Abstract Background Element (Removed - moved to global layout) */}

            <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center w-full">

                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mb-6 sm:mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-brand-blue dark:text-blue-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-blue-400"></span>
                        </span>
                        <span className="hidden sm:inline">PROMAX EDUCATION LC PLATFORMASIGA XUSH KELIBSIZ!</span>
                        <span className="sm:hidden">XUSH KELIBSIZ!</span>
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-4 sm:mb-6 max-w-6xl truncate-none whitespace-nowrap"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                    {t('hero.headline').split(',').map((part, i) => (
                        part.trim() && (
                            <span key={i} className={`${i === 1 ? 'text-brand-blue dark:text-blue-400' : ''}`}>
                                {part.trim()}{i === 1 ? '' : ', '}
                            </span>
                        )
                    ))}
                </motion.h1>

                {/* Slogan */}
                <motion.p
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-orange dark:text-orange-400 mb-3 uppercase tracking-wide px-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    "{t('hero.slogan')}"
                </motion.p>

                {/* Subheadline */}
                <motion.p
                    className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl font-medium leading-relaxed px-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                >
                    {t('hero.subheadline')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    className="mt-8 sm:mt-10 flex flex-col gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {/* Primary and Secondary CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                            href="/register"
                            className="group bg-brand-orange text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            {t('hero.cta.primary')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/results"
                            className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:border-brand-blue dark:hover:border-blue-500 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center active:scale-95"
                        >
                            {t('hero.cta.secondary')}
                        </Link>
                    </div>

                    {/* Online Tests Button */}
                    <Link
                        href="/dashboard/tests"
                        className="group bg-brand-blue text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {t('hero.cta.tests')}
                    </Link>
                </motion.div>

                {/* Minimal Trust Indicators */}
                <motion.div
                    className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 sm:gap-y-4 text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider sm:tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.cert')}</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.exam')}</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span className="group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{t('hero.trust.mock')}</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
