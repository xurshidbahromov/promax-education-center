# 📋 PROMAX EDUCATION CENTER - TO'LIQ PLATFORMA INVOICE & HISOB-KITOB SMETASI

**Loyiha nomi:** Promax Education Center — O'quv Markazi Boshqaruv Tizimi, Talabalar Portali (LMS) & Telegram Mini App  
**Texnologik stek:** Next.js 15 (App Router), TypeScript, TailwindCSS, Supabase (PostgreSQL, Auth, RLS, Realtime, Storage), Telegram WebApp SDK, Telegram Bot API, Framer Motion.  
**Sana:** 9-Sentabr, 2026-yil  
**Hujjat turi:** Loyiha smetasi, bajarilgan ishlar to'liq hisoboti va tijorat taklifi (Invoice)

---

## 🚀 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

Ushbu platforma **Promax Education Center** o'quv markazi faoliyatini 100% raqamlashtirish maqsadida yaratildi. Tizim quyidagi asosiy 4 ta yirik qismni qamrab oladi:
1. **O'quv markazi jamoat portali (Landing Page)** — O'quvchilar va ota-onalarni jalb qilish, kurslar, metodika, natijalar va yangiliklarni taqdim etish.
2. **Admin & O'qituvchilar CRM boshqaruv paneli** — O'quvchilar, guruhlar, ustozlar, davomat, uy vazifalari, e'lonlar, sovg'alar do'koni va moliyaviy hisob-kitoblar.
3. **Talabalar Shaxsiy Portali & Test Tizimi** — Onlayn testlar (rasmlarni kattalashtirish bilan), Mock DTM imtihonlari tahlili, Gamifikatsiya (Tangalar do'koni), Respublika hamda Xalqaro (SAT, IELTS) Musobaqalar/Olimpiadalar.
4. **Telegram Bot & Telegram WebApp (Mini App)** — To'g'ridan-to'g'ri Telegram ichida ishlovchi ilova, 10 daqiqa oldin eslatma beruvchi musobaqa xabarnomalari, avtomatlashtirilgan davomat bildirishnomalari va real-vaqt muhokama (izohlar) tizimi.

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
- 🗄 **PostgreSQL Arxitekturasi:** 18 dan ortiq to'liq normallashtirilgan jadvallar: `profiles`, `groups`, `group_students`, `attendance`, `subjects`, `tests`, `test_questions`, `test_attempts`, `exams`, `results`, `tournaments`, `tournament_results`, `tournament_registrations`, `tournament_comments`, `directions`, `announcements`, `notifications`, `payments`, `shop_items`, `orders`.
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
- 📢 **E'lonlar va Bildirishnomalar (`/admin/announcements`):** Admin tomonidan rasm va bannerlar bilan maqsadli e'lonlar chiqarish.
- 💳 **Moliya va To'lovlar (`/admin/payments`):** Oylik to'lovlar, qarzdorliklar va tushumlar hisobini yuritish.
- 🛍️ **Sovg'alar Do'koni Boshqaruvi (`/admin/shop`):** Tangalar evaziga beriladigan sovg'alarni kiritish, narxlarini belgilash va buyurtmalarni tasdiqlash.

### D. Talabalar Portali & Imtihon Markazi (`/dashboard`)
- 🏠 **Talaba Shaxsiy Kabineti (`/dashboard`):** Real-vaqt ko'rsatkichlari, haftalik faollik grafigi, o'rganilayotgan fanlar va e'lonlar.
- ✍️ **Onlayn Test Markazi (`/dashboard/tests`):** Vaqt taymeri bilan test topshirish, savollardagi rasmlarni modal orqali kattalashtirib (Image Zoom) ko'rish, avtomatik tezkor ball hisoblash va xatolar tahlili.
- 📈 **Natijalar va Tahlil (`/dashboard/results`):** Testlar va Mock DTM ballarining to'liq tahliliy statistikasi.
- 🏆 **Grand Olimpiadalar & Musobaqalar Moduli (`/dashboard/olympiads` & `/dashboard/international`):**
  - Respublika miqyosidagi fan olimpiadalari hamda Xalqaro (SAT 1600 shkalasi, AMC, IELTS) musobaqalar.
  - Maxsus **Chipta (Ticket)** dizayni: perforatsiya qirqimlari, jonli countdown taymer va holat stikerlari.
  - Tanga (Coins) orqali musobaqaga kirish va yutuq fondi (Sovg'alar, planshet, grantlar).
  - Jonli 3D Podium reytingi va haqiqiy profil rasmlari (Avatarlar) bilan yetakchilar doskasi.
  - **Jonli Muhokama & Izohlar (Comments):** Barcha fikrlarni profil ismi va surati bilan real-vaqtda ko'rsatish.
- 🎮 **Game Zone & Gamifikatsiya (`/dashboard/games` & `/dashboard/shop`):** Matematik chaqiruv o'yini orqali tangalar yig'ish va Tangalar do'konida sovg'alarga almashtirish.
- ⚙️ **Profil va Xavfsizlik (`/dashboard/profile`):** Shaxsiy surat yuklash, parol yangilash, til va mavzu tanlash.

### E. Telegram Mini App (WebApp) & Avtomatlashtirilgan Xabarnomalar
- 📱 **Telegram Mini App Integratsiyasi:** To'liq Telegram ilovasi ichida ishlovchi interfeys, avtomatik Telegram ma'lumotlari orqali kirish (Seamless Login), Haptic Feedback va tema moslashuvi.
- ⏰ **10 Daqiqa Oldin Jonli Eslatma Tizimi (`/api/tournaments/reminders`):** Ro'yxatdan o'tgan barcha o'quvchilarga musobaqa boshlanishidan 10 daqiqa oldin Telegram orqali to'g'ridan-to'g'ri eslatma va kirish tugmasi yetkazilishi.
- 🤖 **Ota-onalar Avtomatik Xabarnomasi (`/api/telegram/notify-attendance`):** Darsga kelmagan yoki vazifa bajarmagan o'quvchining ota-onasiga soniyalar ichida shaxsiylashtirilgan bot xabari.

---

## 💰 3. BATAFSIL CHEGIRMALI LOYIHA SMETASI (INVOICE)

Quyida har bir modul bo'yicha asl bozor narxi, taqdim etilgan do'stona maxsus chegirma hamda yakuniy kelishilgan qiymat ko'rsatilgan:

| № | Modul / Funktsional Bo'lim | Asl Bozor Narxi | Taqdim Etilgan Chegirma | Yakuniy Narx (USD) | Yakuniy Narx (UZS)* |
|:---|:---|:---:|:---:|:---:|:---:|
| **1** | **Landing Page & Notched Design System** (Public portal, 18 ta yo'nalish, 3 ta til, dark mode) | $350 | -$170 (-49%) | **$180** | 2,124,000 UZS |
| **2** | **Supabase Backend, Realtime & Storage** (18 ta jadval, Auth SSR, RLS, Storage) | $350 | -$170 (-49%) | **$180** | 2,124,000 UZS |
| **3** | **Admin Boshqaruv Paneli (CRM)** (O'quvchilar, Guruhlar, Ustozlar, Moliya, Do'kon) | $600 | -$290 (-48%) | **$310** | 3,658,000 UZS |
| **4** | **Davomat & Uy Vazifasi Avtomatizatsiyasi** (Tezkor kiritish va Botga avtomatik uzatish) | $250 | -$120 (-48%) | **$130** | 1,534,000 UZS |
| **5** | **Talabalar Portali & Onlayn Test Engine** (Taymer, rasm zoom, tahlil, sertifikatlar) | $450 | -$220 (-49%) | **$230** | 2,714,000 UZS |
| **6** | **Grand Musobaqalar & Realtime Izohlar** (Chipta dizayni, SAT/IELTS, chat, jonli podium) | $400 | -$190 (-48%) | **$210** | 2,478,000 UZS |
| **7** | **Telegram Bot & Mini App + 10-daq Eslatma** (WebApp, 10 min qolganda xabar, davomat) | $350 | -$170 (-49%) | **$180** | 2,124,000 UZS |
| **8** | **Gamifikatsiya & Sovg'alar Do'koni** (Tangalar tizimi, matematika o'yini, sovg'alar) | $150 | -$70 (-47%) | **$80** | 944,000 UZS |
|---:|:---|:---:|:---:|:---:|:---:|
| **JAMI** | **PROMAX TO'LIQ EKOTIZIM SMETASI** | ~~**$2,900**~~ | **-$1,400 (-48%)** | **$1,500** | **17,700,000 UZS** |

*\*Eslatma: Dollar kursi Markaziy Bank rasmiy ko'rsatkichi asosida 1 USD = 11,800 UZS sifatida aniq hisoblangan.*

---

## 🌟 4. TO'LOV UCHUN QULAY VARIANTLAR (PAYMENT OPTIONS)

1. 💵 **Bir martalik yakuniy to'lov:** **$1,500** *(17,700,000 UZS)*
2. 💳 **Bo'lib to'lash (Oyiga $150 dan / ~1,770,000 UZS):** O'quv markazi byudjeti va daromadidan kelib chiqib, 10 oy davomida qulay grafik asosida.
3. 🤝 **Boshlang'ich $750 (8,850,000 UZS) + Oylik $125 (1,475,000 UZS):** Dastlabki to'lov amalga oshirilib, qolgan qismi 6 oy davomida to'lab boriladi.

---

## 🏁 5. QO'SHIMCHA KAFOLAT VA TEXNIK XIZMAT (LIFETIME SUPPORT)

- ♾️ **Butun Umrlik Bepul Texnik Xizmat va Kafolat (Lifetime Support):** Tizim to'liq kafolatlangan holda doimiy nazoratda bo'ladi. Har qanday texnik nosozliklar, server barqarorligi, xavfsizlik yangilanishlari va tizimni qo'llab-quvvatlash butun faoliyat davomida (umrbod) bepul ta'minlanadi.
- ☁️ **Bulutli Joylashtirish:** Vercel va Supabase serverlariga optimal tarzda sozlab joylashtirildi (Production-Ready).
- 📱 **Qurilmalar Moslashuvi:** Smartfonlar, planshetlar, noutbuklar va Telegram mobil ilovasida 100% mukammal ishlaydi.
