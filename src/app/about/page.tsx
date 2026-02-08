"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, MapPin, Clock, Target, Users, BookOpen, Award, Send, Instagram, Youtube } from "lucide-react";

export default function AboutPage() {
    const { t } = useLanguage();

    const features = [
        {
            icon: Users,
            title: t('about.feature.teachers.title'),
            desc: t('about.feature.teachers.desc'),
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: BookOpen,
            title: t('about.feature.method.title'),
            desc: t('about.feature.method.desc'),
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            icon: Target,
            title: t('about.feature.goals.title'),
            desc: t('about.feature.goals.desc'),
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20"
        },
        {
            icon: Award,
            title: t('about.feature.results.title'),
            desc: t('about.feature.results.desc'),
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        }
    ];

    return (
        <div className="pt-24 min-h-screen">
            {/* Header */}
            <section className="text-center py-16 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
                >
                    {t('nav.about')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                >
                    {t('footer.about.desc')}
                </motion.p>
            </section>

            {/* Video Section */}
            <section className="py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10"
                    >
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/vfC8URnbn20?si=Dy_w2Q1qDLypDMIn"
                            title="Promax Education Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0"
                        ></iframe>
                    </motion.div>
                </div>
            </section>

            {/* Our Mission */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
                    >
                        {t('about.mission.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                    >
                        {t('about.mission.desc')}
                    </motion.p>
                </div>
            </section>

            {/* Why Choose Us (Features) */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-gray-100 dark:border-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact & Map Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Contact Info (Enhanced) */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 relative z-10">{t('footer.contact')}</h2>

                            <div className="space-y-8 relative z-10">
                                {/* Featured Call Center */}
                                <div className="bg-brand-blue/5 dark:bg-blue-900/10 p-6 rounded-2xl border border-brand-blue/10 dark:border-blue-500/20">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('about.call_center')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('about.days')}, 9:00 - 18:00</p>
                                        </div>
                                    </div>
                                    <a
                                        href="tel:+998955137776"
                                        className="block text-center bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 text-2xl font-black py-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:scale-[1.02] transition-transform"
                                    >
                                        +998 95 513 77 76
                                    </a>
                                </div>

                                {/* Location */}
                                <div className="flex items-start gap-5 px-2">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('about.location')}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Tashkent, Uzbekistan<br />
                                            Chilanzar District
                                        </p>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className="flex items-start gap-5 px-2">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('about.working_hours')}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {t('about.days')}: 08:00 - 20:00<br />
                                            <span className="text-red-500 dark:text-red-400">{t('about.closed')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="h-[535px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10"
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.4496098253762!2d69.20271967584229!3d41.277318271314016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b71f4e5d4a3%3A0xba9e1d41aabd9e0e!2sPROMAX%20EDUCATION!5e0!3m2!1sen!2s!4v1770559904330!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
