"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Briefcase, Trophy, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ResultsStats = () => {
  const { t } = useLanguage();

  const stats = [
    { id: "students", icon: Users, value: "5000+" },
    { id: "experience", icon: Briefcase, value: "10+" },
    { id: "teachers", icon: GraduationCap, value: "30+" },
    { id: "acceptance", icon: Trophy, value: "98%" },
  ];

  const marqueeItems = [...stats, ...stats, ...stats, ...stats];

  return (
    <section
      className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-[#004bb5] via-brand-blue to-[#0b244d] flex flex-col justify-center"
      style={{
        backgroundImage:
          "radial-gradient(circle at 25% 50%, rgba(96,165,250,0.22) 0%, transparent 48%), radial-gradient(circle at 78% 50%, rgba(245,158,11,0.20) 0%, transparent 48%), linear-gradient(to bottom, #004bb5, #0056D2, #0b244d)",
      }}
    >
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 mb-12 px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight font-sans"
        >
          <span className="font-brand font-black uppercase tracking-[0.06em]">PROMAX</span>{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            NUMBERS
          </span>
        </motion.h2>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative z-10 flex overflow-hidden whitespace-nowrap w-full py-8 rotate-[-1.5deg] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 shadow-2xl shadow-orange-500/20 border-y border-white/20">
        <motion.div
          className="flex items-center gap-14 md:gap-20 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 26, ease: "linear", repeat: Infinity }}
        >
          {marqueeItems.map((stat, index) => (
            <div key={`${stat.id}-${index}`} className="flex items-center gap-5">
              <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tight tabular-nums font-sans">
                {stat.value}
              </h3>
              <div className="flex flex-col items-start justify-center gap-1">
                <span className="text-white font-semibold text-lg md:text-xl uppercase tracking-wider">
                  {t(`home.stats.${stat.id}`)}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <Star className="w-6 h-6 text-white/45 mx-6 fill-white/45" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Secondary Marquee (Reverse Direction) */}
      <div className="relative z-0 flex overflow-hidden whitespace-nowrap w-full py-5 mt-7 opacity-25 select-none pointer-events-none">
        <motion.div
          className="flex items-center gap-12 px-8"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 36, ease: "linear", repeat: Infinity }}
        >
          {marqueeItems.map((stat, index) => (
            <h3
              key={`secondary-${stat.id}-${index}`}
              className="text-6xl md:text-[8rem] font-bold text-transparent bg-clip-text tracking-tight font-sans uppercase tabular-nums"
              style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.35)" }}
            >
              {t(`home.stats.${stat.id}`)} {stat.value}
            </h3>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ResultsStats;
