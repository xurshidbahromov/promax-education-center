"use client";

import {
    Users,
    GraduationCap,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        { title: "Total Students", value: "482", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20", trend: "+12%" },
        { title: "Active Teachers", value: "24", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20", trend: "Stable" },
        { title: "Monthly Revenue", value: "24.5M", icon: Wallet, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20", trend: "+8.2%" },
        { title: "Avg. Scores", value: "84%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20", trend: "+2.1%" },
    ];

    const recentActivity = [
        { user: "Azizbek T.", action: "Registered for IELTS", date: "2 mins ago", status: "New" },
        { user: "Malika K.", action: "Completed Mock Exam", date: "15 mins ago", status: "Result" },
        { user: "Jamshid A.", action: "Paid Monthly Fee", date: "1 hour ago", status: "Payment" },
        { user: "System", action: "Daily Backup", date: "4 hours ago", status: "System" },
        { user: "Sevara M.", action: "Updated Profile", date: "5 hours ago", status: "Update" },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, Administrator</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                    <button className="text-sm text-brand-blue hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {recentActivity.map((activity, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{activity.user}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{activity.action}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{activity.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                            {activity.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
