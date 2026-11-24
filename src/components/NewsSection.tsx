"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllAnnouncements } from "@/lib/announcements";

interface NewsItem {
  id: string;
  title: string;
  desc: string;
  image: string;
  badge: string;
  badgeColor: string;
  date: string;
  href: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "mock-exam",
    title: "MOCK IELTS & SAT Imtihonlari",
    desc: "O'z bilimingizni haqiqiy imtihon muhitida sinab ko'ring va rasmiy ballaringizni professional tahlil bilan oling.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    badge: "MOCK EXAM",
    badgeColor: "bg-red-500/85 text-white border-red-400/30",
    date: "Har yakshanba, 10:00",
    href: "/register",
  },
  {
    id: "olympiad-tournaments",
    title: "Respublika & Xalqaro Olimpiadalar",
    desc: "Onlayn fan olimpiadalarida qatnashing, umumiy reytingda peshqadam bo'ling va maxsus grantlarni yutib oling.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    badge: "OLIMPIADA",
    badgeColor: "bg-blue-600/85 text-white border-blue-400/30",
    date: "Har oy yangi musobaqa",
    href: "/register",
  },
  {
    id: "new-groups",
    title: "Yangi Aniq Fanlar & SAT Guruhlari",
    desc: "Noldan boshlab xalqaro standartlargacha bo'lgan matematika, fizika va kimyo guruhlariga qabul davom etmoqda.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    badge: "YANGI GURUH",
    badgeColor: "bg-emerald-600/85 text-white border-emerald-400/30",
    date: "Qabul ochiq",
    href: "/courses",
  },
  {
    id: "speaking-club",
    title: "English Speaking & Debate Club",
    desc: "Xalqaro instruktorlar bilan erkin muloqot va jonli debatlar orqali so'zlashuv mahoratingizni yangi bosqichga olib chiqing.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    badge: "SPEAKING CLUB",
    badgeColor: "bg-amber-500/90 text-white border-amber-400/30",
    date: "Har shanba, 16:00",
    href: "/register",
  },
];

export const NewsSection = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<NewsItem[]>(DEFAULT_NEWS);

  useEffect(() => {
    getAllAnnouncements()
      .then((data) => {
        const activeFeatured = (data || []).filter((a) => a.is_active && (a.is_featured || a.image_url));
        if (activeFeatured.length > 0) {
          const mapped: NewsItem[] = activeFeatured.slice(0, 4).map((a) => ({
            id: a.id,
            title: a.title,
            desc: a.message,
            image:
              a.image_url ||
              "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
            badge: a.badge || "E'LON",
            badgeColor:
              a.type === "error"
                ? "bg-red-500/85 text-white border-red-400/30"
                : a.type === "warning"
                ? "bg-amber-500/90 text-white border-amber-400/30"
                : a.type === "success"
                ? "bg-emerald-600/85 text-white border-emerald-400/30"
                : "bg-blue-600/85 text-white border-blue-400/30",
            date: new Date(a.created_at).toLocaleDateString("uz-UZ", {
              month: "short",
              day: "numeric",
            }),
            href: "/register",
          }));
          setItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <Megaphone size={13} />
              <span>{t("news.badge")}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white mb-3.5 leading-[1.1]"
            >
              {t("news.title")}{" "}
              <span className="text-amber-500">{t("news.title_accent")}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-prose"
            >
              {t("news.subtitle")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block shrink-0"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-semibold text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group text-sm"
            >
              <span>{t("news.view_all")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* News Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="h-full"
            >
              <Link
                href={item.href}
                className="group h-full bg-white dark:bg-slate-900 rounded-[26px] overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/45 active:scale-[0.99] transition-all duration-200 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0 bg-slate-900">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-black/15 to-transparent" />

                  <div className="absolute top-3.5 left-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                      <Calendar size={13} className="text-amber-500 shrink-0" />
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-semibold font-sans tracking-tight text-slate-900 dark:text-white text-base sm:text-[17px] leading-snug mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3 font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{t("news.details")}</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All CTA */}
        <div className="mt-7 text-center md:hidden">
          <Link
            href="/register"
            className="w-full py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-blue dark:text-blue-400 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>{t("news.view_all")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
