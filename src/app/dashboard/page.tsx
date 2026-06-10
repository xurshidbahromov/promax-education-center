"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import heavy dashboard components for code splitting & performance
const SubjectsList = dynamic(() => import("@/components/dashboard/SubjectsList"));

export default function DashboardPage() {
 const { t } = useLanguage();

 // Only fetch basic user info here, let child components handle their own heavy data fetching
 const { data: user } = useCurrentUser();
 const { data: profile } = useUserProfile(user?.id);

 return (
 <div className="space-y-6 sm:space-y-8 pb-10">
 {/* Header */}
 <motion.div 
 initial={{ opacity: 0, y: -10 }} 
 animate={{ opacity: 1, y: 0 }} 
 className="flex flex-col md:flex-row md:items-center justify-between gap-4"
 >
 <div>
 <h1 className="text-3xl lg:text-5xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-fredoka tracking-tighter uppercase">
 {t('auth.welcome')} 👋
 </h1>
 <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
 {new Date().toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
 </p>
 </div>
 </motion.div>

 {/* Main Content: Subjects List */}
 <div className="pt-4">
 <SubjectsList />
 </div>
 </div>
 );
}
