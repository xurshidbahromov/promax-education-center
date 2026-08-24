# 📋 PROMAX EDUCATION CENTER - TO'LIQ PLATFORMA INVOICE & HISOB-KITOB SMETASI

**Loyiha nomi:** Promax Education Center — O'quv Markazi Boshqaruv Tizimi, Talabalar Portali (LMS) & Telegram Mini App  
**Texnologik stek:** Next.js 15 (App Router), TypeScript, TailwindCSS, Supabase (PostgreSQL, Auth, RLS, Realtime, Storage), Telegram WebApp SDK, Telegram Bot API, Framer Motion.  
**Sana:** 24-Avgust, 2026-yil  
**Hujjat turi:** Loyiha smetasi, bajarilgan ishlar to'liq hisoboti va tijorat taklifi (Invoice)

---

## 🚀 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

Ushbu platforma **Promax Education Center** o'quv markazi faoliyatini 100% raqamlashtirish maqsadida yaratildi. Tizim quyidagi asosiy 4 ta yirik qismni qamrab oladi:
1. **O'quv markazi jamoat portali (Landing Page)** — O'quvchilar va ota-onalarni jalb qilish, kurslar, metodika, natijalar va yangiliklarni taqdim etish.
2. **Admin & O'qituvchilar CRM boshqaruv paneli** — O'quvchilar, guruhlar, ustozlar, davomat, uy vazifalari, e'lonlar va moliyaviy hisob-kitoblar.
3. **Talabalar Shaxsiy Portali & Test Tizimi** — Onlayn testlar, Mock DTM imtihonlari tahlili, Gamifikatsiya (Tangalar) va Respublika miqyosidagi Onlayn Musobaqalar/Olimpiadalar.
4. **Telegram Bot & Telegram WebApp (Mini App)** — To'g'ridan-to'g'ri Telegram ichida ishlovchi ilova, avtomatlashtirilgan davomat xabarnomalari va real-vaqt muhokama (izohlar) tizimi.

---

## 🛠 2. BAJARILGAN ISHLAR RO'YXATI VA FUNKSIONAL BO'LIMLAR

### A. Tashqi Veb-Sayt & Landing Page (Public Portal)
- 🎨 **Zamonaviy Glassmorphic UI/UX Dizayn:** Dark/Light mode, maxsus brend ranglar, yumshoq ambient nurlar va zamonaviy animatsiyalar.
- 🏠 **Bosh sahifa (`/`):** Hero interaktiv blok, Kurslar Bento Grid preview, Metodologiya (Zig-zag diagramma), Interaktiv statistika, YouTube video markazi va FAQ.
- 📚 **Kreativ Kurslar Portali (`/courses` & `/courses/[id]`):** Barcha 18 ta yo'nalish (Umumta'lim, Xalqaro sertifikatlar: IELTS, SAT, CEFR va OTM: Inha, Westminster, Turin, AUT) uchun yangi zamonaviy Notched Tab Folder kartochkalari va batafsil o'quv dasturlari.
- 🏆 **Natijalar (`/results`):** Talabalarning IELTS, SAT, Milliy sertifikat va OTMga kirish natijalari ko'rgazmasi.
- ℹ️ **Biz haqimizda (`/about`) & Metodika (`/methodology`):** O'quv markazi falsafasi, o'qitish bosqichlari va qulay aloqa shakli.
- 🌐 **3 Tilli Xalqaro Tizim (i18n):** O'zbekcha, Inglizcha va Ruscha tillarida 100% tarjima va til almashtirish mexanizmi.

### B. Supabase Backend, Realtime & Xavfsizlik Arxitekturasi
- 🗄 **PostgreSQL Arxitekturasi:** 16 dan ortiq to'liq normallashtirilgan jadvallar: `profiles`, `groups`, `group_students`, `attendance`, `subjects`, `tests`, `test_questions`, `test_attempts`, `exams`, `results`, `olympiads`, `olympiad_comments`, `directions`, `announcements`, `notifications`, `payments`.
- 🔐 **RLS (Row Level Security) Xavfsizlik Siyosati:** Foydalanuvchi rollari (`admin`, `teacher`, `staff`, `student`) bo'yicha ma'lumotlar daxlsizligi va maxfiyligi kafolatlangan.
- ⚡ **Supabase Auth SSR & Storage:** Xavfsiz autentifikatsiya, sessiyalar boshqaruvi, middleware himoyasi va foydalanuvchi profillari uchun Avatar Storage integratsiyasi.
- 🔄 **Supabase Realtime Stream:** Izohlar, jonli musobaqa natijalari va xabarnomalarni sahifani yangilamasdan to'g'ridan-to'g'ri yangilash.

### C. Admin & O'qituvchilar Boshqaruv Paneli (`/admin`)
- 📊 **Asosiy Analitika:** Jami o'quvchilar, faol guruhlar, oylik tushum, faol testlar va tizimdagi so'nggi harakatlar jurnali.
- 🎓 **O'quvchilar boshqaruvi (`/admin/students`):** O'quvchilarni ro'yxatga olish, qidiruv/filtr, guruhlarga biriktirish, ota-ona ma'lumotlari va shaxsiy karta (`/admin/students/[id]`).
- 👨‍🏫 **O'qituvchilar va Xodimlar (`/admin/teachers`):** Ustozlarni biriktirish, rollarni sozlash va guruhlar nazorati.
- 📚 **Guruhlar boshqaruvi (`/admin/groups`):** Yangi guruhlar ochish, dars jadvallari, o'qituvchi va xonalar taqsimoti.
- 📋 **Davomat va Uy vazifasi moduli (`/admin/attendance`):** Guruhlar bo'yicha bir klikda davomat va vazifalarni belgilash hamda avtomatik Telegram xabarnoma yuborish.
- 📝 **Mock/DTM Imtihon natijalari (`/admin/results`):** Mock imtihon natijalarini kiritish, tahrirlash va guruh reytinglarini shakllantirish.
- 📢 **E'lonlar va Bildirishnomalar (`/admin/announcements`):** Admin tomonidan maqsadli e'lonlar chiqarish.
- 💳 **Moliya va To'lovlar (`/admin/payments`):** Oylik to'lovlar, qarzdorliklar va tushumlar hisobini yuritish.

### D. Talabalar Portali & Imtihon Markazi (`/dashboard`)
- 🏠 **Talaba Shaxsiy Kabineti (`/dashboard`):** Real-vaqt ko'rsatkichlari, haftalik faollik grafigi, o'rganilayotgan fanlar va e'lonlar.
- ✍️ **Onlayn Test Markazi (`/dashboard/tests`):** Vaqt taymeri bilan test topshirish, avtomatik tezkor ball hisoblash va xatolar tahlili.
- 📈 **Natijalar va Tahlil (`/dashboard/results`):** Testlar va Mock DTM ballarining to'liq tahliliy statistikasi.
- 🏆 **Grand Olimpiadalar & Musobaqalar Moduli (`/dashboard/olympiads`):**
  - Haftalik Respublika miqyosidagi fan olimpiadalari.
  - Tanga (Coins) orqali musobaqaga kirish va yutuq fondi (Sovg'alar, planshet, vaucherlar).
  - Jonli reyting va haqiqiy profil rasmlari (Avatarlar) bilan yetakchilar doskasi.
  - **Jonli Muhokama & Izohlar (Comments):** Telegram yoki sayt orqali yozilgan barcha fikrlarni profil ismi va surati bilan real-vaqtda ko'rsatish.
- 🎮 **Game Zone & Gamifikatsiya (`/dashboard/games`):** Matematik chaqiruv o'yini orqali tangalar yig'ish va faollikni oshirish.
- ⚙️ **Profil va Xavfsizlik (`/dashboard/profile`):** Shaxsiy surat yuklash, parol yangilash, til va mavzu tanlash.

### E. Telegram Mini App (WebApp) & Ota-onalar Avtomatizatsiyasi
- 📱 **Telegram Mini App Integratsiyasi:** To'liq Telegram ilovasi ichida ishlovchi interfeys, avtomatik Telegram ma'lumotlari orqali kirish (Seamless Login), Haptic Feedback va tema moslashuvi.
- 🤖 **Ota-onalar Avtomatik Xabarnomasi (`/api/telegram/notify-attendance`):** Darsga kelmagan yoki vazifa bajarmagan o'quvchining ota-onasiga soniyalar ichida shaxsiylashtirilgan bot xabari.

---

## 💰 3. BATAFSIL CHEGIRMALI LOYIHA SMETASI (INVOICE)

Quyida har bir modul bo'yicha asl bozor narxi, taqdim etilgan ehtiromli do'stona chegirma hamda yakuniy kelishilgan qiymat ko'rsatilgan:

| № | Modul / Funktsional Bo'lim | Asl Bozor Narxi | Taqdim Etilgan Chegirma | Yakuniy Narx (USD) | Yakuniy Narx (UZS)* |
|:---|:---|:---:|:---:|:---:|:---:|
| **1** | **Landing Page & Notched Design System** (Public portal, 3 ta til, dark mode) | $350 | -$230 (-66%) | **$120** | 1,550,000 UZS |
| **2** | **Supabase Backend, Realtime & Storage** (16 jadval, Auth, RLS, Storage) | $350 | -$230 (-66%) | **$120** | 1,550,000 UZS |
| **3** | **Admin Boshqaruv Paneli (CRM)** (O'quvchilar, Guruhlar, O'qituvchilar, Moliya) | $600 | -$400 (-67%) | **$200** | 2,580,000 UZS |
| **4** | **Davomat & Uy Vazifasi Avtomatizatsiyasi** (Tezkor kiritish va Botga uzatish) | $250 | -$170 (-68%) | **$80** | 1,030,000 UZS |
| **5** | **Talabalar Portali & Onlayn Test Engine** (Taymer, natijalar tahlili) | $450 | -$300 (-67%) | **$150** | 1,935,000 UZS |
| **6** | **Grand Musobaqalar & Realtime Izohlar Tizimi** (Olimpiadalar, reyting, chat) | $400 | -$280 (-70%) | **$120** | 1,550,000 UZS |
| **7** | **Telegram Bot & Telegram Mini App (WebApp)** (To'liq mobil integratsiya) | $350 | -$240 (-69%) | **$110** | 1,420,000 UZS |
| **8** | **Gamifikatsiya & Game Zone** (Tangalar tizimi va interaktiv o'yin) | $150 | -$100 (-67%) | **$50** | 645,000 UZS |
|---:|:---|:---:|:---:|:---:|:---:|
| **JAMI** | **PROMAX TO'LIQ EKOTIZIM SMETASI** | ~~**$2,900**~~ | **-$1,950 (-67%)** | **$950** | **12,250,000 UZS** |

*\*Eslatma: Dollar kursi shartli ravishda 1 USD ≈ 12,900 UZS sifatida hisoblangan.*

---

## 🌟 4. TO'LOV UCHUN QULAY VARIANTLAR (PAYMENT OPTIONS)

1. 💵 **Bir martalik yakuniy to'lov:** **$950** *(12,250,000 UZS)*
2. 💳 **Bo'lib to'lash (Oyiga $100–$120 dan):** O'quv markazi daromadidan kelib chiqib, bir necha oy davomida qulay grafik asosida.
3. 🤝 **Boshlang'ich $500 + Oylik $75:** Dastlabki to'lov amalga oshirilib, platforma o'quvchilar sonini kengaytirib daromad keltira boshlagach qolgan qismi to'lab boriladi.

---

## 🏁 5. QO'SHIMCHA KAFOLAT VA TEXNIK XIZMAT (SUPPORT)

- 🎁 **1 Oylik Bepul Kafolat:** Tizim topshirilgandan keyin 30 kun davomida har qanday texnik nosozliklar, moslashuvlar va qo'shimcha savollar bepul qo'llab-quvvatlanadi.
- ☁️ **Bulutli Joylashtirish:** Vercel va Supabase serverlariga optimal tarzda sozlab joylashtirildi (Production-Ready).
- 📱 **Qurilmalar Moslashuvi:** Smartfonlar, planshetlar, noutbuklar va Telegram mobil ilovasida 100% mukammal ishlaydi.
