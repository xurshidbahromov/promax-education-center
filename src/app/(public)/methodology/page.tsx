"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, TrendingUp, Award, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

const MethodologyPage = () => {
    const { t } = useLanguage();

    const steps = [
        {
            id: 'step1',
            icon: ClipboardList,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-800',
            glow: 'from-blue-500/20 to-cyan-500/20',
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
        },
        {
            id: 'step2',
            icon: CheckCircle2,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-100 dark:border-orange-800',
            glow: 'from-orange-500/20 to-amber-500/20',
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
        },
        {
            id: 'step3',
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-100 dark:border-green-800',
            glow: 'from-green-500/20 to-emerald-500/20',
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        },
        {
            id: 'step4',
            icon: Award,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-100 dark:border-purple-800',
            glow: 'from-purple-500/20 to-pink-500/20',
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200", // Updated to a better graduation/success image
        }
    ];

    return (
        <div className="w-full pt-24 pb-20 transition-colors duration-300 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[180px] pointer-events-none -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                {/* Left Aligned Header */}
                <div className="mb-24 relative mt-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 tracking-tight"
                    >
                        {t('methodology.title')}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed"
                    >
                        {t('methodology.subtitle')}
                    </motion.p>
                </div>

                {/* Premium Steps Section */}
                <section className="space-y-32 md:space-y-48 relative z-10">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center relative`}
                    >
                        {/* Connecting Line (Desktop Only) - except for last item */}
                        {index !== steps.length - 1 && (
                            <div className="hidden lg:block absolute top-[60%] bottom-[-80%] left-1/2 w-0.5 border-l-2 border-dashed border-gray-200 dark:border-slate-800 -translate-x-1/2 -z-10" />
                        )}

                        {/* Text Content */}
                        <div className="flex-1 space-y-8 relative">
                            {/* Giant Watermark Number */}
                            <div className="absolute -top-12 -left-6 text-[12rem] font-black text-black/[0.03] dark:text-white/[0.02] -z-10 select-none leading-none">
                                {t(`methodology.${step.id}.num`)}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step.bg} ${step.color} shadow-sm border border-white/50 dark:border-slate-700/50 backdrop-blur-sm`}>
                                    <step.icon size={32} strokeWidth={2} />
                                </div>
                                <span className={`text-xl font-bold uppercase tracking-widest ${step.color}`}>
                                    Qadam {t(`methodology.${step.id}.num`)}
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white leading-tight">
                                {t(`methodology.${step.id}.title`)}
                            </h2>

                            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t(`methodology.${step.id}.desc`)}
                            </p>
                            
                            <p className="text-lg text-gray-500 dark:text-gray-500 leading-relaxed pl-4 border-l-4 border-gray-200 dark:border-slate-800">
                                {t('hero.subheadline')} 
                            </p>
                        </div>

                        {/* Visual/Image (Premium Glassmorphism Card) */}
                        <div className="flex-1 w-full relative group">
                            {/* Glow behind image */}
                            <div className={`absolute -inset-4 bg-gradient-to-r ${step.glow} rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
                            
                            <div className={`relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl ${step.border} border-4 bg-white dark:bg-slate-900`}>
                                <Image
                                    src={step.image}
                                    alt={t(`methodology.${step.id}.title`)}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay to ensure text readability if needed */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                
                                {/* Floating Badge inside image */}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 rounded-2xl p-6 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center ${step.color} shadow-lg shrink-0`}>
                                            <step.icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-white font-semibold text-lg line-clamp-2">
                                            {t(`methodology.${step.id}.title`)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </section>
            </div>
            </div>
        </div>
    );
};

export default MethodologyPage;
