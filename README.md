# 🎓 Promax Education Center — Enterprise LMS & CRM Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1_(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Telegram](https://img.shields.io/badge/Telegram-Mini_App_%26_Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/ProMaxEduBot)
[![Vercel](https://img.shields.io/badge/Vercel-Production_Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://promax-education-center.vercel.app)

**A high-performance, enterprise-grade Learning Management System (LMS) and CRM built for modern education centers.**

[🌐 Live Production Website](https://promax-education-center.vercel.app) • [📱 Telegram Bot ](https://t.me/promaxedu_bot) • [📖 Full Specification & Invoice](./promax_invoice.md)

</div>

---

## 🌟 Overview

**Promax Education Center Platform** is a full-cycle educational ecosystem connecting students, parents, teachers, and administration into a seamless digital workspace. It combines an ultra-fast public landing portal, interactive student learning dashboard, real-time Olympiads engine, Gamified Coin Shop, comprehensive Admin CRM, and a complete Telegram Bot / Mini App integration.

---

## ⚡ Performance & Core Web Vitals (Audited)

Tested and verified via **Google Lighthouse** and **Google PageSpeed Insights**:

| Category | Desktop Score | Mobile Score | Core Web Vitals |
| :--- | :---: | :---: | :--- |
| 🚀 **Performance** | **95 / 100** 🟢 | **83 / 100** 🟢 | **FCP:** `0.9s` (Desktop) / `1.2s` (Mobile) |
| ♿ **Accessibility** | **96 / 100** 🟢 | **96 / 100** 🟢 | Fully accessible ARIA standards |
| 🛡️ **Best Practices** | **100 / 100** 🟢 | **96 / 100** 🟢 | Industry-standard HTTP Security Headers |
| 🔍 **SEO** | **100 / 100** 🟢 | **100 / 100** 🟢 | Structured Schema.org JSON-LD |

---

## 🚀 Key Modules & Capabilities

### 1. 👨‍🎓 Student Learning & Gamification Portal (`/dashboard`)
- **Interactive Dashboard:** Real-time metrics on completed tests, average scores, daily streak, and active announcements.
- **Online Test & DTM Mock Engine:** Timed examinations, DTM-standard score grading, instant answer analysis, and PDF report cards.
- **Grand Olympiads & Competitions (`/dashboard/olympiads`):** Live competition timer, real-time leaderboard ranking, and multi-user discussion room with profile avatars and likes.
- **Gamified Math Arena (`/dashboard/games`):** Interactive speed arithmetic challenges with instant coin rewards.
- **Coin Reward Shop (`/dashboard/shop`):** Exchange earned study coins for real center gifts, books, and merchandise.
- **Video Lessons & Materials (`/dashboard/lessons`):** Structured video archives, homework attachments, and downloadable files.

### 2. 🤖 Telegram Bot & Mini App Ecosystem (`@ProMaxEduBot` & `/tg`)
- **Telegram Mini App (`/tg`):** Access the full student dashboard directly inside the Telegram client.
- **Automated Parent Attendance Alerts:** 1-click notification sent directly to parents' Telegram when a student is absent or misses homework.
- **Digital Payment Receipts:** Automated Telegram payment confirmations and receipts.
- **Seamless Account Linking:** Secure HMAC-SHA256 authenticated Telegram widget login.

### 3. 👮‍♂️ Enterprise Admin CRM (`/admin`)
- **Student & Teacher CRM:** Complete profiles with parent contact info, enrolled groups, attendance history, and financial balance.
- **Group & Schedule Management:** Class timetables (Odd/Even days), classroom allocation, and assigned instructors.
- **Fast Attendance & Homework Marking:** Mark full class attendance in under 30 seconds with automatic Telegram parent dispatch.
- **Financial Analytics & Billing:** Track revenue, monthly tuition fees, payment methods (Cash/Click/Payme), and overdue debts.
- **Course & Content Builder:** Create subjects, lessons, test questions, and publish center-wide announcements.
- **Olympiad & Tournament Manager:** Schedule grand tournaments, set start/end timestamps, and monitor submissions.

### 4. 🌐 High-Converting Public Portal (`/`)
- **Creative Notched Folder Cards (`/courses`):** 18 categorized course programs (General, International Certifications, University Prep) with custom SVG folder tab geometry.
- **Interactive Methodology & Results:** Showcase pedagogical frameworks, university acceptance rates, and student achievements.
- **Full Localization & Theming:** Real-time language switcher (UZ / RU / EN) and adaptive Dark / Light mode.

---

## 🛠️ Architecture & Tech Stack

```
                                  PROMAX ARCHITECTURE
   
   [ Vercel Edge Global CDN ] ──────► [ Next.js 16 App Router (Turbopack) ]
              │                                      │
   [ Security Headers & AVIF/WebP ]                  │
                                                     ▼
   [ Telegram Mini App / Bot ] ◄─────► [ Supabase BaaS (PostgreSQL + RLS) ]
                                                     │
                                       ┌─────────────┴─────────────┐
                                       ▼                           ▼
                             [ Supabase Storage ]        [ Supabase Realtime ]
                                (Avatars/Media)             (Comments/Rank)
```

- **Framework:** Next.js 16.1 (Turbopack, App Router, Server Components)
- **Frontend Core:** React 19, TypeScript
- **Styling & Animation:** Tailwind CSS 3.4, Framer Motion, Lucide Icons
- **State & Data Caching:** TanStack React Query v5 (Optimistic updates & 3-minute SWR caching)
- **Backend / Database:** Supabase (PostgreSQL with 33 applied SQL migrations, Row-Level Security, Realtime WebSockets)
- **Monitoring & Telemetry:** `@vercel/analytics`, `@vercel/speed-insights`
- **Security:** Strict HSTS, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, zero client-side private secrets.

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram Bot Integration
TELEGRAM_BOT_TOKEN=123456789:AA...your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_custom_webhook_secret
NEXT_PUBLIC_BOT_USERNAME=ProMaxEduBot
NEXT_PUBLIC_APP_URL=https://promax-education-center.vercel.app
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/xurshidbahromov/promax-education-center.git
cd promax-education-center
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Compiles optimized production build (with full TypeScript verification) |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint code quality checks |
| `npm run analyze` | Launches Next.js bundle visualizer |

---

## 📂 Project Structure

```
promax-educationcenter/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login and Registration flows
│   │   ├── (public)/            # Public portal: Home, Courses, Methodology, Results
│   │   ├── admin/               # Admin CRM: Students, Groups, Attendance, Payments, Tests
│   │   ├── dashboard/           # Student portal: Tests, Olympiads, Lessons, Shop, Games
│   │   ├── tg/                  # Telegram Mini App entry point & linking
│   │   ├── api/                 # Secure API routes (Telegram Webhooks, Auth, Notifications)
│   │   └── layout.tsx           # Root layout with Vercel Analytics & Speed Insights
│   ├── components/              # UI components (Hero, Navbar, Footer, Modals, Cards)
│   ├── context/                 # Language, Theme, and Application contexts
│   ├── hooks/                   # React Query data hooks (useAdminData, useDashboardData)
│   ├── lib/                     # Telegram bot utilities, Supabase query helpers, phone formatters
│   ├── providers/               # TanStack QueryClient provider
│   └── utils/                   # Supabase server, client, and middleware connectors
├── supabase/
│   └── migrations/              # 33 production SQL migrations (RLS, Schemas, Triggers)
├── public/                      # Optimized static assets & course illustrations
├── next.config.ts               # Security headers, AVIF/WebP image cache, package tree-shaking
└── promax_invoice.md            # Commercial specification & project invoice
```

---

## 📄 License

Proprietary software developed for **Promax Education Center**. All rights reserved © 2026.
