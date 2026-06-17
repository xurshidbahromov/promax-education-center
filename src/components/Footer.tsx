"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Send, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
 const { t } = useLanguage();

 const socialLinks = [
 { icon: Instagram, href: "https://instagram.com/promax_education", label: "Instagram", color: "hover:bg-pink-500 hover:text-white hover:border-pink-500" },
 { icon: Send, href: "https://t.me/promax_edu", label: "Telegram", color: "hover:bg-blue-500 hover:text-white hover:border-blue-500" },
 { icon: Facebook, href: "https://facebook.com/Promaxeducation", label: "Facebook", color: "hover:bg-blue-600 hover:text-white hover:border-blue-600" },
 { icon: Youtube, href: "https://www.youtube.com/@PROMAXEDUCATION", label: "YouTube", color: "hover:bg-red-600 hover:text-white hover:border-red-600" },
 ];

 return (
 <footer className="relative bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl overflow-hidden border-t border-white/30 dark:border-white/5 pt-16 pb-10 px-4 sm:px-6 lg:px-8">
 {/* Background Elements */}
 <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
 
 <div className="max-w-7xl mx-auto w-full relative z-10">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
 {/* Brand Column */}
 <div className="lg:col-span-5 space-y-6">
 <Link href="/" className="inline-block group">
 <div className="flex items-center gap-4">
 <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
 <Image
 src="/favicon.ico"
 alt="Promax Education Center Logo"
 fill
 sizes="56px"
 className="object-contain dark:filter-none invert hue-rotate-180"
 />
 </div>
  <div className="flex flex-col">
  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-sans-pro uppercase tracking-wider leading-none">
  Promax
  </span>
  <span className="text-[10px] font-semibold text-brand-orange dark:text-brand-orange tracking-[0.35em] uppercase leading-none mt-1.5 pl-[1px]">
  Education
  </span>
  </div>
 </div>
 </Link>
 <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed text-base font-medium">
 {t('footer.about.desc')}
 </p>
 <div className="flex space-x-3">
 {socialLinks.map((social, index) => (
 <a
 key={index}
 href={social.href}
 target="_blank"
 rel="noopener noreferrer"
 className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 border border-white/20 dark:border-white/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${social.color}`}
 aria-label={social.label}
 >
 <social.icon size={18} />
 </a>
 ))}
 </div>
 </div>

 {/* Spacer for large screens */}
 <div className="hidden lg:block lg:col-span-1"></div>

 {/* Quick Links */}
 <div className="lg:col-span-2">
 <h3 className="text-xl font-medium mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
 {t('footer.quick_links')}
 </h3>
 <ul className="space-y-4">
 {[
 { name: t('nav.home'), href: "/" },
 { name: t('nav.about'), href: "#about" },
 { name: t('nav.courses'), href: "/courses" },
 { name: t('nav.contact'), href: "#contact" }
 ].map((link, i) => (
 <li key={i}>
 <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 font-medium hover:translate-x-2 transition-transform duration-300 inline-block">
 {link.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Contact Info */}
 <div className="lg:col-span-4">
 <h3 className="text-xl font-medium mb-6 text-slate-800 dark:text-slate-100">{t('footer.contact')}</h3>
 <ul className="space-y-5">
 <li className="flex items-start gap-4 group cursor-pointer">
 <div className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:scale-[1.02]">
 <MapPin className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors" />
 </div>
 <div className="pt-0.5">
 <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-0.5">Manzil</p>
 <span className="text-sm text-gray-500 dark:text-gray-400 leading-snug">Tashkent, Uzbekistan <br /> Chilanzar District</span>
 </div>
 </li>
 <li className="flex items-center gap-4 group cursor-pointer">
 <div className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-brand-orange group-hover:text-white group-hover:scale-[1.02]">
 <Phone className="w-5 h-5 text-brand-orange group-hover:text-white transition-colors" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-0.5">Telefon</p>
 <a href="tel:+998955137776" className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-brand-orange transition-colors">+998 95 513 77 76</a>
 </div>
 </li>
 <li className="flex items-center gap-4 group cursor-pointer">
 <div className="w-10 h-10 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-green-500 group-hover:text-white group-hover:scale-[1.02]">
 <Mail className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-0.5">Email</p>
 <a href="mailto:info@promax.uz" className="text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-green-500 transition-colors">info@promax.uz</a>
 </div>
 </li>
 </ul>
 </div>
 </div>

 <div className="mt-16 pt-8 border-t border-white/20 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
 © {new Date().getFullYear()} Promax Education Center. {t('footer.rights')}
 </p>
 <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
 <Link href="/methodology" className="hover:text-brand-blue transition-colors">Methodology</Link>
 <Link href="/courses" className="hover:text-brand-blue transition-colors">Courses</Link>
 <Link href="/results" className="hover:text-brand-blue transition-colors">Results</Link>
 </div>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
