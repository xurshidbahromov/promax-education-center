'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Banknote,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  X,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Clock,
  Users,
  Layers,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Calculator,
  Atom,
  Languages,
  Code2,
  FlaskConical,
  Dna,
  Landmark,
  Receipt,
  LayoutGrid,
  List,
  Sparkles,
  Send
} from 'lucide-react';
import { useSubjects } from '@/hooks/useAdminData';
import { useExpectedPayments, processPayment, deletePayment, ExpectedPayment } from '@/hooks/usePayments';
import toast from 'react-hot-toast';

function getSubjectMeta(subjectName: string = '') {
  const s = subjectName.toLowerCase();
  if (s.includes('matematik') || s.includes('algebra') || s.includes('geometriya') || s.includes('math')) {
    return {
      Icon: Calculator,
      colorText: 'text-blue-600 dark:text-blue-400',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      pillActive: 'bg-blue-600 text-white',
    };
  }
  if (s.includes('fizik') || s.includes('physic')) {
    return {
      Icon: Atom,
      colorText: 'text-purple-600 dark:text-purple-400',
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      pillActive: 'bg-purple-600 text-white',
    };
  }
  if (s.includes('ingliz') || s.includes('ielts') || s.includes('cefr') || s.includes('english')) {
    return {
      Icon: Languages,
      colorText: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      pillActive: 'bg-amber-600 text-white',
    };
  }
  if (s.includes('dastur') || s.includes('it') || s.includes('python') || s.includes('frontend') || s.includes('code')) {
    return {
      Icon: Code2,
      colorText: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      pillActive: 'bg-emerald-600 text-white',
    };
  }
  if (s.includes('kimyo') || s.includes('chemist')) {
    return {
      Icon: FlaskConical,
      colorText: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      pillActive: 'bg-rose-600 text-white',
    };
  }
  if (s.includes('biolog')) {
    return {
      Icon: Dna,
      colorText: 'text-teal-600 dark:text-teal-400',
      badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      pillActive: 'bg-teal-600 text-white',
    };
  }
  if (s.includes('tarix') || s.includes('huquq')) {
    return {
      Icon: Landmark,
      colorText: 'text-orange-600 dark:text-orange-400',
      badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      pillActive: 'bg-orange-600 text-white',
    };
  }
  return {
    Icon: BookOpen,
    colorText: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    pillActive: 'bg-indigo-600 text-white',
  };
}

const formatMoney = (amount: number) => {
  return (amount || 0).toLocaleString('uz-UZ') + " so'm";
};

// ── SKELETON LOADERS ──
function PaymentsGridSkeleton() {
  return (
    <div className="space-y-12 animate-pulse pt-2">
      {[1, 2].map((sIndex) => (
        <div key={sIndex} className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-5 w-36 rounded-lg bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-5 w-16 rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((cIndex) => (
              <div
                key={cIndex}
                className="p-5 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-4 h-48 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
                  <div className="h-4 w-12 rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/80" />
                  <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-slate-200/50 dark:bg-slate-800/50" />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                    <div className="h-3 w-16 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentStudentsListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-200/80 dark:bg-slate-800/80 rounded-md" />
              <div className="h-3 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-8 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGroupId = searchParams.get('groupId');

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}`;
  });

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'collected_desc' | 'students_desc' | 'debtors_desc'>('name_asc');
  const [viewMode, setViewMode] = useState<'groups' | 'table'>('groups');
  const [groupStudentStatusFilter, setGroupStudentStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');

  const { data: subjects = [] } = useSubjects();
  const { data: payments = [], isLoading, mutate } = useExpectedPayments(
    currentMonth,
    'all',
    'all',
    'all'
  );

  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; data: ExpectedPayment | null }>({
    isOpen: false,
    data: null,
  });

  const [paymentMode, setPaymentMode] = useState<'add_remaining' | 'set_total'>('add_remaining');

  const [paymentForm, setPaymentForm] = useState<{ amount: number; method: 'cash' | 'card' | 'transfer' }>({
    amount: 0,
    method: 'cash',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global KPI Summary
  const globalSummary = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let pendingCount = 0;
    let paidCount = 0;

    payments.forEach((p) => {
      expected += p.groupPrice;
      if (p.payment) {
        collected += p.payment.amount;
        if (p.payment.status === 'completed') paidCount++;
        else pendingCount++;
      } else {
        pendingCount++;
      }
    });

    return { expected, collected, pendingCount, paidCount };
  }, [payments]);

  // Aggregate Data by Groups
  const groupSummaries = useMemo(() => {
    const groupMap = new Map<
      string,
      {
        id: string;
        name: string;
        subjectTitle: string;
        groupPrice: number;
        students: ExpectedPayment[];
        expectedTotal: number;
        collectedTotal: number;
        paidCount: number;
        unpaidCount: number;
        partialCount: number;
        totalStudents: number;
      }
    >();

    payments.forEach((p) => {
      const cleanSubj = (p.subjectTitle || 'Boshqa fanlar').replace(/^[\p{Emoji}\p{Extended_Pictographic}\u200d\uFE0F\s]+/gu, '').trim() || 'Boshqa fanlar';

      if (!groupMap.has(p.groupId)) {
        groupMap.set(p.groupId, {
          id: p.groupId,
          name: p.groupName,
          subjectTitle: cleanSubj,
          groupPrice: p.groupPrice || 0,
          students: [],
          expectedTotal: 0,
          collectedTotal: 0,
          paidCount: 0,
          unpaidCount: 0,
          partialCount: 0,
          totalStudents: 0,
        });
      }

      const grp = groupMap.get(p.groupId)!;
      grp.students.push(p);
      grp.expectedTotal += p.groupPrice;
      grp.totalStudents += 1;

      if (p.payment) {
        grp.collectedTotal += p.payment.amount;
        if (p.payment.status === 'completed') {
          grp.paidCount += 1;
        } else {
          grp.partialCount += 1;
          grp.unpaidCount += 1;
        }
      } else {
        grp.unpaidCount += 1;
      }
    });

    return Array.from(groupMap.values());
  }, [payments]);

  // Group by Subject
  const groupedBySubject = useMemo(() => {
    const map: Record<string, typeof groupSummaries> = {};
    groupSummaries.forEach((g) => {
      const subj = g.subjectTitle || 'Boshqa fanlar';
      if (!map[subj]) {
        map[subj] = [];
      }
      map[subj].push(g);
    });
    return map;
  }, [groupSummaries]);

  const subjectList = useMemo(() => Object.keys(groupedBySubject), [groupedBySubject]);

  // Active Group Details
  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return groupSummaries.find((g) => g.id === activeGroupId) || null;
  }, [groupSummaries, activeGroupId]);

  // Active Group Students Filtered
  const activeGroupStudents = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.students.filter((s) => {
      const matchesSearch =
        (s.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.studentPhone || '').includes(searchQuery);

      const isPaid = s.payment?.status === 'completed';
      const isPartial = s.payment?.status === 'partial';
      const isUnpaid = !s.payment;

      const matchesStatus =
        groupStudentStatusFilter === 'all' ||
        (groupStudentStatusFilter === 'paid' && isPaid) ||
        (groupStudentStatusFilter === 'unpaid' && isUnpaid) ||
        (groupStudentStatusFilter === 'partial' && isPartial);

      return matchesSearch && matchesStatus;
    });
  }, [activeGroup, searchQuery, groupStudentStatusFilter]);

  // Flat Filtered Payments for Table Mode
  const filteredFlatPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSubject = selectedSubjectFilter === 'all' || p.subjectTitle === selectedSubjectFilter;
      const matchesSearch =
        !searchQuery ||
        (p.studentName && p.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.studentPhone && p.studentPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSubject && matchesSearch;
    });
  }, [payments, selectedSubjectFilter, searchQuery]);

  // Handlers
  const handleOpenGroup = (groupId: string) => {
    router.push(`/admin/payments?groupId=${groupId}`);
  };

  const handleBackToGroups = () => {
    router.push('/admin/payments');
  };

  const openPaymentModal = (item: ExpectedPayment) => {
    const prevPaid = item.payment?.amount || 0;
    const remaining = Math.max(0, item.groupPrice - prevPaid);

    if (item.payment && item.payment.status === 'partial') {
      // Partial payment: Default to adding the remaining debt!
      setPaymentMode('add_remaining');
      setPaymentForm({
        amount: remaining,
        method: item.payment.payment_method || 'cash',
      });
    } else if (item.payment) {
      // Already full: Default to set_total mode
      setPaymentMode('set_total');
      setPaymentForm({
        amount: item.payment.amount,
        method: item.payment.payment_method || 'cash',
      });
    } else {
      // Unpaid: Default to full group price
      setPaymentMode('set_total');
      setPaymentForm({
        amount: item.groupPrice,
        method: 'cash',
      });
    }
    setPaymentModal({ isOpen: true, data: item });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, data: null });
  };

  const handleSavePayment = async () => {
    if (!paymentModal.data) return;
    setIsSubmitting(true);

    const { amount, method } = paymentForm;
    const { studentId, groupId, groupPrice, payment } = paymentModal.data;
    const prevPaid = payment?.amount || 0;

    let finalAmount = amount;
    if (paymentMode === 'add_remaining' && payment) {
      finalAmount = prevPaid + amount;
    }

    const status = finalAmount >= groupPrice ? 'completed' : 'partial';

    const res = await processPayment(studentId, groupId, finalAmount, currentMonth, method, status);

    if (res.success) {
      toast.success(
        status === 'completed'
          ? "To'lov to'liq saqlandi va Telegram orqali kvitansiya yuborildi!"
          : "Qisman to'lov saqlandi va Telegram orqali xabarnoma yuborildi!"
      );
      mutate();
      closePaymentModal();
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
    }

    setIsSubmitting(false);
  };

  const handleClearPayment = async (item: ExpectedPayment) => {
    if (!confirm(`${item.studentName} ning to'lovini bekor qilasizmi?`)) return;

    const res = await deletePayment(item.studentId, item.groupId, currentMonth);
    if (res.success) {
      toast.success("To'lov bekor qilindi");
      mutate();
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 1: DEDICATED GROUP PAYMENTS SHEET (ICHMA-ICH KIRILGAN GURUH TO'LOVLARI)
  // ══════════════════════════════════════════════════════════════════════════════
  if (activeGroupId && activeGroup) {
    const meta = getSubjectMeta(activeGroup.subjectTitle);
    const { Icon: SubjectIcon } = meta;

    const groupProgressPercent = activeGroup.expectedTotal > 0
      ? Math.round((activeGroup.collectedTotal / activeGroup.expectedTotal) * 100)
      : 0;

    return (
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToGroups}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors flex items-center gap-2 group text-xs font-bold"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Guruhlarga qaytish</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Moliya & To'lovlar</span>
              <ChevronRight size={14} />
              <span className="text-slate-600 dark:text-slate-300">{activeGroup.subjectTitle}</span>
              <ChevronRight size={14} />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeGroup.name}</span>
            </div>
          </div>

          {/* Month Picker */}
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 self-start sm:self-auto">
            <Calendar size={15} className="text-emerald-500 shrink-0" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Group Banner & KPI Cards */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Group Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <SubjectIcon size={22} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                    {activeGroup.name}
                  </h1>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${meta.badgeClass}`}>
                    {activeGroup.subjectTitle}
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {formatMoney(activeGroup.groupPrice)} / oy
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Users size={14} />
                    <span>{activeGroup.totalStudents} nafar o'quvchi</span>
                  </span>
                  <span>•</span>
                  <span>{currentMonth} oyi to'lov hisoboti</span>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="O'quvchini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kutilayotgan</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-100">{formatMoney(activeGroup.expectedTotal)}</span>
              </div>
              <Wallet size={18} className="text-slate-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Yig'ilgan ({groupProgressPercent}%)</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatMoney(activeGroup.collectedTotal)}</span>
              </div>
              <Banknote size={18} className="text-emerald-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">To'laganlar</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{activeGroup.paidCount} ta</span>
              </div>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Qarzdorlar</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400">{activeGroup.unpaidCount} ta</span>
              </div>
              <AlertCircle size={18} className="text-rose-500" />
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setGroupStudentStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              groupStudentStatusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
            }`}
          >
            Barchasi ({activeGroup.totalStudents})
          </button>
          <button
            onClick={() => setGroupStudentStatusFilter('paid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              groupStudentStatusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>To'laganlar ({activeGroup.paidCount})</span>
          </button>
          <button
            onClick={() => setGroupStudentStatusFilter('unpaid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              groupStudentStatusFilter === 'unpaid'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
            }`}
          >
            <XCircle size={13} />
            <span>Qarzdorlar ({activeGroup.unpaidCount})</span>
          </button>
          {activeGroup.partialCount > 0 && (
            <button
              onClick={() => setGroupStudentStatusFilter('partial')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                groupStudentStatusFilter === 'partial'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
              }`}
            >
              <AlertCircle size={13} />
              <span>Qisman ({activeGroup.partialCount})</span>
            </button>
          )}
        </div>

        {/* Student Payment Rows */}
        {isLoading ? (
          <PaymentStudentsListSkeleton />
        ) : activeGroupStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">O'quvchilar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGroupStudents.map((item, index) => {
              const isPaid = item.payment?.status === 'completed';
              const isPartial = item.payment?.status === 'partial';

              return (
                <div
                  key={`${item.studentId}-${item.groupId}`}
                  className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border rounded-3xl p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPaid
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                      : isPartial
                      ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10'
                      : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left: Student info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                          {item.studentName || 'Ismsiz'}
                        </h3>
                        {isPaid ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>To'langan</span>
                          </span>
                        ) : isPartial ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <AlertCircle size={11} />
                            <span>Qisman to'langan</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <XCircle size={11} />
                            <span>Qarzdor</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                        <span>Tel: {item.studentPhone || 'Kiritilmagan'}</span>
                        <span>•</span>
                        <span>Oylik to'lov: <b className="text-slate-700 dark:text-slate-300">{formatMoney(item.groupPrice)}</b></span>
                        {item.payment && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              To'landi: {formatMoney(item.payment.amount)}
                            </span>
                            {isPartial && (
                              <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                Qolgan qarz: {formatMoney(Math.max(0, item.groupPrice - item.payment.amount))}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => openPaymentModal(item)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 shadow-sm shadow-emerald-500/20'
                      }`}
                    >
                      <Receipt size={14} />
                      <span>{isPartial ? "Qolganini to'lash" : isPaid ? "To'lovni tahrirlash" : "To'lov qabul qilish"}</span>
                    </button>

                    {item.payment && (
                      <button
                        onClick={() => handleClearPayment(item)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-500/10"
                        title="To'lovni bekor qilish"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {paymentModal.isOpen && paymentModal.data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  To'lov qabul qilish
                </h3>
                <button onClick={closePaymentModal} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{paymentModal.data.studentName}</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                  {paymentModal.data.groupName} • {currentMonth} oyi uchun
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Oylik to'lov summasi:</span>
                  <span className="text-slate-800 dark:text-slate-100 font-bold">{formatMoney(paymentModal.data.groupPrice)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">To'langan summa</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                      value={paymentForm.amount || ''}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      UZS
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">To'lov usuli</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'cash', label: 'Naqd pul', icon: Banknote },
                      { id: 'card', label: 'Karta', icon: CreditCard },
                      { id: 'transfer', label: "O'tkazma", icon: Wallet }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentForm({ ...paymentForm, method: method.id as 'cash'|'card'|'transfer' })}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                          paymentForm.method === method.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <method.icon size={18} className={paymentForm.method === method.id ? 'text-emerald-500' : 'text-slate-400'} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={closePaymentModal} className="px-4 py-2 text-xs font-bold text-slate-500">
                  Bekor qilish
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={isSubmitting || paymentForm.amount <= 0}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? "Saqlanmoqda..." : "Saqlash va Chek Yuborish"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 2: MASTER GROUPS & FINANCIAL OVERVIEW (UMUMIY GURUHLAR VA FANLAR BOXLARI)
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Moliya va To'lovlar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Guruhlar bo'yicha to'lovlar, qarzdorliklar va kutilayotgan tushumlar ({groupSummaries.length} ta guruh)
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 self-start md:self-auto">
          <Calendar size={15} className="text-emerald-500 shrink-0" />
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Kutilayotgan summa", value: formatMoney(globalSummary.expected), icon: Wallet, color: "text-blue-500" },
          { label: "Yig'ilgan summa", value: formatMoney(globalSummary.collected), icon: Banknote, color: "text-emerald-500" },
          { label: "To'lov qilganlar", value: `${globalSummary.paidCount} ta o'quvchi`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Qarzdorlar", value: `${globalSummary.pendingCount} ta o'quvchi`, icon: AlertCircle, color: "text-rose-500" }
        ].map((s, i) => (
          <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">{s.value}</p>
            </div>
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH, SORT & VIEW SWITCHER ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Guruh, fan yoki o'quvchi ismi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown size={14} className="text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="name_asc">Nomi (A - Z)</option>
            <option value="name_desc">Nomi (Z - A)</option>
            <option value="collected_desc">Yig'ilgan summa (ko'pdan kamga)</option>
            <option value="debtors_desc">Qarzdorlar (ko'pdan kamga)</option>
            <option value="students_desc">O'quvchilar soni (ko'pdan kamga)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
          <button
            onClick={() => setViewMode('groups')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'groups'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Guruhlar bo'yicha ko'rinish"
          >
            <LayoutGrid size={15} />
            <span className="hidden md:inline">Guruhlar</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title="Barcha to'lovlar jadvali"
          >
            <List size={15} />
            <span className="hidden md:inline">Barcha To'lovlar</span>
          </button>
        </div>
      </div>

      {/* ── SUBJECT FILTER PILLS ── */}
      <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedSubjectFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            selectedSubjectFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers size={13} />
          <span>Barcha fanlar ({groupSummaries.length})</span>
        </button>

        {subjectList.map((subj) => {
          const meta = getSubjectMeta(subj);
          const { Icon: SubjIcon } = meta;
          const isSelected = selectedSubjectFilter === subj;
          const count = groupedBySubject[subj]?.length || 0;

          return (
            <button
              key={subj}
              onClick={() => setSelectedSubjectFilter(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isSelected
                  ? meta.pillActive
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <SubjIcon size={13} />
              <span>{subj}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-extrabold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── MODE 1: SUBJECT SECTIONS & GROUPS CARDS GRID (DEFAULT) ── */}
      {viewMode === 'groups' ? (
        isLoading ? (
          <PaymentsGridSkeleton />
        ) : groupSummaries.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Guruhlar topilmadi</p>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-14 pt-2">
            {subjectList
              .filter((subj) => selectedSubjectFilter === 'all' || selectedSubjectFilter === subj)
              .map((subjectName, index) => {
                const meta = getSubjectMeta(subjectName);
                const { Icon: SubjectIcon } = meta;

                const allSubjectGroups = groupedBySubject[subjectName] || [];
                let subjectGroups = allSubjectGroups.filter((g) => {
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    g.name.toLowerCase().includes(q) ||
                    subjectName.toLowerCase().includes(q) ||
                    g.students.some((st) => (st.studentName || '').toLowerCase().includes(q))
                  );
                });

                // Apply Sorting
                subjectGroups = subjectGroups.sort((a, b) => {
                  if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
                  if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
                  if (sortBy === 'collected_desc') return b.collectedTotal - a.collectedTotal;
                  if (sortBy === 'debtors_desc') return b.unpaidCount - a.unpaidCount;
                  if (sortBy === 'students_desc') return b.totalStudents - a.totalStudents;
                  return 0;
                });

                if (subjectGroups.length === 0 && searchQuery) {
                  return null;
                }

                return (
                  <div key={subjectName} className="space-y-4">
                    {/* Subtle Separator Line between sections */}
                    {index > 0 && (
                      <div className="relative pb-6 flex items-center justify-center">
                        <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50" />
                        <div className="absolute px-3 bg-[#f8fafc] dark:bg-[#020617] text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span>{subjectName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        </div>
                      </div>
                    )}

                    {/* Section Title */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-xl border ${meta.badgeClass}`}>
                          <SubjectIcon size={15} />
                        </span>
                        <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
                          {subjectName}
                        </h2>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                          {subjectGroups.length} ta guruh
                        </span>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {subjectGroups.map((g) => {
                        const percent = g.expectedTotal > 0 ? Math.round((g.collectedTotal / g.expectedTotal) * 100) : 0;
                        const isFullyPaid = g.unpaidCount === 0 && g.totalStudents > 0;

                        return (
                          <div
                            key={g.id}
                            onClick={() => handleOpenGroup(g.id)}
                            className="group relative p-5 rounded-3xl cursor-pointer transition-colors duration-150 flex flex-col justify-between gap-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-xl active:scale-[0.99]"
                          >
                            {/* Top Badges */}
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${meta.badgeClass}`}>
                                <SubjectIcon size={12} />
                                <span className="truncate max-w-[120px]">{subjectName}</span>
                              </span>

                              <span className="text-[11px] font-bold text-slate-400 transition-colors flex items-center gap-1">
                                <span>Kirish</span>
                                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>

                            {/* Group Name & Price */}
                            <div className="space-y-1.5">
                              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors line-clamp-1 font-sans-pro">
                                {g.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Guruh to'lovi: <b className="text-slate-700 dark:text-slate-300">{formatMoney(g.groupPrice)}</b>
                              </p>
                            </div>

                            {/* Collection Progress */}
                            <div className="space-y-2 pt-2 border-t border-slate-100/80 dark:border-slate-800/60">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-500 dark:text-slate-400">Yig'ildi: {percent}%</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(g.collectedTotal)}</span>
                              </div>

                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isFullyPaid ? 'bg-emerald-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {g.paidCount} to'langan
                                </span>
                                {g.unpaidCount > 0 ? (
                                  <span className="text-rose-500 font-bold">
                                    {g.unpaidCount} qarzdor
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    {g.totalStudents} o'quvchi
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )
      ) : (
        /* ── MODE 2: FLAT ALL PAYMENTS TABLE ── */
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
              ))}
            </div>
          ) : filteredFlatPayments.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Receipt size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Mos keluvchi to'lovlar topilmadi</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">O'quvchi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Guruh & Fan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">To'lov holati</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Guruh summasi</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredFlatPayments.map((item) => {
                    const isPaid = item.payment?.status === 'completed';
                    const isPartial = item.payment?.status === 'partial';

                    return (
                      <tr key={`${item.studentId}-${item.groupId}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                              {item.studentName ? item.studentName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{item.studentName || 'Ismsiz'}</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{item.studentPhone || 'Raqam yo\'q'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">{item.groupName}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{item.subjectTitle}</p>
                        </td>
                        <td className="px-6 py-4">
                          {isPaid ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              <CheckCircle2 size={13} />
                              <span>To'langan</span>
                            </div>
                          ) : isPartial ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                              <AlertCircle size={13} />
                              <span>Qisman to'langan</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                              <XCircle size={13} />
                              <span>Qarzdor</span>
                            </div>
                          )}
                          {item.payment && (
                            <div className="text-xs font-medium mt-1 space-y-0.5">
                              <div className="text-slate-500 dark:text-slate-400">
                                {formatMoney(item.payment.amount)} to'landi • {item.payment.payment_method === 'cash' ? 'Naqd' : item.payment.payment_method === 'card' ? 'Karta' : "O'tkazma"}
                              </div>
                              {isPartial && (
                                <div className="text-rose-600 dark:text-rose-400 font-bold">
                                  Qolgan qarz: {formatMoney(Math.max(0, item.groupPrice - item.payment.amount))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                            {formatMoney(item.groupPrice)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openPaymentModal(item)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isPaid
                                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              }`}
                            >
                              {isPartial ? "Qolganini to'lash" : isPaid ? "Tahrirlash" : "To'lov qabul qilish"}
                            </button>
                            {item.payment && (
                              <button
                                onClick={() => handleClearPayment(item)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                title="To'lovni bekor qilish"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.isOpen && paymentModal.data && (() => {
        const prevPaid = paymentModal.data.payment?.amount || 0;
        const groupPrice = paymentModal.data.groupPrice || 0;
        const remainingDebt = Math.max(0, groupPrice - prevPaid);
        const hasExistingPayment = !!paymentModal.data.payment;

        // Dynamic real-time calculation
        const inputVal = Number(paymentForm.amount) || 0;
        const calculatedNewTotal = (paymentMode === 'add_remaining' && hasExistingPayment)
          ? prevPaid + inputVal
          : inputVal;
        const calculatedRemaining = Math.max(0, groupPrice - calculatedNewTotal);
        const willBeFullyPaid = calculatedNewTotal >= groupPrice;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-5">
              
              {/* Top Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                    {hasExistingPayment && remainingDebt > 0
                      ? "Qolgan to'lovni qabul qilish"
                      : hasExistingPayment
                      ? "To'lovni tahrirlash"
                      : "To'lov qabul qilish"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {paymentModal.data.studentName} • {paymentModal.data.groupName} ({currentMonth})
                  </p>
                </div>
                <button
                  onClick={closePaymentModal}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 3-Card Summary Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Guruh to'lovi</p>
                  <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatMoney(groupPrice)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Avval to'langan</p>
                  <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatMoney(prevPaid)}
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border ${
                  remainingDebt > 0 
                    ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20 text-rose-600 dark:text-rose-400' 
                    : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <p className="text-[10px] font-extrabold uppercase">{remainingDebt > 0 ? "Qolgan qarz" : "Qarzdorlik"}</p>
                  <p className="text-xs sm:text-sm font-black mt-0.5">
                    {remainingDebt > 0 ? formatMoney(remainingDebt) : "0 so'm"}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs if existing payment exists */}
              {hasExistingPayment && (
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1 border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('add_remaining');
                      setPaymentForm(prev => ({ ...prev, amount: remainingDebt }));
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      paymentMode === 'add_remaining'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    + Qolgan qarzni qabul qilish
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('set_total');
                      setPaymentForm(prev => ({ ...prev, amount: prevPaid }));
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      paymentMode === 'set_total'
                        ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Jami to'lovni tahrirlash
                  </button>
                </div>
              )}

              {/* Amount Input & Preset Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {paymentMode === 'add_remaining' && hasExistingPayment
                      ? "Qo'shimcha to'lanayotgan summa"
                      : "To'lanayotgan summa"}
                  </label>
                  {remainingDebt > 0 && paymentMode === 'add_remaining' && (
                    <span className="text-[11px] font-bold text-rose-500">
                      Qarz: {formatMoney(remainingDebt)}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="Summani kiriting..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                    value={paymentForm.amount || ''}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-extrabold">
                    SO'M
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {remainingDebt > 0 && paymentMode === 'add_remaining' && (
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, amount: remainingDebt })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20 transition-colors"
                    >
                      Qolgan qarzni to'lash ({formatMoney(remainingDebt)})
                    </button>
                  )}
                  {paymentMode === 'set_total' && (
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, amount: groupPrice })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20 transition-colors"
                    >
                      To'liq to'lov ({formatMoney(groupPrice)})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: 100000 })}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-colors"
                  >
                    100,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: 200000 })}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-colors"
                  >
                    200,000
                  </button>
                </div>
              </div>

              {/* Dynamic Live Calculation Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Yangi jami to'langan summa:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatMoney(calculatedNewTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Natijaviy holat:</span>
                  {willBeFullyPaid ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      100% To'liq to'langan
                    </span>
                  ) : (
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle size={13} />
                      Qisman to'langan (Qarz: {formatMoney(calculatedRemaining)})
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  To'lov usuli
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Naqd pul', icon: Banknote },
                    { id: 'card', label: 'Karta (Click/Payme)', icon: CreditCard },
                    { id: 'transfer', label: "O'tkazma", icon: Wallet }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, method: method.id as 'cash'|'card'|'transfer' })}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                        paymentForm.method === method.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <method.icon size={18} className={paymentForm.method === method.id ? 'text-emerald-500' : 'text-slate-400'} />
                      <span className="text-xs font-bold text-center leading-tight">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSavePayment}
                  disabled={isSubmitting || paymentForm.amount <= 0}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? "Saqlanmoqda..." : "Saqlash va Chek Yuborish"}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="h-10 w-64 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl animate-pulse" />
        <PaymentsGridSkeleton />
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
