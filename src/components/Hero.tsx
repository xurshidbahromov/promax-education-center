"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, PlayCircle, Users, Trophy, BookOpen } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <section className="relative min-h-[90vh] lg:min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden pt-24 lg:pt-32 pb-16 px-4 -mt-16 lg:-mt-16">
            
            {/* Native theme background is fully inherited */}

            <div className="max-w-7xl mx-auto relative z-20 grid lg:grid-cols-2 gap-12 items-center justify-center w-full">
                
                {/* Left Column: Text & CTAs */}
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left relative z-10">
                    {/* Animated Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mb-6 sm:mb-8 mt-4 sm:mt-0"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                            </span>
                            <span>{t('hero.welcome')}</span>
                        </span>
                    </motion.div>

                    {/* Headline - Massive */}
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-800 dark:text-slate-100 leading-[1.05] mb-6 max-w-2xl uppercase font-fredoka"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                    >
                        {t('hero.headline').split(',').map((part, i) => (
                            part.trim() && (
                                <span key={i} className={`block ${i === 1 ? 'text-brand-orange' : ''}`}>
                                    {part.trim()}
                                </span>
                            )
                        ))}
                    </motion.h1>

                    {/* Slogan */}
                    <motion.p
                        className="text-lg sm:text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed mx-auto lg:mx-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t('hero.slogan')}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="mt-6 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Link
                            href="/register"
                            className="group bg-brand-orange text-white px-8 py-4 rounded-full font-black text-lg hover:bg-brand-orange/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider"
                        >
                            {t('hero.cta.primary')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                        </Link>
                        
                        <Link
                            href="/courses"
                            className="group bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider"
                        >
                            <PlayCircle className="w-5 h-5 transition-transform" />
                            {t('hero.cta.tests')}
                        </Link>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-bold text-slate-500 dark:text-slate-300/80 uppercase tracking-widest w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/20 group-hover:border-brand-orange group-hover:text-brand-orange transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{t('hero.trust.cert')}</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/20 group-hover:border-brand-orange group-hover:text-brand-orange transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{t('hero.trust.exam')}</span>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/20 group-hover:border-brand-orange group-hover:text-brand-orange transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">{t('hero.trust.mock')}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Absolute Photo Collage Background (Moved outside max-w-7xl container to span full section height) */}
            <div className="absolute top-0 bottom-0 right-[-10%] sm:right-0 w-[120%] sm:w-full lg:w-[55%] xl:w-[50%] z-0 pointer-events-none overflow-hidden lg:overflow-visible opacity-[0.12] dark:opacity-20 lg:opacity-100 dark:lg:opacity-100">
                    {/* Decorative Dots */}
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[15%] left-[5%] w-3 h-3 lg:w-5 lg:h-5 rounded-full bg-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.3)] z-10" />
                    <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute bottom-[20%] left-[2%] w-4 h-4 lg:w-7 lg:h-7 rounded-full bg-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10" />
                    <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }} className="absolute bottom-[40%] right-[5%] w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10" />

                    {/* Column 1 */}
                    <div className="absolute left-[2%] lg:left-[5%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="absolute top-[12%] bottom-[51.5%] w-full rounded-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero1.jpeg" alt="Student" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover object-top hover:scale-[1.02] transition-transform duration-500" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="absolute top-[51.5%] bottom-0 w-full rounded-t-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero2.jpeg" alt="Students with books" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover hover:scale-[1.02] transition-transform duration-500" />
                        </motion.div>
                    </div>

                    {/* Column 2 */}
                    <div className="absolute left-[35%] lg:left-[38%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="absolute top-[6%] bottom-[51.5%] w-full rounded-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero3.jpeg" alt="Student" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover object-top hover:scale-[1.02] transition-transform duration-500" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="absolute top-[51.5%] bottom-[6%] w-full rounded-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero4.jpeg" alt="Student studying" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover object-top hover:scale-[1.02] transition-transform duration-500" />
                        </motion.div>
                    </div>

                    {/* Column 3 */}
                    <div className="absolute left-[68%] lg:left-[71%] top-0 bottom-0 w-[30%] lg:w-[180px] xl:w-[240px] pointer-events-auto">
                        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="absolute top-0 bottom-[51.5%] w-full rounded-b-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero5.jpeg" alt="Student" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover object-top scale-[1.2] translate-y-[10%] hover:scale-[1.22] transition-transform duration-500" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="absolute top-[51.5%] bottom-0 w-full rounded-t-full overflow-hidden shadow-2xl">
                            <Image src="/hero_images/hero6.jpeg" alt="Students learning" fill priority sizes="(max-width: 768px) 30vw, 240px" className="object-cover object-top hover:scale-[1.02] transition-transform duration-500" />
                        </motion.div>
                    </div>
                </div>
        </section>
    );
};

export default Hero;
