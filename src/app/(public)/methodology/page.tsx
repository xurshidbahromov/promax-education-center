"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import Image from 'next/image';

const MethodologyPage = () => {
  const { t } = useLanguage();

  const steps = [
    {
      id: 'step1',
      icon: ClipboardList,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      border: 'border-blue-500/20',
      glow: 'from-blue-500/20 to-cyan-500/20',
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'step2',
      icon: CheckCircle2,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      border: 'border-orange-500/20',
      glow: 'from-orange-500/20 to-amber-500/20',
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'step3',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      border: 'border-emerald-500/20',
      glow: 'from-emerald-500/20 to-teal-500/20',
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    },
    {
      id: 'step4',
      icon: Award,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      border: 'border-purple-500/20',
      glow: 'from-purple-500/20 to-pink-500/20',
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
    }
  ];

  return (
    <div className="w-full pt-28 sm:pt-36 lg:pt-40 pb-20 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Left Aligned Header */}
          <div className="mb-20 relative mt-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-semibold text-slate-800 dark:text-slate-100 mb-6 tracking-tighter uppercase font-fredoka"
            >
              {t('methodology.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium"
            >
              {t('methodology.subtitle')}
            </motion.p>
          </div>

          {/* Premium Steps Section */}
          <section className="space-y-32 md:space-y-44 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center relative`}
              >
                {/* Connecting Line (Desktop Only) - except for last item */}
                {index !== steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[60%] bottom-[-80%] left-1/2 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800 -translate-x-1/2 -z-10" />
                )}

                {/* Text Content */}
                <div className="flex-1 space-y-6 relative">
                  {/* Giant Watermark Number */}
                  <div className="absolute -top-12 -left-6 text-[12rem] font-black text-slate-800/[0.03] dark:text-slate-100/[0.02] -z-10 select-none leading-none font-fredoka">
                    {t(`methodology.${step.id}.num`)}
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.bg} ${step.color} shadow-sm border ${step.border} backdrop-blur-md`}>
                      <step.icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm sm:text-base font-bold uppercase tracking-widest ${step.color} font-fredoka`}>
                      Qadam {t(`methodology.${step.id}.num`)}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-800 dark:text-slate-100 leading-tight tracking-tighter uppercase font-fredoka">
                    {t(`methodology.${step.id}.title`)}
                  </h2>

                  <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {t(`methodology.${step.id}.desc`)}
                  </p>
                  
                  <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed pl-4 border-l-4 border-brand-orange">
                    {t('hero.subheadline')} 
                  </p>
                </div>

                {/* Visual/Image (Premium Glassmorphism Card) */}
                <div className="flex-1 w-full relative group">
                  {/* Glow behind image */}
                  <div className={`absolute -inset-3 bg-gradient-to-r ${step.glow} rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-90 transition-opacity duration-700`} />
                  
                  <div className={`relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/80 dark:border-slate-800/80 bg-slate-900`}>
                    <Image
                      src={step.image}
                      alt={t(`methodology.${step.id}.title`)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />
                    
                    {/* Floating Badge inside image */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
                        <div className={`w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center ${step.color} shadow-md shrink-0 border border-slate-100 dark:border-slate-700`}>
                          <step.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div className="text-slate-800 dark:text-slate-100 font-bold text-base sm:text-lg line-clamp-1 font-fredoka">
                          {t(`methodology.${step.id}.title`)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
