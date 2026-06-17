'use client';

import { useState, useEffect } from 'react';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { Loader2, Phone, Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type Step = 'form' | 'loading' | 'success' | 'error';

export default function TelegramLinkPage() {
  const { tgUser, initData, isReady, haptic, close } = useTelegramApp();
  const [step, setStep] = useState<Step>('form');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let digits = cleaned.startsWith('998') ? cleaned : '998' + cleaned;
    digits = digits.slice(0, 12);
    let formatted = '+998';
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.slice(10, 12);
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;

    haptic('medium');
    setStep('loading');

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await fetch('/api/telegram/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          password,
          initData,
          telegramId: tgUser?.id,
          telegramUsername: tgUser?.username,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Xatolik yuz berdi');
        setStep('error');
        haptic('heavy');
        return;
      }

      setProfile(data.profile);
      setStep('success');
      haptic('medium');
    } catch {
      setErrorMsg('Internet bilan bog\'lanishda xatolik');
      setStep('error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 14px 14px 44px',
    border: '1.5px solid rgba(0,86,210,0.2)',
    borderRadius: 12, fontSize: 15,
    background: 'rgba(255,255,255,0.8)',
    color: '#0f172a', outline: 'none',
    fontFamily: 'inherit',
  };

  // ─── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '24px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}>
          <CheckCircle size={40} color="#fff" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
          Muvaffaqiyatli ulandi! 🎉
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 6, lineHeight: 1.6 }}>
          Salom, <strong>{profile?.full_name}</strong>!
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
          Telegram hisobingiz platformaga ulandi. Endi bot orqali bildirishnomalar olasiz.
        </p>
        <button
          onClick={close}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #0056D2, #0066ff)',
            borderRadius: 12, color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,86,210,0.3)',
          }}
        >
          Yopish
        </button>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--tg-theme-bg-color, #f8fafc)',
      }}>
        <Loader2 size={32} color="#0056D2" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Tekshirilmoqda...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0056D2, #003d99)',
        padding: '24px 20px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120,
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 20 }}>🎓</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, letterSpacing: '0.06em' }}>PROMAX</div>
            <div style={{ color: '#F97316', fontSize: 9, fontWeight: 600, letterSpacing: '0.3em' }}>EDUCATION</div>
          </div>
        </div>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginTop: 16, marginBottom: 4 }}>
          Hisobni ulash
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Platformadagi hisobingiz bilan kiring
        </p>
      </div>

      {/* Form card */}
      <div style={{ padding: '24px 16px' }}>
        {step === 'error' && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fca5a5',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ color: '#dc2626', fontSize: 13 }}>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Telefon raqam
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Parol
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Parolingiz"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                {showPassword
                  ? <EyeOff size={18} color="#94a3b8" />
                  : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Telegram info badge */}
          {tgUser && (
            <div style={{
              background: 'rgba(0,86,210,0.06)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Telegram hisob:</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0056D2' }}>
                  {tgUser.first_name}{tgUser.username ? ` (@${tgUser.username})` : ''}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: '15px 24px',
              background: 'linear-gradient(135deg, #0056D2, #0066ff)',
              borderRadius: 14, color: '#fff',
              fontWeight: 700, fontSize: 16, border: 'none',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,86,210,0.3)',
            }}
          >
            Ulash
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Bu platformadagi mavjud hisobingiz bilan bir martalik ulanish
        </p>
      </div>
    </div>
  );
}
