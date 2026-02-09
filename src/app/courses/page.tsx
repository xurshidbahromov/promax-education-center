"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { BookOpen, Calculator, Atom, Globe, ArrowRight, GraduationCap, Languages, ScrollText, Dna } from 'lucide-react';
import { useState } from 'react';
import { TeacherModal } from '@/components/TeacherModal';

export default function CoursesPage() {
    const { t } = useLanguage();
    const [selectedCourse, setSelectedCourse] = useState<{ title: string; id: string } | null>(null);

    const generalCourses = [
        { id: 'math', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'english', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { id: 'physics', icon: Atom, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'korean', icon: Languages, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { id: 'native', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'russian', icon: Languages, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
        { id: 'history', icon: ScrollText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { id: 'biology', icon: Dna, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    const prepCourses = [
        { id: 'prep.inha', icon: GraduationCap, color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { id: 'prep.west', icon: GraduationCap, color: 'text-purple-700', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 transition-colors duration-300">
            <TeacherModal
                isOpen={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
                courseTitle={selectedCourse ? t(`courses.${selectedCourse.id}`) : ''}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
                    >
                        {t('courses.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        {t('courses.subtitle')}
                    </motion.p>
                </div>

                {/* General Subjects */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-brand-blue pl-4">
                        General Subjects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {generalCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                onClick={() => setSelectedCourse({ title: t(`courses.${course.id}`), id: course.id })}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${course.bg}`}>
                                        <course.icon className={`w-8 h-8 ${course.color}`} />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Offline
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t(`courses.${course.id}`)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    {t(`courses.${course.id}.desc`)}
                                </p>
                                <div className="flex items-center text-brand-blue font-semibold text-sm group-hover:underline">
                                    {t('courses.more')}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Certificate Prep */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-purple-600 pl-4">
                        {t('courses.cert.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { id: 'cert.national', icon: ScrollText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                            { id: 'cert.ielts', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                            { id: 'cert.sat', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
                        ].map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                onClick={() => setSelectedCourse({ title: t(`courses.${course.id}`), id: course.id })}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${course.bg}`}>
                                        <course.icon className={`w-8 h-8 ${course.color}`} />
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                                        Certificate
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t(`courses.${course.id}`)}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    {t(`courses.${course.id}.desc`)}
                                </p>
                                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:underline">
                                    {t('courses.more')}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* University Prep */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-brand-orange pl-4">
                        {t('courses.prep.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prepCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                onClick={() => setSelectedCourse({ title: t(`courses.${course.id}`), id: course.id })}
                            >
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className={`w-12 h-12 rounded-xl ${course.bg} flex items-center justify-center mb-6`}>
                                            <course.icon className={`w-6 h-6 ${course.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            {t(`courses.${course.id}`)}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                                            {t(`courses.${course.id}.desc`)}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-brand-orange font-bold group-hover:translate-x-2 transition-transform">
                                        {t('courses.more')}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </div>
                                </div>

                                {/* Decorate Background */}
                                <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${course.bg} rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`} />
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
