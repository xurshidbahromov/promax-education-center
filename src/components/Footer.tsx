"use client";

import Link from 'next/link';
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
        <footer className="bg-brand-blue text-white py-12 border-t border-blue-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block">
                            <h2 className="text-2xl font-bold mb-4 tracking-tight">PROMAX EDUCATION</h2>
                        </Link>
                        <p className="text-blue-100 max-w-sm mb-6 leading-relaxed">
                            {t('footer.about.desc')}
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`bg-blue-900/50 p-2 rounded-lg text-blue-100 transition-all duration-300 hover:bg-white hover:scale-110 ${social.color}`}
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-brand-orange">{t('footer.quick_links')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-blue-100 hover:text-white hover:pl-2 transition-all duration-300">{t('nav.home')}</Link></li>
                            <li><Link href="#about" className="text-blue-100 hover:text-white hover:pl-2 transition-all duration-300">{t('nav.about')}</Link></li>
                            <li><Link href="/courses" className="text-blue-100 hover:text-white hover:pl-2 transition-all duration-300">{t('nav.courses')}</Link></li>
                            <li><Link href="#contact" className="text-blue-100 hover:text-white hover:pl-2 transition-all duration-300">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-brand-orange">{t('footer.contact')}</h3>
                        <ul className="space-y-4 text-blue-100">
                            <li className="flex items-start gap-3 group">
                                <MapPin className="w-5 h-5 flex-shrink-0 text-brand-orange mt-1 group-hover:animate-bounce" />
                                <span className="text-sm">Tashkent, Uzbekistan</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Phone className="w-5 h-5 flex-shrink-0 text-brand-orange group-hover:rotate-12 transition-transform" />
                                <a href="tel:+998901234567" className="text-sm hover:text-white transition-colors">+998 90 123 45 67</a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Mail className="w-5 h-5 flex-shrink-0 text-brand-orange group-hover:scale-110 transition-transform" />
                                <a href="mailto:info@promax.uz" className="text-sm hover:text-white transition-colors">info@promax.uz</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-200 text-sm">
                    © {new Date().getFullYear()} Promax Education Center. {t('footer.rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
