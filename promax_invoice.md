# 📋 PROMAX EDUCATION CENTER - TO'LIQ PLATFORMA INVOICE & HISOB-KITOB SMETASI

**Loyiha nomi:** Promax Education Center — O'quv Markazi Boshqaruv Tizimi & Talabalar Portali (LMS)  
**Texnologik stek:** Next.js 15 (App Router), TypeScript, TailwindCSS, Supabase (PostgreSQL, Auth, RLS, Realtime), Framer Motion, Telegram Bot API.  
**Sana:** 11-Avgust, 2026-yil  
**Hujjat turi:** Loyiha smetasi, bajarilgan ishlar akti va tijorat taklifi (Invoice)

---

## 🚀 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

Ushbu platforma o'quv markazi faoliyatini 100% raqamlashtirish, admin/o'qituvchilar uchun boshqaruv panelini yaratish, o'quvchilar uchun onlayn test yechish va gamifikatsiya (tangalar) tizimini joriy qilish, hamda ota-onalar uchun Telegram bot orqali avtomatlashtirilgan davomat va natijalar xabarnomasini yo'lga qo'yish uchun noldan to'liq tayyor holatga keltirildi.

---

## 🛠 2. BAJARILGAN ISHLAR RO'YXATI VA BO'LIMLAR TAFSILOTI

### A. Tashqi Veb-Sayt & Landing Page (Public Portal)
- 🎨 **Zamonaviy UI/UX Dizayn:** Dark/Light mode, Glassmorphism effekti, maxsus brend ranglar va animatsiyalar.
- 🏠 **Bosh sahifa (`/`):** Hero interaktiv sarlavha, Kurslar preview, Metodologiya, Interaktiv statistika, Video roliklar namoyishi, FAQ akkordeon va Footer.
- 📖 **Qo'shimcha sahifalar:** Biz haqimizda (`/about`), Metodologiya (`/methodology`), Kurslar ro'yxati (`/courses`), Natijalar (`/results`).
- 🌐 **Ko'p tillilik (i18n):** O'zbekcha, Inglizcha va Ruscha tillarda to'liq qo'llab-quvvatlash.

### B. Supabase Ma'lumotlar Bazasi & Xavfsizlik (Backend)
- 🗄 **PostgreSQL Arxitekturasi:** 14 ta asosiy va o'zaro bog'langan jadvallar: `profiles`, `groups`, `group_students`, `attendance`, `subjects`, `tests`, `test_questions`, `test_attempts`, `exams`, `results`, `directions`, `announcements`, `notifications`, `payments`.
- 🔐 **RLS Xavfsizlik Siyosati (Row Level Security):** Foydalanuvchi rollariga qarab (`admin`, `teacher`, `staff`, `student`) ma'lumotlarni o'qish va tahrirlash huquqlarini cheklash.
- ⚡ **Supabase Auth SSR:** Autentifikatsiya (Login, Parol tiklash, Sessiyalar) va Middleware orqali avtorizatsiyadan o'tmaganlarni yo'naltirish.

### C. Admin & O'qituvchilar Boshqaruv Paneli (`/admin`)
- 📊 **Bosh analitika dashboard (`/admin`):** Jami o'quvchilar, guruhlar, oylik tushum, faol testlar va oxirgi faoliyat jurnali.
- 🎓 **O'quvchilar boshqaruvi (`/admin/students`):** Qidiruv, filtrlash, o'quvchini guruhlarga biriktirish, ota-ona telefon raqamini kiritish, talaba shaxsiy profili (`/admin/students/[id]`).
- 👨‍Z️ **O'qituvchilar va Xodimlar (`/admin/teachers`):** Ustozlarni ro'yxatga olish, fan va guruhlarni biriktirish, rollarni boshqarish.
- 📚 **Guruhlar boshqaruvi (`/admin/groups`):** Guruhlar yaratish, jadval belgilash, o'qituvchi va fanga bog'lash, guruh o'quvchilari tarkibi (`/admin/groups/[id]`).
- 📋 **Davomat va Uy vazifasi tizimi (`/admin/attendance`):** Guruhlar bo'yicha davomat (Keldi, Kelmadi, Kechikdi) hamda Uy vazifasi (Bajarildi, Qisman, Bajarmadi) belgilash. Saqlash tugmasi bosilganda avtomatik Telegram xabarnoma yuborish.
- 📝 **Mock/DTM Imtihon natijalari (`/admin/results`):** Haftalik va oylik Mock imtihon ballarini kiritish, ✏️ Tahrirlash va 🗑️ O'chirish imkoniyati.
- 📢 **E'lonlar markazi (`/admin/announcements`):** Yangiliklar va e'lonlar yaratish, auditoriyani tanlash (`barcha`, `o'quvchilar`, `o'qituvchilar`), rasm va muddat biriktirish.
- 💳 **Moliya va To'lovlar (`/admin/payments`):** O'quvchilar to'lovlari hisobini yuritish va tahlil qilish.

### D. Talabalar Portali (`/dashboard`)
- 🏠 **Shaxsiy Dashboard (`/dashboard`):** Talabaning shaxsiy ko'rsatkichlari (yechilgan testlar, o'rtacha ball, to'plangan tangalar), o'qiyotgan fanlari progressi va Admin e'lonlari karuseli.
- ✍️ **Onlayn Test Markazi (`/dashboard/tests` & `/dashboard/tests/[id]`):** Real vaqt taymeri bilan test yechish, avtomatik tezkor baholash, xatolar ustida ishlash.
- 📈 **Natijalar va Tahlil (`/dashboard/results`):** Barcha yechilgan onlayn testlar va Mock DTM imtihonlari ballarining birlashtirilgan reytingi va tahlili.
- 🎮 **Game Zone / Gamifikatsiya (`/dashboard/games`):** Interaktiv "Math Challenge" o'yini. Yechilgan savollar uchun real vaqtda tangalar to'plash va Supabase profiliga (`coins`) saqlash.
- ⚙️ **Profil va Sozlamalar (`/dashboard/profile`):** Rasm (Avatar) yuklash, parolni o'zgartirish, til va mavzularni sozlash.

### E. Telegram Bot & Ota-onalar Avtomatizatsiyasi (Integration)
- 🤖 **Telegram Bot Gateway (`/api/telegram/notify-attendance`, `/api/telegram/webhook`):**
  - O'quvchi darsga kelmaganda yoki uy vazifasini bajarmaganda ota-ona Telegramiga soniyalar ichida avto-xabar borishi.
  - Ota-onalar uchun Telegram bot tugmalari orqali farzandining davomatini, test natijalarini va to'lov holatini masofadan tekshirish imkoniyati.

---

## 💰 3. USTOZ UCHUN BATAFSIL CHEGIRMALI LOYIHA SMETASI (INVOICE)

Quyida har bir modul bo'yicha haqiqiy bozor qiymati, Ustozga berilgan ehtiromli chegirma summasi hamda chegirmadan keyingi yakuniy to'lov qiymati ($800 atrofida) ko'rsatilgan:

| № | Modul / Funktsional Bo'lim | Asl Bozor Narxi | Ustoz Chegirmasi | Yakuniy Narx (USD) | Yakuniy Narx (UZS)* |
|:---|:---|:---:|:---:|:---:|:---:|
| **1** | **Landing Page & UI Design System** (Public portal, dark mode, i18n) | $300 | -$200 (-67%) | **$100** | 1,290,000 UZS |
| **2** | **Supabase Backend & Security** (14 jadval, Auth, RLS siyosati) | $320 | -$220 (-69%) | **$100** | 1,290,000 UZS |
| **3** | **Admin Boshqaruv Paneli** (O'quvchilar, Guruhlar, Ustozlar, Moliya) | $550 | -$370 (-67%) | **$180** | 2,320,000 UZS |
| **4** | **Davomat & Uy Vazifasi Moduli** (Tezkor davomat va avto-saqlash) | $230 | -$160 (-70%) | **$70** | 900,000 UZS |
| **5** | **Talabalar Portali & Test Engine** (Taymerli test va natijalar) | $450 | -$310 (-69%) | **$140** | 1,810,000 UZS |
| **6** | **Game Zone & Gamifikatsiya** (Tangalar va matematik o'yin) | $170 | -$120 (-71%) | **$50** | 650,000 UZS |
| **7** | **Telegram Bot Integration** (Ota-ona avto-xabarnomasi) | $280 | -$180 (-64%) | **$100** | 1,290,000 UZS |
| **8** | **Mobil Adaptatsiya & Responsive** (Full Mobile Tuning & Widgets) | $200 | -$140 (-70%) | **$60** | 770,000 UZS |
|---:|:---|:---:|:---:|:---:|:---:|
| **JAMI** | **PROMAX PLATFORMA SMETASI** | ~~**$2,500**~~ | **-$1,700 (-68%)** | **$800** | **10,320,000 UZS** |

*\*Eslatma: Dollar kursi shartli ravishda 1 USD = 12,900 UZS sifatida ko'rsatilgan.*

---

## 🌟 4. TO'LASH UCHUN QULAY VARIANTLAR (PAYMENT OPTIONS)

1. 💵 **Bir martalik yakuniy to'lov:** **$800** *(10,320,000 UZS)*
2. 💳 **Bo'lib to'lash (Oyiga $100 dan):** Markazning oylik daromadidan 8 oy davomida bo'lib to'lab beriladi.
3. 🤝 **Boshlang'ich $400 + Oylik $50:** Dastlab $400, keyinchalik platforma o'quvchilar sonini oshirib markazga daromad keltira boshlagach har oy $50 dan.

---

## 🏁 5. QOSHIMCHA XIZMATLAR VA QO'LLAB-QUVVATLASH (MAINTENANCE)

- 🎁 **1 Oylik BePul Texnik Kafolat:** Tizim topshirilgandan so'ng 30 kun davomida kelib chiqishi mumkin bo'lgan har qanday xatoliklar bepul tuzatiladi.
- ☁️ **Server va Baza sozlashi:** Vercel va Supabase bepul tariflariga (Free tier) muvaffaqiyatli joylashtirildi.
