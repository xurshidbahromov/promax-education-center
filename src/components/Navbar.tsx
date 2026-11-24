"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, Moon, Sun, Monitor, Check, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const themeRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "home") return pathname === "/";
    return pathname.startsWith(`/${path}`);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
      }
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const ThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />;
    if (theme === "dark") return <Moon className="w-4 h-4" />;
    if (theme === "light") return <Sun className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } },
    exit: { opacity: 0, y: -5, scale: 0.96, transition: { duration: 0.1 } },
  };

  const navItems = ["home", "courses", "methodology", "results", "about"] as const;

  return (
    <>
      {/* Smooth Progressive Top Edge Blur (iOS-style glass fade behind floating navbar) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 right-0 h-24 sm:h-28 z-40 backdrop-blur-md bg-gradient-to-b from-white/60 via-white/30 to-transparent dark:from-slate-950/70 dark:via-slate-950/35 dark:to-transparent"
        style={{
          maskImage: "linear-gradient(to bottom, black 48%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 48%, transparent 100%)",
        }}
      />

      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-3.5 sm:pt-5 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <nav
          className="w-full max-w-7xl flex flex-col gap-3 pointer-events-none relative"
          aria-label="Main Navigation"
        >
          {/* Desktop and Mobile Islands Row */}
          <div className="w-full flex justify-between items-center pointer-events-none">
            {/* Left: Brand Wordmark Island */}
            <div className="flex justify-start pointer-events-auto">
              <Link
                href="/"
                className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-full h-14 sm:h-15 px-4 sm:px-5 flex items-center gap-2.5 group transition-all duration-200"
              >
                <div className="relative w-8 h-8 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/favicon.ico"
                    alt="Promax Education Center Logo"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[18px] sm:text-[19px] font-black text-slate-900 dark:text-white font-brand uppercase tracking-[0.12em] leading-none">
                    Promax
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] font-semibold text-brand-orange tracking-[0.34em] uppercase leading-none mt-1 pl-[1px] font-sans">
                    Education
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Nav Links Island */}
            <div className="hidden lg:flex justify-center pointer-events-auto">
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-full h-15 px-2.5 flex items-center gap-1 transition-all duration-200">
                {navItems.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item}
                      href={item === "home" ? "/" : `/${item}`}
                      className={cn(
                        "text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200",
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                      )}
                    >
                      {t(`nav.${item}`)}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Controls Island / Mobile Toggle */}
            <div className="flex justify-end items-center gap-2.5">
              {/* Desktop Controls Island */}
              <div className="hidden lg:flex pointer-events-auto">
                <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm rounded-full h-15 px-3 flex items-center gap-2 transition-all duration-200">
                  {/* Theme Dropdown */}
                  <div className="relative" ref={themeRef}>
                    <button
                      type="button"
                      onClick={() => setThemeOpen(!themeOpen)}
                      className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label="Theme Menu"
                    >
                      <ThemeIcon />
                    </button>

                    <AnimatePresence>
                      {themeOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="absolute top-full right-0 mt-3 w-36 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden p-1"
                        >
                          {[
                            { value: "light", label: "Light", icon: Sun },
                            { value: "dark", label: "Dark", icon: Moon },
                            { value: "system", label: "System", icon: Monitor },
                          ].map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => {
                                setTheme(option.value);
                                setThemeOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                                theme === option.value
                                  ? "text-brand-blue dark:text-blue-400 font-semibold"
                                  : "text-slate-700 dark:text-slate-300"
                              )}
                            >
                              <option.icon className="w-4 h-4" />
                              <span>{option.label}</span>
                              {theme === option.value && <Check className="w-3.5 h-3.5 ml-auto" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Language Dropdown */}
                  <div className="relative" ref={langRef}>
                    <button
                      type="button"
                      onClick={() => setLangOpen(!langOpen)}
                      className="flex items-center gap-1.5 px-3 h-9 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-xs cursor-pointer"
                      aria-label="Language Menu"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language}</span>
                    </button>

                    <AnimatePresence>
                      {langOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          className="absolute top-full right-0 mt-3 w-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden p-1"
                        >
                          {(["UZ", "EN", "RU"] as const).map((lang) => (
                            <button
                              type="button"
                              key={lang}
                              onClick={() => {
                                setLanguage(lang);
                                setLangOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                                language === lang
                                  ? "text-brand-blue dark:text-blue-400"
                                  : "text-slate-700 dark:text-slate-300"
                              )}
                            >
                              <span>{lang}</span>
                              {language === lang && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  {user ? (
                    <Link
                      href="/dashboard"
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 h-10 flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold active:scale-[0.97] transition-all shadow-sm"
                    >
                      <LayoutDashboard size={15} />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                      >
                        {t("nav.login")}
                      </Link>

                      <Link
                        href="/register"
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 h-10 flex items-center justify-center rounded-full text-sm font-semibold active:scale-[0.97] transition-all shadow-sm"
                      >
                        {t("hero.cta.primary")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile: Hamburger Menu Toggle Island */}
              <div className="lg:hidden flex justify-end pointer-events-auto">
                <button
                  type="button"
                  className="flex items-center justify-center w-14 h-14 rounded-full text-slate-800 dark:text-slate-200 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm active:scale-[0.95] transition-all cursor-pointer"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Asosiy menyuni ochish yoki yopish"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Island */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="lg:hidden pointer-events-auto w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col p-5 gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const active = isActive(item);
                    return (
                      <Link
                        key={item}
                        href={item === "home" ? "/" : `/${item}`}
                        className={cn(
                          "text-base font-semibold px-4 py-3 rounded-2xl transition-colors",
                          active
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t(`nav.${item}`)}
                      </Link>
                    );
                  })}
                </div>

                <div className="h-px bg-slate-200/80 dark:bg-slate-800 w-full" />

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      Theme
                    </span>
                    <div className="flex gap-1.5">
                      {(["light", "dark", "system"] as const).map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setTheme(mode)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all flex-1 flex justify-center cursor-pointer",
                            theme === mode
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {mode === "light" && <Sun size={16} />}
                          {mode === "dark" && <Moon size={16} />}
                          {mode === "system" && <Monitor size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      Lang
                    </span>
                    <div className="flex gap-1.5">
                      {(["UZ", "EN", "RU"] as const).map((lang) => (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={cn(
                            "p-2 rounded-xl transition-all flex-1 text-xs font-bold flex justify-center items-center cursor-pointer",
                            language === lang
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="w-full py-3.5 text-center rounded-full font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={17} />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="w-full py-3.5 text-center rounded-full font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t("nav.login")}
                      </Link>
                      <Link
                        href="/register"
                        className="w-full py-3.5 text-center rounded-full font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t("hero.cta.primary")}
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
