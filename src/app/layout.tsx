import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Background } from "@/components/Background";
import QueryProvider from "@/providers/QueryProvider";
import ToastContainer from "@/components/ToastContainer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promax Education Center | Zamonaviy Ta'lim Markazi",
  description: "Xorazm Urganch shahridagi eng zamonaviy o'quv markazi. OTM larga, IELTS, SAT va Xalqaro Universitetlarga tayyorlov.",
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
        className={`${poppins.variable} antialiased text-gray-900 dark:text-slate-50 min-h-screen flex flex-col font-sans selection:bg-brand-blue/20 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ToastProvider>
              <LanguageProvider>
                <ToastContainer />
                {children}
              </LanguageProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
