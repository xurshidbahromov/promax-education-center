"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, MapPin, Clock, Target, Users, BookOpen, Award, Play, Quote } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function AboutPage() {
    const { t } = useLanguage();
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoId = "vfC8URnbn20";

    const features = [
        {
            icon: Users,
            title: t('about.feature.teachers.title'),
            desc: t('about.feature.teachers.desc'),
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-800/30"
        },
        {
            icon: BookOpen,
            title: t('about.feature.method.title'),
            desc: t('about.feature.method.desc'),
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-100 dark:border-orange-800/30"
        },
        {
            icon: Target,
            title: t('about.feature.goals.title'),
            desc: t('about.feature.goals.desc'),
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
            border: "border-green-100 dark:border-green-800/30"
        },
        {
            icon: Award,
            title: t('about.feature.results.title'),
            desc: t('about.feature.results.desc'),
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-800/30"
        }
    ];

    return (
        <div className="w-full pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none -z-10" />

            {/* Header */}
            <div className="max-w-7xl mx-auto w-full relative z-10 mb-20 mt-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 tracking-tighter uppercase font-fredoka"
                >
                    {t('nav.about')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed"
                >
                    {t('footer.about.desc')}
                </motion.p>
            </div>

            {/* Video Section (Professional Facade) */}
            <section className="mb-32 relative z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-black"
                    >
                        {!isVideoPlaying ? (
                            <div 
                                className="w-full h-full cursor-pointer relative"
                                onClick={() => setIsVideoPlaying(true)}
                            >
                                <Image
                                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                    alt="Promax Education Video"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
                                
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 hover:bg-red-600 hover:border-red-600 transition-colors duration-300 shadow-md">
                                        <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                title="Promax Education Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0"
                            ></iframe>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Our Mission */}
            <section className="mb-32 relative z-10">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 text-brand-orange mb-8"
                    >
                        <Quote size={32} className="rotate-180" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 tracking-tighter uppercase font-fredoka"
                    >
                        {t('about.mission.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium"
                    >
                        "{t('about.mission.desc')}"
                    </motion.p>
                </div>
            </section>

            {/* Why Choose Us (Features) */}
            <section className="mb-32 relative z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 border ${feature.border} shadow-sm transition-all duration-300 hover:-translate-y-1 group`}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 transition-transform duration-300`}>
                                    <feature.icon size={32} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact & Map Section */}
            <section className="relative z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

                        {/* Contact Info (Premium) */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                        >
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <div>
                                <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-12 relative z-10 tracking-tighter uppercase font-fredoka">{t('footer.contact')}</h2>

                                <div className="space-y-10 relative z-10">
                                    {/* Featured Call Center */}
                                    <div className="bg-gradient-to-br from-brand-blue/5 to-transparent dark:from-blue-900/20 dark:to-transparent p-8 rounded-[2rem] border border-brand-blue/10 dark:border-blue-500/20">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                                                <Phone size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('about.call_center')}</h3>
                                                <p className="text-gray-500 dark:text-gray-400">{t('about.days')}, 9:00 - 18:00</p>
                                            </div>
                                        </div>
                                        <a
                                            href="tel:+998955137776"
                                            className="block text-center bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black py-4 sm:py-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 active:scale-[0.98]"
                                        >
                                            +998 95 513 77 76
                                        </a>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start gap-6 px-2 group">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{t('about.location')}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                                Tashkent, Uzbekistan<br />
                                                Chilanzar District
                                            </p>
                                        </div>
                                    </div>

                                    {/* Working Hours */}
                                    <div className="flex items-start gap-6 px-2 group">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{t('about.working_hours')}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                                {t('about.days')}: 08:00 - 20:00<br />
                                                <span className="text-red-500 dark:text-red-400 font-medium">{t('about.closed')}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Map (Premium wrapper) */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="h-full min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 relative group"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.4496098253762!2d69.20271967584229!3d41.277318271314016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b71f4e5d4a3%3A0xba9e1d41aabd9e0e!2sPROMAX%20EDUCATION!5e0!3m2!1sen!2s!4v1770559904330!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 grayscale-[20%] contrast-125 group-hover:grayscale-0 transition-all duration-700"
                            ></iframe>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
