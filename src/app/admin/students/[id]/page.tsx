"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Layers,
  Banknote,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck
} from "lucide-react";

interface StudentProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface EnrolledGroup {
  id: string;
  name: string;
  schedule: string | null;
  price: number | null;
  subject_title: string;
  teacher_name: string | null;
}

interface PaymentRecord {
  id: string;
  amount: number;
  month_year: string;
  status: 'completed' | 'partial' | 'pending';
  payment_method: string;
  payment_date: string;
  group_name: string;
}

interface ExamResult {
  id: string;
  exam_title: string;
  total_score: number;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: studentId } = use(params);

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [groups, setGroups] = useState<EnrolledGroup[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      try {
        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', studentId)
          .single();

        if (profile) setStudent(profile);

        // 2. Fetch Enrolled Groups via group_students
        const { data: groupStudentsData } = await supabase
          .from('group_students')
          .select(`
            group:groups(
              id, name, schedule, price,
              subject:subjects(title),
              teacher:profiles!groups_teacher_id_fkey(full_name)
            )
          `)
          .eq('student_id', studentId);

        const mappedGroups: EnrolledGroup[] = (groupStudentsData || [])
          .map((item: any) => {
            const g = item.group;
            if (!g) return null;
            return {
              id: g.id,
              name: g.name,
              schedule: g.schedule,
              price: g.price,
              subject_title: g.subject?.title || 'Fan kiritilmagan',
              teacher_name: g.teacher?.full_name || "Biriktirilmagan"
            };
          })
          .filter(Boolean) as EnrolledGroup[];

        setGroups(mappedGroups);

        // 3. Fetch Payments
        const { data: paymentsData } = await supabase
          .from('payments')
          .select(`
            id, amount, month_year, status, payment_method, payment_date,
            group:groups(name)
          `)
          .eq('student_id', studentId)
          .order('payment_date', { ascending: false });

        const mappedPayments: PaymentRecord[] = (paymentsData || []).map((p: any) => ({
          id: p.id,
          amount: p.amount,
          month_year: p.month_year,
          status: p.status,
          payment_method: p.payment_method,
          payment_date: p.payment_date,
          group_name: p.group?.name || 'Guruh'
        }));

        setPayments(mappedPayments);

        // 4. Fetch Exam Results
        const { data: resultsData } = await supabase
          .from('results')
          .select(`
            id, total_score, created_at,
            exam:exams(title)
          `)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        const mappedResults: ExamResult[] = (resultsData || []).map((r: any) => ({
          id: r.id,
          total_score: Number(r.total_score) || 0,
          created_at: r.created_at,
          exam_title: r.exam?.title || 'DTM Imtihon'
        }));

        setExamResults(mappedResults);
      } catch (e) {
        console.error("Error loading student detail:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl w-48" />
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-16 text-center text-slate-400">
        <User size={36} className="mx-auto mb-2 opacity-40" />
        <p className="text-base font-semibold">O'quvchi ma'lumotlari topilmadi</p>
        <button
          onClick={() => router.push('/admin/students')}
          className="mt-4 px-4 py-2 text-xs font-bold text-brand-blue hover:underline"
        >
          O'quvchilar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  const initial = (student.full_name || "?")[0].toUpperCase();
  const formattedJoinedDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : "Ma'lum emas";

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6">
      {/* Header & Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/students')}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Orqaga"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            {student.full_name || "Ismsiz O'quvchi"}
          </h1>
          <p className="text-xs text-slate-400 font-medium">O'quvchi statusi va ma'lumotlari</p>
        </div>
      </div>

      {/* Profile Overview (Box-free Minimalist Glassy Card) */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-slate-700 dark:text-slate-200 shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{student.full_name || "Ismsiz"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                O'quvchi
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 mt-1.5">
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                {student.phone || "Telefon ko'rsatilmadi"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Ro'yxatdan o'tgan: {formattedJoinedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-blue hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            To'lov sahifasiga o'tish
          </Link>
        </div>
      </div>

      {/* Grid: Groups & Payments Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrolled Groups Status */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Qatnashadigan Guruhlari</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{groups.length} ta guruh</span>
          </div>

          {groups.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs font-medium">Hozircha birorta guruhga biriktirilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(g => (
                <div key={g.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{g.name}</span>
                    <span className="text-xs font-semibold text-slate-500">{g.subject_title}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>O'qituvchi: {g.teacher_name}</span>
                    <span>{g.schedule || "Dars vaqti kiritilmagan"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments History & Status */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-slate-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">To'lovlar Tarixi</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{payments.length} ta yozuv</span>
          </div>

          {payments.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-xs font-medium">Hozircha to'lov yozuvlari yo'q</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {payments.map(p => {
                const isPaid = p.status === 'completed';
                const isPartial = p.status === 'partial';

                return (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{p.month_year} oyi</span>
                        <span className="text-[11px] font-medium text-slate-400">• {p.group_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.payment_method} orqali to'langan</p>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                        {p.amount.toLocaleString('uz-UZ')} so'm
                      </p>
                      {isPaid ? (
                        <span className="text-[10px] font-bold uppercase text-emerald-600">To'langan</span>
                      ) : isPartial ? (
                        <span className="text-[10px] font-bold uppercase text-amber-600">Qisman</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-red-500">To'lamagan</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exam Results & Score Performance */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Imtihon & Test Natijalari</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">{examResults.length} ta natija</span>
        </div>

        {examResults.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <p className="text-xs font-medium">Hozircha topshirilgan test natijalari yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {examResults.map(res => (
              <div key={res.id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{res.exam_title}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(res.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {res.total_score.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">ball</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
