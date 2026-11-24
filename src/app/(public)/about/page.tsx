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
      title: t("about.feature.teachers.title"),
      desc: t("about.feature.teachers.desc"),
      accent: "bg-brand-blue/10 text-brand-blue dark:text-blue-400",
    },
    {
      icon: BookOpen,
      title: t("about.feature.method.title"),
      desc: t("about.feature.method.desc"),
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: Target,
      title: t("about.feature.goals.title"),
      desc: t("about.feature.goals.desc"),
      accent: "bg-brand-blue/10 text-brand-blue dark:text-blue-400",
    },
    {
      icon: Award,
      title: t("about.feature.results.title"),
      desc: t("about.feature.results.desc"),
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="w-full pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-14 sm:space-y-16">
        {/* Clean Header */}
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-3.5">
            {t("nav.about")}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {t("footer.about.desc")}
          </p>
        </div>

        {/* Video Showcase */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative aspect-video rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-950"
          >
            {!isVideoPlaying ? (
              <button
                type="button"
                className="w-full h-full cursor-pointer relative block text-left"
                onClick={() => setIsVideoPlaying(true)}
                aria-label="Promax Education Video"
              >
                <Image
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="Promax Education Video"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors duration-300" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/75 backdrop-blur-md flex items-center justify-center border border-white/25 group-hover:bg-red-600 group-hover:border-red-600 active:scale-95 transition-all duration-200 shadow-xl">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white translate-x-0.5" />
                  </div>
                </div>
              </button>
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
              />
            )}
          </motion.div>
        </section>

        {/* Clean Mission Statement */}
        <section>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-8 sm:p-12 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mb-5">
              <Quote size={22} className="rotate-180" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white mb-4">
              {t("about.mission.title")}
            </h2>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
              &ldquo;{t("about.mission.desc")}&rdquo;
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200/80 dark:border-slate-800"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${feature.accent} flex items-center justify-center mb-4`}
                >
                  <feature.icon size={20} strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold font-sans tracking-tight text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact & Map */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Contact Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-6">
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                  {t("footer.contact")}
                </h2>

                {/* Call Center Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 sm:p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand-blue text-white flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                        {t("about.call_center")}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                        {t("about.days")}, 09:00 - 18:00
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:+998955137776"
                    className="block text-center bg-amber-500 hover:bg-amber-600 text-white text-xl sm:text-2xl font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition-all tabular-nums"
                  >
                    +998 95 513 77 76
                  </a>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-0.5 font-sans">
                        {t("about.location")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        {t("footer.address_value")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base mb-0.5 font-sans">
                        {t("about.working_hours")}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tabular-nums">
                        {t("about.days")}: 08:00 - 20:00
                        <br />
                        <span className="text-rose-500 dark:text-rose-400 font-semibold">
                          {t("about.closed")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="min-h-[380px] lg:min-h-[440px] rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.4496098253762!2d69.20271967584229!3d41.277318271314016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b71f4e5d4a3%3A0xba9e1d41aabd9e0e!2sPROMAX%20EDUCATION!5e0!3m2!1sen!2s!4v1770559904330!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
