"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, TrendingUp, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Methodology = () => {
    const { t } = useLanguage();

    const steps = [
        {
            id: 'step1',
            icon: ClipboardList,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-900',
            delay: 0.1
        },
        {
            id: 'step2',
            icon: CheckCircle2,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-100 dark:border-orange-900',
            delay: 0.2
        },
        {
            id: 'step3',
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-100 dark:border-green-900',
            delay: 0.3
        },
        {
            id: 'step4',
            icon: Award,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-100 dark:border-purple-900',
            delay: 0.4
        }
    ];

    return (
        <section className="py-20 relative z-10 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Text Side */}
                    <div className="lg:w-1/3 text-center lg:text-left">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
                        >
                            {t('methodology.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-gray-600 dark:text-gray-400 mb-8"
                        >
                            {t('methodology.subtitle')}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link
                                href="/methodology"
                                className="inline-flex items-center gap-2 text-brand-blue font-bold hover:gap-4 transition-all"
                            >
                                {t('methodology.home.cta')}
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Timeline / Steps Side */}
                    <div className="lg:w-2/3 w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -translate-y-1/2 z-0" />

                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="relative z-10 flex flex-col items-center text-center group"
                                >
                                    <div className={`w-16 h-16 rounded-full ${step.bg} ${step.color} border-4 border-white dark:border-slate-900 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                                        <step.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                        {t(`methodology.${step.id}.title`)}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-400 mt-1 block group-hover:text-brand-blue transition-colors">
                                        {t(`methodology.${step.id}.num`)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Methodology;
