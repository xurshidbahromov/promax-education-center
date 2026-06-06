"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { courses } from '@/data/courses';



export default function CoursesPage() {
    const { t } = useLanguage();

    const generalCourses = courses.filter(c => c.type === 'general');
    const certCourses = courses.filter(c => c.type === 'certificate');
    const prepCourses = courses.filter(c => c.type === 'prep');

    return (
        <div className="w-full pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto w-full relative z-10">

                {/* Left Aligned Header */}
                <div className="mb-16 relative mt-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 tracking-tight"
                    >
                        {t('courses.title')}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed"
                    >
                        {t('courses.subtitle')}
                    </motion.p>
                </div>

                {/* General Subjects */}
                <div className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
                        <div className="w-16 h-1.5 bg-gradient-to-r from-brand-blue to-blue-400 rounded-full" />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {t('courses.categories.general')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {generalCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="group flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] shadow-md border border-white/40 dark:border-white/10 hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                                >
                                    {/* Banner Image - Tighter height */}
                                    <div className="relative w-full h-24 sm:h-28 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                                        <Image src={course.image} alt={t(`courses.${course.id}`)} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:opacity-50 transition-opacity duration-500" />
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="p-5 sm:p-6 flex-grow flex flex-col relative z-10 bg-white/40 dark:bg-slate-900/40">
                                        
                                        {/* Icon overlapping banner, Title safely below */}
                                        <div className="relative z-20 mb-4 -mt-10 sm:-mt-12">
                                            {/* Absolute Icon */}
                                            <div className={`absolute top-0 left-0 p-2 sm:p-2.5 rounded-2xl ${course.bg} shadow-sm border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 transition-transform duration-500 shrink-0`}>
                                                <course.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${course.color}`} />
                                            </div>
                                            
                                            {/* Title with left padding to avoid icon */}
                                            <h3 className="pl-[68px] sm:pl-[76px] pt-[22px] sm:pt-[26px] text-lg sm:text-xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                                                {t(`courses.${course.id}`)}
                                            </h3>
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base leading-relaxed flex-grow">
                                            {t(`courses.${course.id}.desc`)}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-black/5 dark:border-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                Offline
                                            </div>
                                            <div className="flex items-center text-brand-blue font-bold text-sm transition-transform duration-300">
                                                {t('courses.more')}
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Certificate Prep */}
                <div className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
                        <div className="w-16 h-1.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {t('courses.cert.title')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {certCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="group flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] shadow-md border border-white/40 dark:border-white/10 hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                                >
                                    <div className="relative w-full h-24 sm:h-28 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                                        <Image src={course.image} alt={t(`courses.${course.id}`)} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:opacity-50 transition-opacity duration-500" />
                                    </div>
                                    
                                    <div className="p-5 sm:p-6 flex-grow flex flex-col relative z-10 bg-white/40 dark:bg-slate-900/40">
                                        <div className="relative z-20 mb-4 -mt-10 sm:-mt-12">
                                            <div className={`absolute top-0 left-0 p-2 sm:p-2.5 rounded-2xl ${course.bg} shadow-sm border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 transition-transform duration-500 shrink-0`}>
                                                <course.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${course.color}`} />
                                            </div>
                                            <h3 className="pl-[68px] sm:pl-[76px] pt-[22px] sm:pt-[26px] text-lg sm:text-xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                                                {t(`courses.${course.id}`)}
                                            </h3>
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base leading-relaxed flex-grow">
                                            {t(`courses.${course.id}.desc`)}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="bg-purple-50/80 dark:bg-purple-500/10 backdrop-blur-md border border-purple-100 dark:border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                                                Certificate
                                            </div>
                                            <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-sm transition-transform duration-300">
                                                {t('courses.more')}
                                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* University Prep */}
                <div className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
                        <div className="w-16 h-1.5 bg-gradient-to-r from-brand-orange to-orange-400 rounded-full" />
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            {t('courses.prep.title')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prepCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                                className="h-full"
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="group flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] shadow-md border border-white/40 dark:border-white/10 hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                                >
                                    <div className="relative w-full h-32 sm:h-36 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                                        <Image src={course.image} alt={t(`courses.${course.id}`)} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:opacity-50 transition-opacity duration-500" />
                                    </div>
                                    
                                    <div className="p-6 sm:p-8 flex-grow flex flex-col relative z-10 bg-white/40 dark:bg-slate-900/40">
                                        <div className="relative z-20 mb-4 -mt-12 sm:-mt-14">
                                            <div className={`absolute top-0 left-0 p-3 sm:p-3.5 rounded-2xl ${course.bg} shadow-sm border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 transition-transform duration-500 shrink-0`}>
                                                <course.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${course.color}`} />
                                            </div>
                                            <h3 className="pl-[84px] sm:pl-[96px] pt-[26px] sm:pt-[30px] text-xl sm:text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">
                                                {t(`courses.${course.id}`)}
                                            </h3>
                                        </div>
                                        
                                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg leading-relaxed flex-grow">
                                            {t(`courses.${course.id}.desc`)}
                                        </p>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="bg-orange-50/80 dark:bg-orange-500/10 backdrop-blur-md border border-orange-100 dark:border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-brand-orange dark:text-orange-300 uppercase tracking-wider">
                                                Intensive
                                            </div>
                                            <div className="flex items-center text-brand-orange font-bold text-base transition-transform duration-300">
                                                {t('courses.more')}
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
