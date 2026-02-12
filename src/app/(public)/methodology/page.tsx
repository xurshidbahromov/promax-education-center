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
                            <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ${step.border} border-4 group`}>
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.id === 'step1' ? 'from-blue-400 via-blue-500 to-cyan-500' :
                                        step.id === 'step2' ? 'from-orange-400 via-orange-500 to-amber-500' :
                                            step.id === 'step3' ? 'from-green-400 via-emerald-500 to-teal-500' :
                                                'from-purple-400 via-purple-500 to-pink-500'
                                    }`} />

                                {/* Decorative Circles */}
                                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

                                {/* Glass Morphism Layer */}
                                <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />

                                {/* Main Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Icon Glow */}
                                        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150" />
                                        {/* Icon */}
                                        <step.icon
                                            size={140}
                                            strokeWidth={1.5}
                                            className="text-white drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Pattern */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />

                                {/* Step Number Watermark */}
                                <div className="absolute bottom-4 right-4">
                                    <span className="text-8xl font-black text-white/10">
                                        {t(`methodology.${step.id}.num`)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>


        </main>
    );
};

export default MethodologyPage;
