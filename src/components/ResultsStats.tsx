"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Briefcase, Trophy, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ResultsStats = () => {
 const { t } = useLanguage();

 const stats = [
 {
 id: "students",
 icon: Users,
 value: "5000+",
 },
 {
 id: "experience",
 icon: Briefcase,
 value: "10+",
 },
 {
 id: "teachers",
 icon: GraduationCap,
 value: "30+",
 },
 {
 id: "acceptance",
 icon: Trophy,
 value: "98%",
 }
 ];

 // Double the stats array to create a seamless infinite loop
 const marqueeItems = [...stats, ...stats, ...stats, ...stats];

 return (
    <section className="py-28 sm:py-36 relative overflow-hidden bg-gradient-to-b from-[#004bb5] via-brand-blue to-[#0b244d] flex flex-col justify-center shadow-2xl">
      
      {/* Background Texture / Pattern */}
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }} />
      
      {/* Ambient Radial Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[35rem] h-[35rem] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[35rem] h-[35rem] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mb-12 px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter font-fredoka drop-shadow-md"
        >
          PROMAX <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">NUMBERS</span>
        </motion.h2>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative z-10 flex overflow-hidden whitespace-nowrap w-full py-9 rotate-[-2deg] bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 shadow-2xl shadow-orange-500/25 border-y border-white/20">
        
        {/* Framer Motion Infinite Scroll */}
        <motion.div
          className="flex items-center gap-16 md:gap-24 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 26,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((stat, index) => (
            <div key={`${stat.id}-${index}`} className="flex items-center gap-6">
              <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums font-fredoka drop-shadow-sm">
                {stat.value}
              </h3>
              <div className="flex flex-col items-start justify-center gap-1">
                <span className="text-white font-bold text-xl md:text-2xl uppercase tracking-widest">
                  {t(`home.stats.${stat.id}`)}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <Star className="w-7 h-7 text-white/50 mx-8 fill-white/50" />
            </div>
          ))}
        </motion.div>

      </div>
      
      {/* Secondary Marquee (Reverse Direction) for extra vibe */}
      <div className="relative z-0 flex overflow-hidden whitespace-nowrap w-full py-6 mt-8 opacity-30 select-none pointer-events-none">
        <motion.div
          className="flex items-center gap-12 px-8"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 36,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((stat, index) => (
            <h3 key={`secondary-${stat.id}-${index}`} className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text tracking-tighter font-fredoka uppercase" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
              {t(`home.stats.${stat.id}`)} {stat.value}
            </h3>
          ))}
        </motion.div>
      </div>

    </section>
 );
};

export default ResultsStats;
