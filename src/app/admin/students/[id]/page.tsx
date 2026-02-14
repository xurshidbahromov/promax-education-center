"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/utils/supabase/client";
import {
    getStudentCourses,
    getMonthlyPaymentStatus,
    enrollStudentInCourse,
    addPayment,
    type StudentCourse,
    type MonthlyPaymentStatus
} from "@/lib/payments";
import {
    ArrowLeft,
    BookOpen,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Plus,
    X,
    User,
    Mail,
    Phone
} from "lucide-react";

interface StudentProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
}

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const studentId = params.id as string;

    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [paymentStatuses, setPaymentStatuses] = useState<MonthlyPaymentStatus[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);

    // Form states
    const [enrollForm, setEnrollForm] = useState({
        subject: "",
        monthly_fee: "",
        start_date: new Date().toISOString().split('T')[0]
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        payment_month: new Date().getMonth() + 1,
        payment_year: new Date().getFullYear(),
        payment_method: "cash" as "cash" | "card" | "transfer" | "other",
        notes: ""
    });

    useEffect(() => {
        loadStudentData();
    }, [studentId]);

    async function loadStudentData() {
        const supabase = createClient();

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single();

        if (profile) setStudent(profile);

        const studentCourses = await getStudentCourses(studentId);
        setCourses(studentCourses);

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const statuses = await getMonthlyPaymentStatus(studentId, currentMonth, currentYear);
        setPaymentStatuses(statuses);

        setLoading(false);
    }

    async function handleEnroll(e: React.FormEvent) {
        e.preventDefault();

        const result = await enrollStudentInCourse({
            student_id: studentId,
            subject: enrollForm.subject,
            monthly_fee: parseFloat(enrollForm.monthly_fee),
            start_date: enrollForm.start_date
        });

        if (result.success) {
            showToast("Student kursga yozildi!", "success");
            await loadStudentData();
            setShowEnrollModal(false);
            setEnrollForm({ subject: "", monthly_fee: "", start_date: new Date().toISOString().split('T')[0] });
        } else {
            showToast("Xatolik: " + result.error, "error");
        }
    }

    async function handleAddPayment(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCourse) return;

        const result = await addPayment({
            student_id: studentId,
            student_course_id: selectedCourse.id,
            amount: parseFloat(paymentForm.amount),
            payment_month: paymentForm.payment_month,
            payment_year: paymentForm.payment_year,
            payment_method: paymentForm.payment_method,
            notes: paymentForm.notes
        });

        if (result.success) {
            showToast("To'lov qo'shildi!", "success");
            await loadStudentData();
            setShowPaymentModal(false);
            setPaymentForm({
                amount: "",
                payment_month: new Date().getMonth() + 1,
                payment_year: new Date().getFullYear(),
                payment_method: "cash",
                notes: ""
            });
        } else {
            showToast("Xatolik: " + result.error, "error");
        }
    }

    const formatSubject = (subject: string) => {
        const map: Record<string, string> = {
            'matematika': 'Matematika',
            'ingliz_tili': 'Ingliz tili',
            'ona_tili': 'Ona tili',
            'fizika': 'Fizika',
            'kimyo': 'Kimyo',
            'biologiya': 'Biologiya',
            'tarix': 'Tarix',
            'geografiya': 'Geografiya'
        };
        return map[subject] || subject;
    };

    const getPaymentStatus = (courseId: string) => {
        return paymentStatuses.find(s => s.student_course_id === courseId);
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;
        const badges = {
            paid: <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"><CheckCircle size={14} /> To'liq</span>,
            partial: <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-1"><Clock size={14} /> Qisman</span>,
            overdue: <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1"><AlertCircle size={14} /> Muddati o'tgan</span>,
            pending: <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"><XCircle size={14} /> Kutilmoqda</span>
        };
        return badges[status as keyof typeof badges] || null;
    };

    if (loading) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/4"></div></div>;
    if (!student) return <div className="p-8 text-center">Student topilmadi</div>;

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">{student.full_name}</h1>
                    <p className="text-gray-500">Student ma'lumotlari</p>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-4">Shaxsiy ma'lumotlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ism</p>
                            <p className="font-semibold">{student.full_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Mail size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold">{student.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Phone size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefon</p>
                            <p className="font-semibold">{student.phone || "Kiritilmagan"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BookOpen size={24} className="text-blue-600" />
                        Yozilgan kurslar
                    </h2>
                    <button
                        onClick={() => setShowEnrollModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Kursga yozish
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Hali kurslar yo'q</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => {
                            const status = getPaymentStatus(course.id);
                            const percentage = status ? (status.paid_amount / status.required_amount) * 100 : 0;

                            return (
                                <div key={course.id} className={`border-2 rounded-xl p-6 ${status?.status === 'overdue' ? 'border-red-300' : 'border-gray-200'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold">{formatSubject(course.subject)}</h3>
                                            <p className="text-sm text-gray-500">{course.monthly_fee.toLocaleString()} so'm/oy</p>
                                        </div>
                                        {status && getStatusBadge(status.status)}
                                    </div>

                                    {status && (
                                        <>
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Joriy oy</span>
                                                    <span className="font-semibold">{percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${status.status === 'paid' ? 'bg-green-600' :
                                                            status.status === 'partial' ? 'bg-yellow-500' :
                                                                status.status === 'overdue' ? 'bg-red-600' : 'bg-gray-400'
                                                            }`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500">To'langan / Kerak</p>
                                                <p className="text-sm font-semibold">
                                                    {status.paid_amount.toLocaleString()} / {status.required_amount.toLocaleString()} so'm
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setShowPaymentModal(true);
                                        }}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CreditCard size={18} />
                                        To'lov qo'shish
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Enroll Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Kursga yozish</h3>
                            <button onClick={() => setShowEnrollModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEnroll} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Fan</label>
                                <select
                                    value={enrollForm.subject}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, subject: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                >
                                    <option value="">Tanlang...</option>
                                    <option value="matematika">Matematika</option>
                                    <option value="ingliz_tili">Ingliz tili</option>
                                    <option value="ona_tili">Ona tili</option>
                                    <option value="fizika">Fizika</option>
                                    <option value="kimyo">Kimyo</option>
                                    <option value="biologiya">Biologiya</option>
                                    <option value="tarix">Tarix</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Oylik to'lov (so'm)</label>
                                <input
                                    type="number"
                                    value={enrollForm.monthly_fee}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, monthly_fee: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="500000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Boshlanish</label>
                                <input
                                    type="date"
                                    value={enrollForm.start_date}
                                    onChange={(e) => setEnrollForm({ ...enrollForm, start_date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
                                    Bekor qilish
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    Qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">To'lov qo'shish</h3>
                            <button onClick={() => { setShowPaymentModal(false); setSelectedCourse(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium">Fan: {formatSubject(selectedCourse.subject)}</p>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Summa (so'm)</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder={selectedCourse.monthly_fee.toString()}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Oy</label>
                                    <select
                                        value={paymentForm.payment_month}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_month: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                            <option key={m} value={m}>{m}-oy</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Yil</label>
                                    <select
                                        value={paymentForm.payment_year}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, payment_year: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    >
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">To'lov usuli</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="cash">Naqd</option>
                                    <option value="card">Karta</option>
                                    <option value="transfer">O'tkazma</option>
                                    <option value="other">Boshqa</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Izoh</label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedCourse(null); }} className="flex-1 px-4 py-2 border rounded-lg">
                                    Bekor qilish
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                                    To'lov qo'shish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
