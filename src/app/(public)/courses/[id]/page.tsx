"use client";

import { useLanguage } from '@/context/LanguageContext';
import { courses } from '@/data/courses';
import { courseDetails } from '@/data/course-details';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
        <div className="-mt-16 w-full pb-20 transition-colors duration-300 relative">
            
            {/* Ambient Background Glows (Original) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* Hero Image Banner - Normal document flow! Takes space and sits behind navbar */}
            <div className="relative w-full h-[300px] md:h-[450px] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shadow-xl z-0">
                <Image 
                    src={course.image} 
                    alt={t(`courses.${course.id}`)} 
                    fill 
                    className="object-cover" 
                    priority 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
                
                {/* Back Button (Floating inside the banner) */}
                <div className="absolute top-24 md:top-32 left-4 sm:left-6 lg:left-8 z-10 max-w-7xl mx-auto w-full">
                    <Link
                        href="/courses"
                        className="inline-flex items-center text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium border border-white/20 shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        {t('nav.courses')}
                    </Link>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                
                {/* Hero Section (LinkedIn Profile Style Header) */}
                {/* -mt-16 to -mt-24 pulls this container UP so it overlaps the banner */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-16 -mt-16 md:-mt-24">
                    
                    {/* Overlapping Floating Icon */}
                    {/* Size: 192px on md. 96px overlaps banner, 96px hangs below */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`w-32 h-32 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] ${course.bg} flex items-center justify-center flex-shrink-0 shadow-2xl border-[6px] border-white dark:border-slate-950 bg-white dark:bg-slate-900 relative z-20`}
                    >
                        <course.icon className={`w-16 h-16 md:w-24 md:h-24 ${course.color}`} />
                    </motion.div>

                    {/* Course Title and Description */}
                    {/* pt pushes the text down so it clears the banner and sits on the page background */}
                    <div className="pt-4 md:pt-28 flex-grow">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight"
                        >
                            {t(`courses.${course.id}`)}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl leading-relaxed"
                        >
                            {t(`courses.${course.id}.long_desc`)}
                        </motion.p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-8">
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
                                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800"
                                        >
                                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-8 flex items-start gap-4">
                                                <span className={`p-3 rounded-xl ${course.bg} ${course.color} mt-1 shadow-sm`}>
                                                    <CheckCircle2 size={28} />
                                                </span>
                                                <span className="leading-tight">{t(program.titleKey)}</span>
                                            </h2>

                                            <ul className="space-y-5 mb-8">
                                                {t(program.featuresKey).split('|').map((feature, fIndex) => (
                                                    <li key={fIndex} className="flex items-start gap-4">
                                                        <div className={`mt-2 w-2.5 h-2.5 rounded-full ${course.color.replace('text-', 'bg-')} flex-shrink-0 shadow-sm`} />
                                                        <span className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                                            {feature.trim()}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {program.priceKey && (
                                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                                                    <span className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                                                        Kurs narxi:
                                                    </span>
                                                    <span className={`text-2xl font-bold ${course.color}`}>
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
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800"
                                >
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-4">
                                        <span className={`p-3 rounded-xl ${course.bg} ${course.color} shadow-sm`}>
                                            <CheckCircle2 size={28} />
                                        </span>
                                        {t('course.methodology')}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-xl leading-relaxed mb-10">
                                        {t('course.methodology.desc')}
                                    </p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map((step) => (
                                            <li key={step} className="flex items-start gap-4 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                                                <div className={`mt-1 w-8 h-8 rounded-full ${course.color.replace('text-', 'bg-')} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm`}>
                                                    {step}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">
                                                        {t(`methodology.step${step}.title`)}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                        {t(`methodology.step${step}.desc`)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.section>
                            )}
                        </div>

                        {/* Sidebar (Right) - Materials */}
                        <div className="lg:col-span-1">
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 sticky top-32"
                            >
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-4">
                                    <span className={`p-3 rounded-xl ${course.bg} ${course.color} shadow-sm`}>
                                        <BookOpen size={28} />
                                    </span>
                                    {t('course.materials')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {t(`courses.${course.id}.materials`)}
                                </p>
                            </motion.section>
                        </div>

                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
