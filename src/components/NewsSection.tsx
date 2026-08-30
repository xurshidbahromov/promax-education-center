"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllAnnouncements, Announcement } from "@/lib/announcements";

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
    badgeColor: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    date: "Har yakshanba, 10:00",
    href: "/register"
  },
  {
    id: "olympiad-tournaments",
    title: "Respublika & Xalqaro Olimpiadalar",
    desc: "Onlayn fan olimpiadalarida qatnashing, umumiy reytingda peshqadam bo'ling va maxsus grantlarni yutib oling.",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    badge: "OLIMPIADA",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    date: "Har oy yangi musobaqa",
    href: "/register"
  },
  {
    id: "new-groups",
    title: "Yangi Aniq Fanlar & SAT Guruhlari",
    desc: "Noldan boshlab xalqaro standartlargacha bo'lgan matematika, fizika va kimyo guruhlariga qabul davom etmoqda.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    badge: "YANGI GURUH",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    date: "Qabul ochiq",
    href: "/courses"
  },
  {
    id: "speaking-club",
    title: "English Speaking & Debate Club",
    desc: "Xalqaro instruktorlar bilan erkin muloqot va jonli debatlar orqali so'zlashuv mahoratingizni yangi bosqichga olib chiqing.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    badge: "SPEAKING CLUB",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    date: "Har shanba, 16:00",
    href: "/register"
  }
];

export const NewsSection = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<NewsItem[]>(DEFAULT_NEWS);

  useEffect(() => {
    getAllAnnouncements().then((data) => {
      const activeFeatured = (data || []).filter(a => a.is_active && (a.is_featured || a.image_url));
      if (activeFeatured.length > 0) {
        const mapped: NewsItem[] = activeFeatured.slice(0, 4).map(a => ({
          id: a.id,
          title: a.title,
          desc: a.message,
          image: a.image_url || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
          badge: a.badge || "E'LON",
          badgeColor: a.type === 'error'
            ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
            : a.type === 'warning'
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
            : a.type === 'success'
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
          date: new Date(a.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
          href: "/register"
        }));
        setItems(mapped);
      }
    }).catch(() => {});
  }, []);

  return (
    <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-14 gap-6 md:gap-0">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/70 dark:border-white/10 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
              </span>
              <Megaphone size={13} />
              <span>So'nggi Yangiliklar</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 dark:text-slate-100 mb-4 tracking-tighter uppercase font-fredoka"
            >
              E'lonlar va <span className="text-brand-orange">Yangiliklar</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-prose"
            >
              Promax Education Center hayotidagi eng so'nggi tadbirlar, imtihonlar va maxsus takliflardan xabardor bo'ling.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-medium uppercase tracking-wider text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group text-sm"
            >
              <span>Barcha E'lonlar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
            </Link>
          </motion.div>
        </div>

        {/* News Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white/45 dark:bg-slate-900/45 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/70 dark:border-white/10 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {/* Image Area */}
              <div className="relative aspect-[16/10] w-full overflow-hidden shrink-0 bg-slate-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />
                
                {/* Badge on Image */}
                <div className="absolute top-3.5 left-3.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/60 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2.5">
                    <Calendar size={13} className="text-brand-orange" />
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg leading-snug mb-2 font-fredoka line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3 font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:text-orange-600 uppercase tracking-wider transition-colors"
                  >
                    <span>Batafsil</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/register"
            className="w-full py-4 rounded-full bg-white/70 dark:bg-slate-900/70 border-2 border-brand-blue dark:border-blue-400 text-brand-blue dark:text-blue-400 font-medium text-center flex items-center justify-center gap-2 hover:bg-brand-blue hover:text-white transition-all active:scale-95 shadow-sm uppercase tracking-wider"
          >
            <span>Barcha E'lonlar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default NewsSection;
