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
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/20"
    },
    {
      icon: BookOpen,
      title: t('about.feature.method.title'),
      desc: t('about.feature.method.desc'),
      color: "text-orange-500",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-orange-500/20"
    },
    {
      icon: Target,
      title: t('about.feature.goals.title'),
      desc: t('about.feature.goals.desc'),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/20"
    },
    {
      icon: Award,
      title: t('about.feature.results.title'),
      desc: t('about.feature.results.desc'),
      color: "text-purple-500",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      border: "border-purple-500/20"
    }
  ];

  return (
    <div className="w-full pt-28 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl mx-auto w-full relative z-10 mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-semibold text-slate-800 dark:text-slate-100 mb-6 tracking-tighter uppercase font-fredoka"
        >
          {t('nav.about')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium"
        >
          {t('footer.about.desc')}
        </motion.p>
      </div>

      {/* Video Section (Professional Facade) */}
      <section className="mb-28 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-2xl border border-white/70 dark:border-white/10 bg-slate-950"
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
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/30 dark:bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/60 dark:border-white/20 group-hover:bg-red-600 group-hover:border-red-600 active:scale-95 transition-all duration-300 shadow-2xl group-hover:shadow-red-600/40">
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
      <section className="mb-28 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl border border-white/70 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-2xl text-center relative overflow-hidden"
          >
            {/* Ambient Corner Glows */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-brand-orange mb-6 border border-orange-500/20">
              <Quote size={28} className="rotate-180" />
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-800 dark:text-slate-100 mb-6 tracking-tighter uppercase font-fredoka">
              {t('about.mission.title')}
            </h2>
            <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
              "{t('about.mission.desc')}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us (Features) */}
      <section className="mb-28 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2rem] p-7 sm:p-8 border border-white/70 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-2xl hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 shadow-sm border ${feature.border}`}>
                  <feature.icon size={24} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 font-fredoka">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">

            {/* Contact Info (Premium) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/70 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-2xl relative overflow-hidden flex flex-col justify-between"
            >
              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-slate-100 mb-8 relative z-10 tracking-tighter uppercase font-fredoka">{t('footer.contact')}</h2>

                <div className="space-y-8 relative z-10">
                  {/* Featured Call Center */}
                  <div className="bg-gradient-to-br from-brand-blue/10 via-blue-500/5 to-transparent dark:from-blue-900/30 dark:to-transparent p-7 rounded-[2rem] border border-brand-blue/20 dark:border-blue-500/30 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 p-3">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-fredoka">{t('about.call_center')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('about.days')}, 9:00 - 18:00</p>
                      </div>
                    </div>
                    <a
                      href="tel:+998955137776"
                      className="block text-center bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-2xl sm:text-3xl md:text-4xl font-bold py-4 rounded-[1.5rem] shadow-xl shadow-brand-blue/25 hover:shadow-brand-blue/40 transition-all duration-300 active:scale-[0.98] font-fredoka tracking-wider"
                    >
                      +998 95 513 77 76
                    </a>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-5 px-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-brand-orange flex-shrink-0 border border-orange-500/20 group-hover:scale-110 transition-transform">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg mb-1 font-fredoka">{t('about.location')}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
                        Tashkent, Uzbekistan<br />
                        Chilanzar District
                      </p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-5 px-2 group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-brand-blue dark:text-blue-400 flex-shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Clock size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg mb-1 font-fredoka">{t('about.working_hours')}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base font-medium">
                        {t('about.days')}: 08:00 - 20:00<br />
                        <span className="text-red-500 dark:text-red-400 font-bold">{t('about.closed')}</span>
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
              className="h-full min-h-[480px] rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-2xl border border-white/70 dark:border-white/10 bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl relative group"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.4496098253762!2d69.20271967584229!3d41.277318271314016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b71f4e5d4a3%3A0xba9e1d41aabd9e0e!2sPROMAX%20EDUCATION!5e0!3m2!1sen!2s!4v1770559904330!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale-[15%] contrast-125 group-hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
