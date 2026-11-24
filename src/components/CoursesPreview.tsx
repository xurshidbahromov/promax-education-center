"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Calculator, Globe, Dna, ScrollText, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CoursesPreview = () => {
  const { t } = useLanguage();

  const categories = [
    {
      id: "exact",
      icon: Calculator,
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      id: "languages",
      icon: Globe,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      id: "humanities",
      icon: ScrollText,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      id: "science",
      icon: Dna,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
      span: "md:col-span-1 md:row-span-1",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45 },
    },
  };

  return (
    <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white mb-3.5 leading-[1.1]"
            >
              {t("courses.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-prose"
            >
              {t("courses.subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block shrink-0"
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 font-semibold text-sm text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              <span>{t("courses.view_all")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* Clickable Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[240px] md:auto-rows-[285px]"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              className={`group relative rounded-[28px] overflow-hidden border border-white/60 dark:border-slate-800 ${cat.span} [-webkit-mask-image:-webkit-radial-gradient(white,black)]`}
            >
              <Link href="/courses" className="block w-full h-full relative">
                {/* Background Image */}
                <Image
                  src={cat.image}
                  alt={t(`courses.cat.${cat.id}`)}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Top-Right Arrow Indicator */}
                <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-200">
                  <ArrowUpRight size={17} />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-sm">
                    <cat.icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-white mb-1.5">
                    {t(`courses.cat.${cat.id}`)}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm font-medium line-clamp-2 max-w-md">
                    {t(`courses.cat.${cat.id}.desc`)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Link */}
        <div className="mt-7 text-center md:hidden">
          <Link
            href="/courses"
            className="w-full py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-blue dark:text-blue-400 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>{t("courses.view_all")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesPreview;
