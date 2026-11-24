"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Send, MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://instagram.com/promax_education",
      label: "Instagram",
      color: "hover:bg-pink-500 hover:text-white hover:border-pink-500",
    },
    {
      icon: Send,
      href: "https://t.me/promax_edu",
      label: "Telegram",
      color: "hover:bg-blue-500 hover:text-white hover:border-blue-500",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/Promaxeducation",
      label: "Facebook",
      color: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/@PROMAXEDUCATION",
      label: "YouTube",
      color: "hover:bg-red-600 hover:text-white hover:border-red-600",
    },
  ];

  return (
    <footer className="relative bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      {/* Subtle zero-GPU-blur radial tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 0%, rgba(0,86,210,0.08) 0%, transparent 50%), radial-gradient(circle at 12% 100%, rgba(245,158,11,0.08) 0%, transparent 48%)",
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/favicon.ico"
                  alt="Promax Education Center Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-brand uppercase tracking-[0.12em] leading-none">
                  Promax
                </span>
                <span className="text-[9.5px] font-semibold text-brand-orange tracking-[0.34em] uppercase leading-none mt-1.5 pl-[1px] font-sans">
                  Education
                </span>
              </div>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed text-sm sm:text-[15px] font-medium">
              {t("footer.about.desc")}
            </p>

            <div className="flex items-center gap-2.5">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white font-sans uppercase tracking-wider">
              {t("footer.quick_links")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { name: t("nav.home"), href: "/" },
                { name: t("nav.about"), href: "/about" },
                { name: t("nav.courses"), href: "/courses" },
                { name: t("nav.results"), href: "/results" },
                { name: t("nav.methodology"), href: "/methodology" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 font-medium text-sm transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white font-sans uppercase tracking-wider">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-brand-blue dark:text-blue-400" />
                </div>
                <div className="pt-0.5">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("footer.address_label")}
                  </p>
                  <span className="text-sm text-slate-700 dark:text-slate-200 leading-snug font-medium">
                    {t("footer.address_value")}
                  </span>
                </div>
              </li>

              <li className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("footer.phone_label")}
                  </p>
                  <a
                    href="tel:+998955137776"
                    className="text-sm text-slate-700 dark:text-slate-200 font-medium hover:text-amber-500 transition-colors tabular-nums"
                  >
                    +998 95 513 77 76
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("footer.email_label")}
                  </p>
                  <a
                    href="mailto:info@promax.uz"
                    className="text-sm text-slate-700 dark:text-slate-200 font-medium hover:text-emerald-500 transition-colors"
                  >
                    info@promax.uz
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-7 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            © {new Date().getFullYear()} Promax Education Center. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/methodology" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
              {t("nav.methodology")}
            </Link>
            <Link href="/courses" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
              {t("nav.courses")}
            </Link>
            <Link href="/results" className="hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
              {t("nav.results")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
