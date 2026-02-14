"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
    Search,
    Plus,
    MoreVertical,
    Filter,
    Download,
    User,
    Mail,
    Phone,
    Edit,
    Trash2,
    FileText,
    DollarSign
} from "lucide-react";
import { getStudents, deleteStudent, Student } from "@/lib/admin-queries";
import { getStudentPaymentSummary, type StudentPaymentSummary } from "@/lib/payments";
import PaymentBadge from "@/components/PaymentBadge";
import { exportStudentsList } from "@/lib/excel-export";

export default function AdminStudentsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'all_paid' | 'partial' | 'overdue' | 'no_courses'>('all');
    const [paymentSummaries, setPaymentSummaries] = useState<Map<string, StudentPaymentSummary>>(new Map());

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await getStudents(searchTerm);
            setStudents(data);

            // Fetch payment summaries for all students
            const summaries = new Map<string, StudentPaymentSummary>();
            await Promise.all(
                data.map(async (student) => {
                    const summary = await getStudentPaymentSummary(student.id);
                    summaries.set(student.id, summary);
                })
            );
            setPaymentSummaries(summaries);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham bu o'quvchini o'chirmoqchimisiz?")) return;

        setLoading(true);
        try {
            const result = await deleteStudent(id);
            if (result.success) {
                // Refresh list
                await fetchStudents();
                showToast("Student muvaffaqiyatli o'chirildi", "success");
            } else {
                showToast("Xatolik: " + result.error, "error");
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportStudents = async () => {
        const filteredStudents = students.filter(student => {
            const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.phone?.includes(searchTerm);

            if (paymentFilter === 'all') return matchesSearch;
            const summary = paymentSummaries.get(student.id);
            return matchesSearch && summary?.status === paymentFilter;
        });

        if (filteredStudents.length === 0) {
            showToast("Export qilish uchun talabalar yo'q", "warning");
            return;
        }

        try {
            setLoading(true);
            showToast("Excel fayl tayyorlanmoqda...", "info");
            await exportStudentsList(filteredStudents, paymentSummaries);
            showToast(`${filteredStudents.length} ta talaba Excel formatida yuklandi`, "success");
        } catch (error) {
            console.error('Export error:', error);
            showToast("Export qilishda xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <User className="text-brand-blue" size={32} />
                        Student Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage all registered students.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleExportStudents} className="h-10 px-4 flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    {/* Add Student functionality can be added later - currently registration is self-service */}
                    <button disabled className="h-10 px-4 flex items-center gap-2 bg-brand-blue/50 text-white rounded-xl text-sm font-medium cursor-not-allowed transition-colors shadow-sm">
                        <Plus size={18} />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="w-full sm:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value as any)}
                        className="h-10 px-4 flex-1 sm:flex-none flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    >
                        <option value="all">Barchasi</option>
                        <option value="all_paid">✅ To'langan</option>
                        <option value="partial">⚠️ Qisman</option>
                        <option value="overdue">❌ Muddati o'tgan</option>
                        <option value="no_courses">📚 Kurs yo'q</option>
                    </select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (() => {
                    const filteredStudents = students.filter(student => {
                        if (paymentFilter === 'all') return true;
                        const summary = paymentSummaries.get(student.id);
                        return summary?.status === paymentFilter;
                    });

                    if (filteredStudents.length === 0) {
                        return (
                            <div className="text-center py-12 text-gray-500">
                                No students found.
                            </div>
                        );
                    }

                    return filteredStudents.map((student) => {
                        const summary = paymentSummaries.get(student.id);
                        return (
                            <div key={student.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
                                {/* Student Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg uppercase shrink-0">
                                        {(student.full_name || "U").charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {student.full_name || "Unknown User"}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Role: {student.role}
                                        </p>
                                    </div>
                                    {summary && (
                                        <PaymentBadge
                                            status={summary.status}
                                            totalCourses={summary.totalCourses}
                                            overdueAmount={summary.totalOverdue}
                                        />
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone size={14} className="shrink-0" />
                                        <span className="truncate">{student.phone || "No phone"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Mail size={14} className="shrink-0" />
                                        <span className="text-gray-400 italic">Hidden</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User size={14} className="shrink-0" />
                                        <span>Joined {new Date(student.joined_at || "").toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/students/${student.id}`}
                                        className="flex-1 h-10 flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg font-medium text-sm transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
                                    >
                                        <FileText size={16} />
                                        Results
                                    </Link>
                                    <Link
                                        href={`/admin/students/${student.id}/edit`}
                                        className="flex-1 h-10 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg font-medium text-sm transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(student.id)}
                                        className="h-10 px-4 flex items-center justify-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>

            {/* Tablet+ Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : (() => {
                                const filteredStudents = students.filter(student => {
                                    if (paymentFilter === 'all') return true;
                                    const summary = paymentSummaries.get(student.id);
                                    return summary?.status === paymentFilter;
                                });

                                if (filteredStudents.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No students found.
                                            </td>
                                        </tr>
                                    );
                                }

                                return filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold uppercase">
                                                    {(student.full_name || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{student.full_name || "Unknown User"}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Role: {student.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Phone size={14} /> {student.phone || "No phone"}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Mail size={14} /> <span className="text-gray-400 italic">Hidden</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const summary = paymentSummaries.get(student.id);
                                                if (!summary) return <span className="text-xs text-gray-400">Loading...</span>;
                                                return <PaymentBadge
                                                    status={summary.status}
                                                    totalCourses={summary.totalCourses}
                                                    overdueAmount={summary.totalOverdue}
                                                />;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {new Date(student.joined_at || "").toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/students/${student.id}`}
                                                    title="Natijalarni ko'rish"
                                                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                >
                                                    <FileText size={16} />
                                                </Link>
                                                <Link
                                                    href={`/admin/students/${student.id}/edit`}
                                                    title="Tahrirlash"
                                                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    title="O'chirib yuborish"
                                                    className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
