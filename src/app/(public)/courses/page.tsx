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
    <div className="w-full pt-28 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      
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
            className="text-4xl md:text-6xl font-semibold text-slate-800 dark:text-slate-100 mb-6 tracking-tighter uppercase font-fredoka"
          >
            {t('courses.title')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium"
          >
            {t('courses.subtitle')}
          </motion.p>
        </div>

        {/* General Subjects */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
            <div className="w-16 h-1.5 bg-gradient-to-r from-brand-blue to-blue-400 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-fredoka">
              {t('courses.categories.general')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {generalCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="h-full"
              >
                <Link
                  href={`/courses/${course.id}`}
                  className="group flex flex-col bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2rem] shadow-sm hover:shadow-xl border border-white/70 dark:border-white/10 transition-shadow duration-300 h-full overflow-hidden"
                >
                  {/* Banner Image */}
                  <div className="relative w-full h-36 sm:h-40 md:h-44 overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={course.image}
                      alt={t(`courses.${course.id}`)}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex-grow flex flex-col relative z-10 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/60 dark:border-white/10">
                    
                    {/* Icon & Title Row (Side-by-side with perfect vertical baseline alignment) */}
                    <div className="flex items-end gap-3.5 mb-3.5 -mt-10 relative z-20">
                      <div className={`w-12 h-12 rounded-2xl ${course.bg} shadow-md border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0`}>
                        <course.icon className={`w-6 h-6 ${course.color}`} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka pb-1 leading-snug">
                        {t(`courses.${course.id}`)}
                      </h3>
                    </div>
                    
                    {/* Course Description */}
                    <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm leading-relaxed flex-grow font-medium">
                      {t(`courses.${course.id}.desc`)}
                    </p>
                    
                    {/* Bottom CTA Row */}
                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 px-3 py-0.5 rounded-full text-xs font-semibold text-brand-blue dark:text-blue-400 uppercase tracking-wider">
                        Offline
                      </div>
                      <div className="flex items-center text-brand-blue dark:text-blue-400 font-semibold text-sm">
                        <span>{t('courses.more')}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
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
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-fredoka">
              {t('courses.cert.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                className="h-full"
              >
                <Link
                  href={`/courses/${course.id}`}
                  className="group flex flex-col bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2rem] shadow-sm hover:shadow-xl border border-white/70 dark:border-white/10 transition-shadow duration-300 h-full overflow-hidden"
                >
                  <div className="relative w-full h-36 sm:h-40 md:h-44 overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={course.image}
                      alt={t(`courses.${course.id}`)}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="p-5 sm:p-6 flex-grow flex flex-col relative z-10 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/60 dark:border-white/10">
                    <div className="flex items-end gap-3.5 mb-3.5 -mt-10 relative z-20">
                      <div className={`w-12 h-12 rounded-2xl ${course.bg} shadow-md border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0`}>
                        <course.icon className={`w-6 h-6 ${course.color}`} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka pb-1 leading-snug">
                        {t(`courses.${course.id}`)}
                      </h3>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm leading-relaxed flex-grow font-medium">
                      {t(`courses.${course.id}.desc`)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 px-3 py-0.5 rounded-full text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Certificate
                      </div>
                      <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                        <span>{t('courses.more')}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
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
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-fredoka">
              {t('courses.prep.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {prepCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                className="h-full"
              >
                <Link
                  href={`/courses/${course.id}`}
                  className="group flex flex-col bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2rem] shadow-sm hover:shadow-xl border border-white/70 dark:border-white/10 transition-shadow duration-300 h-full overflow-hidden"
                >
                  <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden shrink-0 bg-slate-900">
                    <Image
                      src={course.image}
                      alt={t(`courses.${course.id}`)}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="p-6 sm:p-7 flex-grow flex flex-col relative z-10 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/60 dark:border-white/10">
                    <div className="flex items-end gap-3.5 mb-3.5 -mt-10 relative z-20">
                      <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${course.bg} shadow-md border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0`}>
                        <course.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${course.color}`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka pb-1 leading-snug">
                        {t(`courses.${course.id}`)}
                      </h3>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm sm:text-base leading-relaxed flex-grow font-medium">
                      {t(`courses.${course.id}.desc`)}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 px-3.5 py-1 rounded-full text-xs font-semibold text-brand-orange dark:text-orange-400 uppercase tracking-wider">
                        Intensive
                      </div>
                      <div className="flex items-center text-brand-orange dark:text-orange-400 font-semibold text-sm sm:text-base">
                        <span>{t('courses.more')}</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
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
