"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShieldCheck, X, Loader2, Send } from "lucide-react";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import { useQueryClient } from "@tanstack/react-query";
import { soundFx } from "@/lib/sound-effects";
import toast from "react-hot-toast";

const DISMISS_KEY = "promax_phone_prompt_dismissed_v1";
const getSavedKey = (userId: string) => `promax_phone_saved_${userId}`;

function formatUzPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3 && "998".startsWith(cleaned)) {
    return "+998 ";
  }
  let digits = cleaned.startsWith("998") ? cleaned : "998" + cleaned;
  digits = digits.slice(0, 12);
  let formatted = "+998";
  if (digits.length > 3) formatted += " " + digits.slice(3, 5);
  if (digits.length > 5) formatted += " " + digits.slice(5, 8);
  if (digits.length > 8) formatted += " " + digits.slice(8, 10);
  if (digits.length > 10) formatted += " " + digits.slice(10, 12);
  return formatted;
}

export default function PhoneVerifyModal() {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading, refetch } = useUserProfile(user?.id);
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTgRequestContact, setHasTgRequestContact] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [phoneInput, setPhoneInput] = useState("+998 ");
  const [submitting, setSubmitting] = useState(false);
  const [waitingTelegram, setWaitingTelegram] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tgSafetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTelegramTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (tgSafetyTimerRef.current) {
      clearTimeout(tgSafetyTimerRef.current);
      tgSafetyTimerRef.current = null;
    }
  };

  useEffect(() => {
    setMounted(true);
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string; requestContact?: (cb: (shared: boolean) => void) => void; isVersionAtLeast?: (v: string) => boolean } } })?.Telegram?.WebApp;
    const isSupportedVersion = typeof tg?.isVersionAtLeast === "function" ? tg.isVersionAtLeast("6.9") : true;
    const isInTelegram = Boolean(tg && tg.initData && typeof tg.requestContact === "function" && isSupportedVersion);
    setHasTgRequestContact(isInTelegram);
    if (!isInTelegram) {
      setShowManualForm(true);
    }
    return () => {
      clearTelegramTimers();
    };
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || !profile || !user?.id) return;

    const existingPhone = (profile.phone || user.phone || "").replace(/\D/g, "");
    const role = profile.role || "student";
    const isAdmin = ["admin", "staff", "superadmin", "teacher"].includes(role);

    if (existingPhone.length >= 9 || isAdmin) {
      setIsOpen(false);
      if (existingPhone.length >= 9) {
        try { localStorage.setItem(getSavedKey(user.id), "1"); } catch {}
      }
      return;
    }

    try {
      // If user already saved their phone on this device, never ask again
      if (localStorage.getItem(getSavedKey(user.id)) === "1") return;
      // If dismissed ("Keyinroq"), don't nag again in the same session
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {}

    // Small delay so dashboard settles smoothly first
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [mounted, isLoading, profile, user?.id, user?.phone]);

  const markPhoneSaved = (normalizedPhone?: string) => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
      if (user?.id) localStorage.setItem(getSavedKey(user.id), "1");
    } catch {}
    if (user?.id) {
      if (normalizedPhone) {
        queryClient.setQueryData(["userProfile", user.id], (old: Record<string, unknown> | null | undefined) =>
          old ? { ...old, phone: normalizedPhone } : old
        );
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });
      queryClient.invalidateQueries({ queryKey: ["fullUserProfile", user.id] });
    }
    window.dispatchEvent(new CustomEvent("promax_profile_updated"));
  };

  const handleDismiss = () => {
    clearTelegramTimers();
    setWaitingTelegram(false);
    setIsOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const handleTelegramShare = () => {
    const tg = (window as unknown as {
      Telegram?: {
        WebApp?: {
          requestContact?: (cb: (shared: boolean, eventData?: { responseUnsafe?: { contact?: { phone_number?: string } } }) => void) => void;
        };
      };
    })?.Telegram?.WebApp;
    if (!tg || typeof tg.requestContact !== "function") {
      setShowManualForm(true);
      return;
    }

    clearTelegramTimers();
    setWaitingTelegram(true);

    // Safety fallback if Telegram client never invokes callback (e.g. user swipes native sheet away)
    tgSafetyTimerRef.current = setTimeout(() => {
      setWaitingTelegram(false);
      setShowManualForm(true);
    }, 15000);

    try {
      tg.requestContact(async (shared, eventData) => {
        if (tgSafetyTimerRef.current) {
          clearTimeout(tgSafetyTimerRef.current);
          tgSafetyTimerRef.current = null;
        }
        if (!shared) {
          setWaitingTelegram(false);
          setShowManualForm(true);
          return;
        }

        // Fast path: if Telegram WebApp returned the contact phone directly, persist via API immediately
        const directPhone = eventData?.responseUnsafe?.contact?.phone_number;
        const directDigits = (directPhone || "").replace(/\D/g, "");
        if (directDigits.length >= 9) {
          try {
            const res = await fetch("/api/profile/phone", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: directDigits }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
              clearTelegramTimers();
              markPhoneSaved(json.phone);
              setWaitingTelegram(false);
              setIsOpen(false);
              soundFx.playSuccess();
              toast.success("Telefon raqamingiz tasdiqlandi!");
              return;
            }
          } catch {}
        }

        // Fallback: poll profile briefly while Telegram bot webhook saves the shared phone into Supabase
        let attempts = 0;
        pollIntervalRef.current = setInterval(async () => {
          attempts++;
          const res = await refetch();
          const savedPhone = (res.data?.phone || "").replace(/\D/g, "");
          if (savedPhone.length >= 9) {
            clearTelegramTimers();
            markPhoneSaved(res.data?.phone || undefined);
            setWaitingTelegram(false);
            setIsOpen(false);
            soundFx.playSuccess();
            toast.success("Telefon raqamingiz tasdiqlandi!");
          } else if (attempts >= 6) {
            clearTelegramTimers();
            try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
            setWaitingTelegram(false);
            setShowManualForm(true);
            toast("Raqamingizni qo'lda tasdiqlab saqlang");
          }
        }, 900);
      });
    } catch {
      clearTelegramTimers();
      setWaitingTelegram(false);
      setShowManualForm(true);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length < 12) {
      toast.error("To'liq raqamni kiriting: +998 XX XXX XX XX");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Xatolik yuz berdi");
        return;
      }

      markPhoneSaved(json.phone);
      soundFx.playSuccess();
      toast.success("Telefon raqamingiz saqlandi!");
      setIsOpen(false);
    } catch {
      toast.error("Internet bilan bog'lanishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <motion.div
        key="phone-verify-sheet"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/55 backdrop-blur-[3px]"
      >
        <motion.div
          initial={{ y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 36, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl relative flex flex-col overflow-hidden text-left text-slate-800 dark:text-white"
        >
          {/* Header (Do'kon / Streak sheet style) */}
          <div className="px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight">
                    Telefon raqamni tasdiqlang
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Hisobingiz va natijalaringizni saqlash uchun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Keyinroq"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-brand-blue shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Telegram orqali kirganingizda raqamingiz avtomatik olinmaydi. Ustozlar va o&apos;quv markazi siz bilan bog&apos;lanishi uchun raqamingizni biriktiring.
              </p>
            </div>

            {hasTgRequestContact && !showManualForm ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={waitingTelegram}
                  onClick={handleTelegramShare}
                  className="w-full py-3.5 px-4 bg-brand-blue hover:bg-blue-600 active:scale-95 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {waitingTelegram ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Telegram raqamni ulashish</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Yoki raqamni qo&apos;lda kiritish
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Telefon raqamingiz
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(formatUzPhone(e.target.value))}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <span>Saqlash</span>}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Keyinroq
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
