"use client";

import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    Wallet,
    TrendingUp,
    FileText
} from "lucide-react";
import { getAdminStats, getRecentActivity } from "@/lib/admin-queries";
import Link from "next/link";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeTeachers: 0,
        monthlyRevenue: "0",
        totalTests: 0
    });
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([
                    getAdminStats(),
                    getRecentActivity()
                ]);
                setStats(statsData);
                setActivity(activityData);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        {
            title: "Jami O'quvchilar",
            value: stats.totalStudents,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            trend: "+12%" // Mock trend 
        },
        {
            title: "Faol O'qituvchilar",
            value: stats.activeTeachers,
            icon: GraduationCap,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            trend: "Stabil"
        },
        {
            title: "Oylik Tushum (Tahminiy)",
            value: stats.monthlyRevenue,
            suffix: " so'm",
            icon: Wallet,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            trend: "+8.2%"
        },
        {
            title: "Jami Testlar",
            value: stats.totalTests,
            icon: FileText,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            trend: "+2.1%"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Xush kelibsiz, Administrator</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            {/* Trend badge - kept mock for visual consistency */}
                            {/* <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700`}>
                                {stat.trend}
                            </span> */}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loading ? "-" : stat.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">{stat.suffix}</span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">So'nggi Faoliyat</h2>
                    <Link href="/admin/results" className="text-sm text-brand-blue hover:text-blue-700 font-medium">Barchasini ko'rish</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foydalanuvchi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harakat</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vaqt</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Yuklanmoqda...</td>
                                </tr>
                            ) : activity.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Hozircha faoliyat yo'q</td>
                                </tr>
                            ) : (
                                activity.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.user}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.action}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(item.date).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Result' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    item.status === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.status === 'Result' ? 'Natija' : 'Yangi'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
