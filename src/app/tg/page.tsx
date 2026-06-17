'use client';

import { useEffect, useState } from 'react';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { BookOpen, ClipboardList, BarChart3, Trophy, User, Loader2, Link2, ExternalLink, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import SwipeToStart from '@/components/ui/SwipeToStart';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  coins: number;
}

interface TgAuthResponse {
  linked: boolean;
  profile?: Profile;
  telegramUser?: {
    id: number;
    first_name: string;
    username?: string;
  };
}

const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';

const quickLinks = [
  {
    label: 'Darslar',
    sublabel: 'Video darslar',
    href: '/dashboard/lessons',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Testlar',
    sublabel: 'Online testlar',
    href: '/dashboard/tests',
    icon: ClipboardList,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    label: 'Natijalar',
    sublabel: 'Statistika',
    href: '/dashboard/results',
    icon: BarChart3,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    label: 'Profil',
    sublabel: 'Hisob',
    href: '/dashboard/profile',
    icon: User,
    gradient: 'from-emerald-500 to-green-600',
  },
];

export default function TelegramMiniAppPage() {
  const { tgApp, tgUser, initData, isReady } = useTelegramApp();
  const [authState, setAuthState] = useState<TgAuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleSwipeLogin = async () => {
    setIsSwiping(true);
    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, action: 'swipe_login' }),
      });
      const data = await res.json();
      if (data.linked) {
        setAuthState(data);
      }
    } catch (e) {
      console.error('Login failed', e);
    } finally {
      setIsSwiping(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    async function verifyAuth() {
      try {
        const res = await fetch('/api/telegram/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data: TgAuthResponse = await res.json();
        setAuthState(data);
      } catch {
        // Dev mode fallback
        setAuthState({ linked: false, telegramUser: { id: 0, first_name: 'Test' } });
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [isReady, initData]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--tg-theme-bg-color, #f8fafc)',
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'linear-gradient(135deg, #0056D2, #F97316)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 28 }}>🎓</span>
        </div>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#0056D2' }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  const displayName = authState?.profile?.full_name
    || tgUser?.first_name
    || authState?.telegramUser?.first_name
    || 'Foydalanuvchi';

  // ─── Not linked (Swipe to Start) ───────────────────────────────────────────
  if (!authState?.linked) {
    return (
      <div className="min-h-[100vh] min-h-[100dvh] relative overflow-hidden bg-slate-900 flex flex-col items-center justify-between py-12 px-6">
        {/* Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center mt-12 w-full">
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5, type: "spring" }}
             className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue to-brand-orange p-[2px] shadow-[0_8px_32px_rgba(249,115,22,0.3)] mb-8"
          >
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center backdrop-blur-xl">
               <span className="text-4xl">🎓</span>
            </div>
          </motion.div>
          
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-center"
          >
            <h1 className="text-4xl font-black text-white tracking-wider uppercase mb-1">
              PROMAX
            </h1>
            <h2 className="text-sm font-bold text-brand-orange tracking-[0.4em]">
              EDUCATION
            </h2>
          </motion.div>

          <motion.p
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="text-slate-400 text-center mt-6 max-w-[280px] leading-relaxed"
          >
            <strong className="text-white">{displayName}</strong>, ta'lim olishning eng zamonaviy va qulay usuliga xush kelibsiz.
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full relative z-10 mb-8"
        >
          <SwipeToStart 
            isLoading={isSwiping}
            onComplete={handleSwipeLogin} 
          />
          
          <div className="mt-8 text-center">
             <a href="/tg/link" className="text-xs text-slate-500 font-medium hover:text-slate-300 transition-colors">
                Menda oldindan hisob bor (Web)
             </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Linked — Dashboard ─────────────────────────────────────────────────────
  const profile = authState.profile!;
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tg-theme-bg-color, #f8fafc)', padding: '0 0 24px' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #0056D2 0%, #003d99 100%)',
        padding: '28px 20px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 150, height: 150,
          background: 'rgba(255,255,255,0.08)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -20,
          width: 100, height: 100,
          background: 'rgba(249,115,22,0.2)', borderRadius: '50%',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: 18 }}>🎓</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: '0.06em' }}>PROMAX</div>
            <div style={{ color: '#F97316', fontSize: 9, fontWeight: 600, letterSpacing: '0.3em', marginTop: 1 }}>EDUCATION</div>
          </div>
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316, #fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff',
              border: '2px solid rgba(255,255,255,0.3)',
            }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 }}>Xush kelibsiz 👋</div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{displayName}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>O'quvchi</div>
          </div>
          {/* Coin badge */}
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 5,
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{ fontSize: 16 }}>🪙</span>
            <span style={{ color: '#fde68a', fontWeight: 700, fontSize: 16 }}>{profile.coins || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--tg-theme-text-color, #0f172a)' }}>
          Tezkor o'tish
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  background: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                  borderRadius: 16, padding: '16px 14px',
                  textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.1s',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  tgApp?.openLink(`${window.location.origin}${link.href}`);
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg, ${link.gradient.replace('from-', '').replace('to-', ', ')})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tg-theme-text-color, #0f172a)' }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--tg-theme-hint-color, #64748b)', marginTop: 2 }}>
                    {link.sublabel}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Open full dashboard */}
      <div style={{ padding: '8px 16px' }}>
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            tgApp?.openLink(`${window.location.origin}/dashboard`);
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px',
            background: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            borderRadius: 14, color: '#0056D2',
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,86,210,0.1)',
            border: '1.5px solid rgba(0,86,210,0.15)',
          }}
        >
          <ExternalLink size={18} />
          To'liq platformani ochish
        </a>
      </div>
    </div>
  );
}
