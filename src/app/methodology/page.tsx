"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, TrendingUp, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MethodologyPage = () => {
    const { t } = useLanguage();

    const steps = [
        {
            id: 'step1',
            icon: ClipboardList,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/10',
            border: 'border-blue-100 dark:border-blue-800',
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000",
        },
        {
            id: 'step2',
            icon: CheckCircle2,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/10',
            border: 'border-orange-100 dark:border-orange-800',
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000",
        },
        {
            id: 'step3',
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/10',
            border: 'border-green-100 dark:border-green-800',
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
        },
        {
            id: 'step4',
            icon: Award,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/10',
            border: 'border-purple-100 dark:border-purple-800',
            image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=1000",
        }
    ];

    return (
        <main className="min-h-screen pt-24 pb-20 bg-transparent transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 mb-20 md:mb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                            {t('methodology.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {t('methodology.subtitle')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 md:space-y-32">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
                    >
                        {/* Text Content */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`text-6xl font-black ${step.color} opacity-20`}>{t(`methodology.${step.id}.num`)}</span>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step.bg} ${step.color}`}>
                                    <step.icon size={32} strokeWidth={2} />
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                {t(`methodology.${step.id}.title`)}
                            </h2>

                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t(`methodology.${step.id}.desc`)}
                            </p>

                            {/* Detailed Description Placeholder (To be added to locales if needed, defaulting to generic expanded text for now) */}
                            <p className="text-base text-gray-500 dark:text-gray-500 leading-relaxed">
                                {t('hero.subheadline')} {/* Reusing a general text for now, or could extend locales later for specific details */}
                            </p>
                        </div>

                        {/* Visual/Image */}
                        <div className="flex-1 w-full">
                            <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ${step.border} border-4`}>
                                {/* Abstract overlay */}
                                <div className={`absolute inset-0 ${step.bg} mix-blend-multiply opacity-20 z-10`} />
                                {/* Placeholder Image handling - in real app, use next/image with actual assets */}
                                <div className={`w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-gray-300 dark:text-slate-700`}>
                                    {/* Simple decorative pattern instead of external image to avoid loading issues */}
                                    <step.icon size={120} strokeWidth={1} className="opacity-10" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* CTA Section */}
            <section className="mt-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center bg-brand-blue/5 dark:bg-brand-blue/10 rounded-3xl p-12 md:p-20 border border-brand-blue/10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('courses.subtitle')}
                    </h2>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/register"
                            className="bg-brand-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            {t('hero.cta.primary')}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default MethodologyPage;
