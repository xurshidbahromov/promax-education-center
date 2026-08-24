"use client";

import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

const CallToAction = () => {
 const { t } = useLanguage();

 return (
 <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
 <div className="max-w-7xl mx-auto w-full relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/40 dark:border-slate-700/60"
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent lg:bg-gradient-to-r" />
        </div>

        {/* Content Section */}
        <div className="lg:w-7/12 bg-slate-900/95 dark:bg-slate-950/90 backdrop-blur-xl p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col justify-center border-l border-white/10">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/20 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-brand-orange font-medium text-xs sm:text-sm backdrop-blur-md uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
              </span>
              <Phone size={14} />
              <span>{t('cta.subtitle')}</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter uppercase leading-[1.1] font-fredoka">
              {t('cta.title')}
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-prose leading-relaxed">
              Biz sizga qo'ng'iroq qilamiz va barcha savollaringizga javob beramiz. Kelajagingizni hozirdan boshlang!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium rounded-full text-base shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider"
              >
                <span>{t('cta.button.primary')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-full text-base transition-all backdrop-blur-sm active:scale-95 flex items-center justify-center uppercase tracking-wider"
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
