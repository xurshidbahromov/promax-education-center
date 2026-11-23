import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Inter, Fredoka, DM_Sans, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Background } from "@/components/Background";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
 title: "Promax Education Center | Zamonaviy Ta'lim Markazi",
 description: "Toshkent Chilonzor shahridagi eng zamonaviy o'quv markazi. OTM larga, IELTS, SAT va Xalqaro Universitetlarga tayyorlov.",
 keywords: ["O'quv markazi", "Urganch", "Xorazm", "IELTS", "SAT", "OTM", "Abituriyent", "Matematika", "Ingliz tili", "Promax Education"],
 openGraph: {
 title: "Promax Education Center",
 description: "Urganch shahridagi eng zamonaviy o'quv markazi",
 url: "https://promaxedu.uz",
 siteName: "Promax Education Center",
 locale: "uz_UZ",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 title: "Promax Education Center",
 description: "Zamonaviy ta'lim markazi - IELTS, SAT, Milliy Sertifikatlar",
 }
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className="scroll-smooth" suppressHydrationWarning>
 <body
 className={`${dmSans.variable} ${atkinson.variable} ${inter.variable} ${fredoka.variable} ${nunito.variable} antialiased text-slate-800 dark:text-slate-50 min-h-screen flex flex-col font-sans selection:bg-brand-blue/20 transition-colors duration-300`}
 >
 <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
 <NextTopLoader color="#F97316" height={3} showSpinner={false} />
 <ThemeProvider
 attribute="class"
 defaultTheme="system"
 enableSystem
 disableTransitionOnChange
 >
 <QueryProvider>
 <LanguageProvider>
 <Toaster 
 position="top-center"
 containerStyle={{ top: 16 }}
 toastOptions={{
 duration: 4000,
 style: {
 background: 'transparent',
 boxShadow: 'none',
 padding: 0,
 },
 className: "!max-w-[92vw] sm:!max-w-md !bg-white/90 dark:!bg-slate-900/90 !backdrop-blur-2xl !border !border-slate-200/80 dark:!border-slate-700/70 !shadow-xl !shadow-slate-900/10 !text-slate-800 dark:!text-slate-100 !font-semibold !text-xs sm:!text-sm !rounded-2xl !px-3.5 sm:!px-4 !py-2.5 sm:!py-3",
 success: {
 iconTheme: { primary: '#10b981', secondary: '#ffffff' }
 },
 error: {
 iconTheme: { primary: '#ef4444', secondary: '#ffffff' }
 }
 }}
 />
 {children}
 </LanguageProvider>
 </QueryProvider>
 </ThemeProvider>
 <Analytics />
 <SpeedInsights />
 </body>
 </html>
 );
}
