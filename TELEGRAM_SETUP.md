# Telegram Bot Setup — Promax Education

## 1. Supabase Migration

Supabase Dashboard → SQL Editor ga o'ting va quyidagi faylni ishga tushiring:
```
supabase/migrations/022_add_telegram_fields.sql
```

Bu `profiles` jadvaliga `telegram_id`, `telegram_username`, `telegram_link_token` ustunlarini qo'shadi.

---

## 2. Webhookni ro'yxatdan o'tkazish

### Production (Vercel)
Brauzerda quyidagiga o'ting:
```
https://promaxedu.uz/api/telegram/register-webhook?secret=promax_webhook_secret_2025
```

### Local development (ngrok kerak)
```bash
# ngrok o'rnatish
brew install ngrok

# Tunnel yaratish
ngrok http 3000

# Natijadagi URL bilan (masalan https://abc123.ngrok.io):
curl "https://abc123.ngrok.io/api/telegram/register-webhook?secret=promax_webhook_secret_2025"

# .env.local ni yangilash
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

---

## 3. BotFather sozlamalari

BotFather'da @ProMaxEduBot botini sozlang:

```
/setmenubutton
# Bot nomini tanlang
# Tugma matni: 📱 Platform
# URL: https://promaxedu.uz/tg
```

---

## 4. Sinab ko'rish

1. @ProMaxEduBot'ga `/start` yuboring
2. "Platformaga ulash" tugmasini bosing
3. Telefon va parol bilan kiring
4. Mini App ichida dashboardni ko'ring

---

## 5. Broadcast (Admin panel)

Admin panelidagi E'lonlar bo'limida "Telegram'ga yuborish" tugmasi bor.
Uni bosganingizda barcha bog'langan foydalanuvchilarga xabar ketadi.

API:
```bash
POST /api/telegram/send
Body: { "text": "Yangi e'lon!", "targetAll": true }
```
