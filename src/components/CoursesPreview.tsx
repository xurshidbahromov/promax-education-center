"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Calculator, Globe, Dna, ScrollText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CoursesPreview = () => {
    const { t } = useLanguage();

    const categories = [
        {
            id: 'exact',
            icon: Calculator,
            image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
            span: "md:col-span-2 md:row-span-2",
        },
        {
            id: 'languages',
            icon: Globe,
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
            span: "md:col-span-2 md:row-span-1",
        },
        {
            id: 'humanities',
            icon: ScrollText,
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&auto=format&fit=crop",
            span: "md:col-span-1 md:row-span-1",
        },
        {
            id: 'science',
            icon: Dna,
            image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
            span: "md:col-span-1 md:row-span-1",
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
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="pt-24 pb-12 relative px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full relative z-10">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-12 gap-6 md:gap-0">
                    <div className="max-w-2xl">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter uppercase"
                        >
                            {t('courses.title')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium"
                        >
                            {t('courses.subtitle')}
                        </motion.p>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mt-6 md:mt-0 hidden md:block"
                    >
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                        >
                            {t('courses.view_all')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                        </Link>
                    </motion.div>
                </div>

                {/* Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]"
                >
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            variants={itemVariants}
                            className={`group relative rounded-3xl overflow-hidden shadow-lg ${cat.span} cursor-pointer [-webkit-mask-image:-webkit-radial-gradient(white,black)]`}
                        >
                            {/* Background Image */}
                            <Image
                                src={cat.image}
                                alt={cat.id}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                                <div className="w-14 h-14 rounded-2xl bg-brand-orange/90 backdrop-blur-sm flex items-center justify-center mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <cat.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    {t(`courses.cat.${cat.id}`)}
                                </h3>

                                <p className="text-white/80 font-medium line-clamp-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                                    {t(`courses.cat.${cat.id}.desc`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mobile View All Link */}
                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/courses"
                        className="w-full py-4 rounded-full border-2 border-brand-blue text-brand-blue font-bold text-center flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all active:scale-95 group"
                    >
                        {t('courses.view_all')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default CoursesPreview;
