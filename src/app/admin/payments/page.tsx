"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Calendar,
    Users,
    CreditCard,
    Search,
    Download,
    Filter
} from "lucide-react";
import {
    getMonthlyRevenue,
    getOverduePayments,
    type PaymentTransaction,
    type MonthlyPaymentStatus
} from "@/lib/payments";
import { createClient } from "@/utils/supabase/client";
import { exportPaymentHistory } from "@/lib/excel-export";

interface PaymentWithDetails extends PaymentTransaction {
    student_name?: string;
    subject?: string;
}

export default function AdminPaymentsPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);

    // Stats
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [overdueAmount, setOverdueAmount] = useState(0);
    const [paymentRate, setPaymentRate] = useState(0);

    // Data
    const [recentPayments, setRecentPayments] = useState<PaymentWithDetails[]>([]);
    const [overduePayments, setOverduePayments] = useState<any[]>([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchDashboardData();
    }, [selectedMonth, selectedYear]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            // Get monthly revenue
            const monthRev = await getMonthlyRevenue(selectedMonth, selectedYear);
            setMonthlyRevenue(monthRev);

            // Get total revenue (all time)
            const { data: allPayments } = await supabase
                .from('payment_transactions')
                .select('amount');
            const total = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            setTotalRevenue(total);

            // Get recent payments with student names
            const { data: payments } = await supabase
                .from('payment_transactions')
                .select(`
                    *,
                    profiles!payment_transactions_student_id_fkey(full_name),
                    student_courses(subject)
                `)
                .order('payment_date', { ascending: false })
                .limit(10);

            const paymentsWithDetails = payments?.map(p => ({
                ...p,
                student_name: p.profiles?.full_name || 'Unknown',
                subject: p.student_courses?.subject || 'Unknown'
            })) || [];
            setRecentPayments(paymentsWithDetails);

            // Get overdue payments
            const overdue = await getOverduePayments();
            setOverdueAmount(overdue.reduce((sum, p) => sum + Number(p.remaining_amount), 0));

            // Fetch student names for overdue
            const overdueWithNames = await Promise.all(
                overdue.map(async (payment) => {
                    const { data: student } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', payment.student_id)
                        .single();

                    return {
                        ...payment,
                        student_name: student?.full_name || 'Unknown'
                    };
                })
            );
            setOverduePayments(overdueWithNames);

            // Calculate payment rate (simple: paid / (paid + overdue))
            const totalExpected = total + overdueAmount;
            const rate = totalExpected > 0 ? Math.round((total / totalExpected) * 100) : 100;
            setPaymentRate(rate);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const handleExportPayments = async () => {
        if (recentPayments.length === 0) {
            showToast("Export qilish uchun to'lovlar yo'q", "warning");
            return;
        }

        try {
            const exportData = recentPayments.map(p => ({
                student_name: p.student_name || 'Unknown',
                phone: 'N/A', // Not available in current data structure
                course_name: p.subject || 'N/A',
                amount: p.amount,
                payment_date: p.payment_date,
                month: selectedMonth,
                year: selectedYear,
                status: 'completed'
            }));

            setLoading(true);
            await exportPaymentHistory(exportData);
            showToast(`${recentPayments.length} ta to'lov Excel formatida yuklandi`, "success");
        } catch (error) {
            console.error('Export error:', error);
            showToast("Export qilishda xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('uz-UZ');
    };

    const getPaymentMethodBadge = (method: string) => {
        const colors = {
            cash: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            card: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            transfer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
            other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
        };

        const labels = {
            cash: 'Naqd',
            card: 'Karta',
            transfer: 'O\'tkazma',
            other: 'Boshqa'
        };

        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[method as keyof typeof colors] || colors.other}`}>
                {labels[method as keyof typeof labels] || method}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    To'lovlar Boshqaruvi
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Barcha to'lovlar va daromadlar statistikasi
                </p>
            </div>

            {/* Month/Year Selector */}
            <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                    <Calendar size={20} className="text-gray-500" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>
                                {new Date(2024, month - 1).toLocaleDateString('uz-UZ', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-brand-blue to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-blue-100 text-sm">Umumiy Daromad</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Shu oyda</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(monthlyRevenue)}
                        </p>
                    </div>
                </div>

                {/* Overdue Amount */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Muddati O'tgan</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(overdueAmount)}
                        </p>
                    </div>
                </div>

                {/* Payment Rate */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-brand-orange" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">To'lov Foizi</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {paymentRate}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Overdue Payments Alert */}
            {overduePayments.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0" size={24} />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                                Muddati O'tgan To'lovlar ({overduePayments.length})
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {overduePayments.slice(0, 5).map((payment) => {
                                    const daysOverdue = Math.floor(
                                        (new Date().getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24)
                                    );

                                    return (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {payment.student_name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {payment.student_courses?.subject} - {daysOverdue} kun kechikkan
                                                </p>
                                            </div>
                                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(payment.remaining_amount)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            {overduePayments.length > 5 && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                    +{overduePayments.length - 5} ta boshqa to'lov
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Payments Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        So'nggi To'lovlar
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPayments}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Download size={18} />
                            <span className="text-sm font-medium">Export</span>
                        </button>
                    </div>
                </div>

                {/* Payment Table - Horizontal scroll on mobile */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-800">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Sana
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    O'quvchi
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Fan
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Summa
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Usul
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        To'lovlar topilmadi
                                    </td>
                                </tr>
                            ) : (
                                recentPayments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                        <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {payment.student_name}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {payment.subject}
                                        </td>
                                        <td className="py-4 px-4 text-sm font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="py-4 px-4">
                                            {getPaymentMethodBadge(payment.payment_method)}
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
