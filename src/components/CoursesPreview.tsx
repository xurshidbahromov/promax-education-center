"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Atom, Globe, ArrowRight, ScrollText, Feather } from 'lucide-react';
import Link from 'next/link';

const CoursesPreview = () => {
    const { t } = useLanguage();

    const courses = [
        {
            id: 'math',
            icon: Calculator,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'english',
            icon: Globe,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        },
        {
            id: 'native',
            icon: Feather,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            id: 'history',
            icon: ScrollText,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        },
        {
            id: 'biology',
            icon: Atom,
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
        <section className="py-24 bg-gray-50 dark:bg-slate-900/50 relative overflow-hidden transition-colors duration-300">
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

                {/* Courses Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                >
                    {courses.map((course) => (
                        <motion.div
                            key={course.id}
                            variants={itemVariants}
                            className="group bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/10 hover:-translate-y-1 relative flex flex-col h-full"
                        >
                            <div className={`w-12 h-12 rounded-xl ${course.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <course.icon className={`w-6 h-6 ${course.color}`} />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                {t(`courses.${course.id}`)}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3 flex-grow">
                                {t(`courses.${course.id}.desc`)}
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
