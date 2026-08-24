"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { courses, Course } from '@/data/courses';

const CourseCard = ({ course, index }: { course: Course; index: number }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="h-full"
    >
      <Link
        href={`/courses/${course.id}`}
        className="group flex flex-col rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 h-full bg-white dark:bg-slate-900"
      >
        {/* ── 1. TOP BANNER IMAGE (Chuqurroq tushirilgan rasm) ── */}
        <div className="relative w-full h-52 sm:h-56 overflow-hidden shrink-0 bg-slate-900">
          <Image
            src={course.image}
            alt={t(`courses.${course.id}`)}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          
          {/* Top Left Floating Pill Badge on Image */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <div className={`px-3 py-1 rounded-full ${course.bg} backdrop-blur-md border border-white/60 dark:border-white/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm`}>
              <course.icon className={`w-3.5 h-3.5 ${course.color}`} />
              <span className="text-slate-800 dark:text-slate-100 font-fredoka">{t(`courses.${course.id}`)}</span>
            </div>
          </div>
        </div>

        {/* ── 2. SEAMLESS SOLID NOTCHED CARD SHAPE ── */}
        <div className="relative -mt-8 z-20 flex flex-col flex-grow">
          
          {/* Top Row: Left "Batafsil ↘" + Right Solid Raised Tab */}
          <div className="flex items-end justify-between relative z-10">
            {/* Left Shelf: Batafsil Link */}
            <div className="pl-5 pb-2.5 flex items-center shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                <span>Batafsil</span>
                <ArrowDownRight size={14} className="text-brand-orange shrink-0" />
              </span>
            </div>

            {/* Right Solid Tab with Inverted Curve connector */}
            <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-5 py-2.5 rounded-t-2xl flex items-center gap-2 relative shadow-none">
              {/* Inverted concave curve connecting shelf to tab */}
              <svg className="absolute bottom-0 -left-4 w-4 h-4 fill-white dark:fill-slate-900 pointer-events-none" viewBox="0 0 16 16">
                <path d="M16,0 C16,8.836556 8.836556,16 0,16 L16,16 L16,0 Z" />
              </svg>
              <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {course.type === 'general' ? 'Offline Darslar' : course.type === 'certificate' ? 'Xalqaro Sertifikat' : 'OTM Tayyorlov'}
              </span>
            </div>
          </div>

          {/* Main Solid Body (100% Solid white/slate-900) */}
          <div className="bg-white dark:bg-slate-900 rounded-b-[2rem] rounded-tl-[1.8rem] p-5 sm:p-6 text-slate-800 dark:text-white flex flex-col justify-between flex-grow">
            
            {/* Title and Description */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
                {t(`courses.${course.id}`)}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                {t(`courses.${course.id}.desc`)}
              </p>
            </div>

          </div>

        </div>
      </Link>
    </motion.div>
  );
};

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
              <CourseCard key={course.id} course={course} index={index} />
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
              <CourseCard key={course.id} course={course} index={index} />
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
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
