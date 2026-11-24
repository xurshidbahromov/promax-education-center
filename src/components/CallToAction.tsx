"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import Image from "next/image";

const CallToAction = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-200/70 dark:border-slate-800"
        >
          {/* Image Section */}
          <div className="lg:w-5/12 relative min-h-[260px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop"
              alt="Student learning"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent lg:bg-gradient-to-r" />
          </div>

          {/* Content Section (Zero GPU blur radial gradient) */}
          <div
            className="lg:w-7/12 bg-slate-900 dark:bg-slate-950 p-8 sm:p-12 md:p-16 relative overflow-hidden flex flex-col justify-center lg:border-l border-white/10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 92% 8%, rgba(245,158,11,0.22) 0%, transparent 48%), radial-gradient(circle at 8% 92%, rgba(0,86,210,0.28) 0%, transparent 48%)",
            }}
          >
            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <Phone size={13} />
                <span>{t("cta.subtitle")}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans text-white tracking-tight leading-[1.1]">
                {t("cta.title")}
              </h2>

              <p className="text-base sm:text-lg text-slate-300 font-medium max-w-prose leading-relaxed">
                {t("cta.desc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-3">
                <Link
                  href="/register"
                  className="px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full text-sm sm:text-base shadow-lg shadow-amber-500/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                >
                  <span>{t("cta.button.primary")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link
                  href="/courses"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full text-sm sm:text-base transition-all active:scale-[0.97] flex items-center justify-center"
                >
                  {t("cta.button.secondary")}
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
