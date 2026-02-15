"use client";

import { useLanguage } from '@/context/LanguageContext';
import { courses } from '@/data/courses';
import { courseDetails } from '@/data/course-details';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, User, CheckCircle2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

export default function CourseDetailPage() {
    const { t } = useLanguage();
    const params = useParams();
    const id = params?.id as string;

    const course = courses.find((c) => c.id === id);

    if (!course) {
        return notFound();
    }

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Button */}
                <Link
                    href="/courses"
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t('nav.courses')}
                </Link>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl ${course.bg} flex items-center justify-center flex-shrink-0`}
                    >
                        <course.icon className={`w-12 h-12 md:w-16 md:h-16 ${course.color}`} />
                    </motion.div>

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4"
                        >
                            {t(`courses.${course.id}`)}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed"
                        >
                            {t(`courses.${course.id}.long_desc`)}
                        </motion.p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Methodology Section / Detailed Programs */}
                        {courseDetails[id] ? (
                            <div className="space-y-8">
                                {courseDetails[id].programs.map((program, index) => (
                                    <motion.section
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800"
                                    >
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-start gap-3">
                                            <span className={`p-2 rounded-lg ${course.bg} ${course.color} mt-1`}>
                                                <CheckCircle2 size={24} />
                                            </span>
                                            <span>{t(program.titleKey)}</span>
                                        </h2>

                                        <ul className="space-y-4 mb-6">
                                            {t(program.featuresKey).split('|').map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-start gap-3">
                                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                                                    <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {feature.trim()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {program.priceKey && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                                    Narxi:
                                                </span>
                                                <span className="text-xl font-bold text-brand-blue">
                                                    {t(program.priceKey)}
                                                </span>
                                            </div>
                                        )}
                                    </motion.section>
                                ))}
                            </div>
                        ) : (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className={`p-2 rounded-lg ${course.bg} ${course.color}`}>
                                        <CheckCircle2 size={24} />
                                    </span>
                                    {t('course.methodology')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                                    {t('course.methodology.desc')}
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((step) => (
                                        <li key={step} className="flex items-start gap-3 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                                                    {t(`methodology.step${step}.title`)}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t(`methodology.step${step}.desc`)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.section>
                        )}

                        {/* Materials Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-800"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className={`p-2 rounded-lg ${course.bg} ${course.color}`}>
                                    <BookOpen size={24} />
                                </span>
                                {t('course.materials')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                {t(`courses.${course.id}.materials`)}
                            </p>
                        </motion.section>

                    </div>

                    {/* Sidebar (Right) - Teacher Profile */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-800 sticky top-24"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <User className="text-gray-400" size={24} />
                                {t('course.teacher')}
                            </h2>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-slate-800 mb-6 flex items-center justify-center text-gray-300 dark:text-slate-600 border-4 border-white dark:border-slate-700 shadow-lg">
                                    <User size={64} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {t(`courses.${course.id}.teacher_name`)}
                                </h3>
                                <p className={`text-sm font-bold ${course.color} uppercase tracking-wider mb-6`}>
                                    {t(`courses.${course.id}`)} Expert
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                    {t(`courses.${course.id}.teacher_bio`)}
                                </p>

                                <button className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                                    {t('hero.cta.primary')}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
