"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Send, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    const socialLinks = [
        { icon: Instagram, href: "https://instagram.com/promax_education", label: "Instagram", color: "hover:text-pink-500" },
        { icon: Send, href: "https://t.me/promax_edu", label: "Telegram", color: "hover:text-blue-400" },
        { icon: Facebook, href: "https://facebook.com/Promaxeducation", label: "Facebook", color: "hover:text-blue-600" },
        { icon: Youtube, href: "https://www.youtube.com/@PROMAXEDUCATION", label: "YouTube", color: "hover:text-red-600" },
    ];

    return (
        <footer className="bg-transparent border-t border-blue-100 dark:border-white/10 pt-16 pb-8 backdrop-blur-sm relative z-10 text-gray-600 dark:text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-3">
                                <div className="relative w-24 h-24">
                                    <Image
                                        src="/logo_without_sentence.png"
                                        alt="Promax Education Logo"
                                        fill
                                        sizes="96px"
                                        className="object-contain dark:filter-none invert hue-rotate-180"
                                    />
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight text-brand-blue dark:text-white">
                                    PROMAX <br /> <span className="text-brand-orange">EDUCATION</span>
                                </span>
                            </div>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed text-base">
                            {t('footer.about.desc')}
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-white dark:bg-slate-800 p-3 rounded-xl text-gray-500 dark:text-gray-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-700 ${social.color}`}
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">{t('footer.quick_links')}</h3>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 hover:pl-2 transition-all duration-300 block">{t('nav.home')}</Link></li>
                            <li><Link href="#about" className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 hover:pl-2 transition-all duration-300 block">{t('nav.about')}</Link></li>
                            <li><Link href="/courses" className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 hover:pl-2 transition-all duration-300 block">{t('nav.courses')}</Link></li>
                            <li><Link href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-brand-blue dark:hover:text-blue-400 hover:pl-2 transition-all duration-300 block">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">{t('footer.contact')}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-5 h-5 text-brand-orange" />
                                </div>
                                <span className="text-sm leading-snug pt-2">Tashkent, Uzbekistan <br /> Chilanzar District</span>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
                                    <Phone className="w-5 h-5 text-brand-blue" />
                                </div>
                                <a href="tel:+998955137776" className="text-sm hover:text-brand-blue transition-colors font-medium">+998 95 513 77 76</a>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <a href="mailto:info@promax.uz" className="text-sm hover:text-brand-blue transition-colors font-medium">info@promax.uz</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 mt-16 pt-8 text-center text-gray-500 dark:text-gray-500 text-sm font-medium">
                    © {new Date().getFullYear()} Promax Education Center. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
