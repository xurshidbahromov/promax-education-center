# Promax Education Center Platform 🎓

> A modern, comprehensive Learning Management System (LMS) designed for educational centers.

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

---

## 🚀 Project Status: MVP

**Current Version:** `v1.0.0 (MVP)`

This platform is currently in the **Minimum Viable Product (MVP)** stage. It includes all core functionalities required for the administration and student learning process.

### Version History
- **v1.0.0 (MVP)** - *Current*
    - Full Student Dashboard & Admin Panel
    - Online Testing System (DTM, Quiz)
    - Payment Tracking & Management
    - Announcements System
    - Mobile Responsive Design
    - Multi-language Support (UZ, RU, EN)

---

## 🌟 Key Features

### 👨‍🎓 Student Portal
- **Dashboard:** Real-time overview of progress, active courses, and announcements.
- **My Courses:** Track enrollment status and monthly payments.
- **Online Tests:** Take subject tests and DTM-style mock exams with auto-grading.
- **Results:** Detailed performance analysis and history.
- **Profile:** Manage personal info and security (password changes).

### 👮‍♂️ Admin Panel
- **User Management:** CRM-like interface for Students and Teachers.
- **Financial Dashboard:** Track revenue, monthly payments, and overdue accounts.
- **Content Management:** Create and manage Tests (Questions, Answers) and Announcements.
- **System Settings:** Configure global platform settings.
- **Data Export:** Export results and financial reports to Excel.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend (BaaS):** Supabase (Auth, Database, Realtime, Storage)
- **Utilities:** `xlsx` (Excel Export), `date-fns` (Date Formatting)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/promax-center/platform.git
cd platform
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📜 Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.
- `npm run analyze`: Runs the bundle analyzer to check build size.
- `npm run lint`: Runs ESLint to check for code quality issues.

---

## 🔒 License

This project is proprietary software developed for Promax Education Center.
