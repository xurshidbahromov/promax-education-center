"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import heavy dashboard components for code splitting & performance
const StatsGrid = dynamic(() => import("@/components/dashboard/StatsGrid"));
const AnnouncementsList = dynamic(() => import("@/components/dashboard/AnnouncementsList"));
const ProgressChart = dynamic(() => import("@/components/dashboard/ProgressChart"));
const ActivityFeed = dynamic(() => import("@/components/dashboard/ActivityFeed"));
const LeaderboardWidget = dynamic(() => import("@/components/dashboard/LeaderboardWidget"));
const MyCourses = dynamic(() => import("@/components/MyCourses"));

export default function DashboardPage() {
    const { t } = useLanguage();

    // Only fetch basic user info here, let child components handle their own heavy data fetching
    const { data: user } = useCurrentUser();
    const { data: profile } = useUserProfile(user?.id);

    const userFullName = profile?.full_name || user?.user_metadata?.full_name || "Student";
    const currentUserId = user?.id;

    return (
        <div className="space-y-6 sm:space-y-8 pb-10">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-fredoka tracking-tighter drop-shadow-sm">
                        {t('auth.welcome')} 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">
                        {new Date().toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <StatsGrid userId={currentUserId} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Main Content: Announcements & Mock Chart */}
                <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8 lg:h-full">
                    <AnnouncementsList />
                    <ProgressChart userId={currentUserId} />
                </div>

                {/* Right Column: Activity, Leaderboard & CTA */}
                <div className="flex flex-col gap-6 sm:gap-8 lg:h-full">
                    <ActivityFeed userId={currentUserId} />
                    <LeaderboardWidget userId={currentUserId} />
                </div>
            </div>

            {/* My Courses Section */}
            <div className="pt-4">
                <MyCourses />
            </div>
        </div>
    );
}
