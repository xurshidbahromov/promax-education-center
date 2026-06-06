"use client";

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

const CallToAction = () => {
    const { t } = useLanguage();

    return (
        <section className="pt-16 pb-24 relative px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
                >
                    {/* Image Section */}
                    <div className="lg:w-5/12 relative min-h-[300px] lg:min-h-full">
                        <Image
                            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop"
                            alt="Student learning"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent lg:bg-gradient-to-r" />
                    </div>

                    {/* Content Section */}
                    <div className="lg:w-7/12 bg-slate-800/90 dark:bg-slate-900/80 backdrop-blur-md p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col justify-center border-l border-white/5">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/20 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-orange font-bold text-sm backdrop-blur-md uppercase tracking-wider">
                                <Phone size={16} />
                                <span>{t('cta.subtitle')}</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-[1.1] font-fredoka">
                                {t('cta.title')}
                            </h2>

                            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-xl">
                                Biz sizga qo'ng'iroq qilamiz va barcha savollaringizga javob beramiz. Kelajagingizni hozirdan boshlang!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Link
                                    href="/register"
                                    className="group px-8 py-5 bg-brand-orange text-white font-black rounded-full text-lg hover:bg-orange-600 transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-wider"
                                >
                                    {t('cta.button.primary')}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                                </Link>
                                <Link
                                    href="/courses"
                                    className="px-8 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-full text-lg hover:bg-white/10 transition-colors backdrop-blur-sm active:scale-[0.98] flex items-center justify-center uppercase tracking-wider"
                                >
                                    {t('cta.button.secondary')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToAction;
