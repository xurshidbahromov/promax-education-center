"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Atom, Globe, Dna, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CoursesPreview = () => {
    const { t } = useLanguage();

    const categories = [
        {
            id: 'exact',
            icon: Calculator,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'languages',
            icon: Globe,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            id: 'humanities',
            icon: ScrollText,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        },
        {
            id: 'science',
            icon: Dna,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="py-24 bg-transparent relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        {t('courses.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto"
                    >
                        {t('courses.subtitle')}
                    </motion.p>
                </div>

                {/* Categories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={itemVariants}
                            className="group bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10 hover:-translate-y-1 relative flex flex-col h-full"
                        >
                            <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon className={`w-6 h-6 ${cat.color}`} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {t(`courses.cat.${cat.id}`)}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                                {t(`courses.cat.${cat.id}.desc`)}
                            </p>

                            <Link
                                href="/courses"
                                className="inline-flex items-center text-sm font-semibold text-brand-blue group-hover:text-blue-600 dark:text-blue-400 transition-colors mt-auto"
                            >
                                {t('courses.more')}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-lg font-semibold text-brand-blue hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                    >
                        {t('courses.view_all')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default CoursesPreview;
