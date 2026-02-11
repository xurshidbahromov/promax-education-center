"use client";

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

const CallToAction = () => {
    const { t } = useLanguage();

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-brand-blue dark:bg-blue-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl"
                >
                    {/* Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                        <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-gradient-to-br from-white/10 to-transparent rotate-12 blur-3xl"></div>
                        <div className="absolute -bottom-[50%] -right-[20%] w-[80%] h-[150%] bg-gradient-to-tl from-brand-orange/20 to-transparent -rotate-12 blur-3xl"></div>
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium backdrop-blur-sm border border-white/10">
                            <Sparkles size={16} className="text-brand-orange" />
                            <span>Promax Education</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                            {t('cta.title')}
                        </h2>

                        <p className="text-xl text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
                            {t('cta.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-white text-brand-blue font-bold rounded-xl text-lg shadow-lg hover:shadow-xl hover:bg-gray-50 hover:transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                {t('cta.button.primary')}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/courses"
                                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            >
                                {t('cta.button.secondary')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToAction;
