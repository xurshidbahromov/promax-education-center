"use client";

import { useState, useMemo } from "react";
import {
  Banknote, Calendar, Filter, Search, User, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Plus, Wallet, X
} from "lucide-react";
import { useSubjects, useGroups } from "@/hooks/useAdminData";
import { useExpectedPayments, processPayment, deletePayment, ExpectedPayment } from "@/hooks/usePayments";
import toast from "react-hot-toast";

export default function AdminPaymentsPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}`;
  });

  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subjects = [] } = useSubjects();
  const { data: allGroups = [] } = useGroups(filterSubject === "all" ? "" : filterSubject);
  const { data: payments = [], isLoading, mutate } = useExpectedPayments(
    currentMonth,
    filterSubject,
    filterGroup,
    filterStatus
  );

  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; data: ExpectedPayment | null }>({
    isOpen: false,
    data: null
  });
  
  const [paymentForm, setPaymentForm] = useState<{ amount: number; method: 'cash'|'card'|'transfer' }>({
    amount: 0,
    method: 'cash'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed totals for summary cards
  const summary = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let pendingCount = 0;
    let paidCount = 0;

    payments.forEach(p => {
      expected += p.groupPrice;
      if (p.payment) {
        collected += p.payment.amount;
        if (p.payment.status === 'completed') paidCount++;
        else pendingCount++; // partial
      } else {
        pendingCount++;
      }
    });

    return { expected, collected, pendingCount, paidCount };
  }, [payments]);

  // Client-side search filter
  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.studentName && p.studentName.toLowerCase().includes(q)) ||
      (p.studentPhone && p.studentPhone.toLowerCase().includes(q)) ||
      (p.groupName.toLowerCase().includes(q))
    );
  });

  const openPaymentModal = (item: ExpectedPayment) => {
    setPaymentForm({
      amount: item.payment ? item.payment.amount : item.groupPrice,
      method: item.payment ? item.payment.payment_method : 'cash'
    });
    setPaymentModal({ isOpen: true, data: item });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, data: null });
  };

  const handleSavePayment = async () => {
    if (!paymentModal.data) return;
    setIsSubmitting(true);
    
    const { amount, method } = paymentForm;
    const { studentId, groupId, groupPrice } = paymentModal.data;
    const status = amount >= groupPrice ? 'completed' : 'partial';

    const res = await processPayment(studentId, groupId, amount, currentMonth, method, status);
    
    if (res.success) {
      toast.success("To'lov saqlandi");
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

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('uz-UZ') + " so'm";
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Moliya va To'lovlar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            O'quvchilarning oylik to'lovlarini kuzating va boshqaring ({payments.length} ta yozuv)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Kutilayotgan summa", value: formatMoney(summary.expected), icon: Wallet, color: "text-blue-500" },
          { label: "Yig'ilgan summa", value: formatMoney(summary.collected), icon: Banknote, color: "text-emerald-500" },
          { label: "To'lov qilganlar", value: `${summary.paidCount} ta o'quvchi`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Qarzdorlar", value: `${summary.pendingCount} ta o'quvchi`, icon: AlertCircle, color: "text-red-500" }
        ].map((s, i) => (
          <div key={i} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex items-center justify-between min-w-0">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{s.value}</p>
            </div>
            
            {/* Box-free Icon */}
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* Filters Area (Harmonized with all other admin pages) */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex flex-col xl:flex-row items-center gap-3">
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki tel raqami bo'yicha qidirish..."
            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap w-full xl:w-auto items-center gap-2">
          {/* Month Filter */}
          <div className="relative min-w-[140px]">
            <input
              type="month"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">Barcha fanlar</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="all">Barcha guruhlar</option>
            {allGroups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Barcha holatlar</option>
            <option value="paid">To'laganlar</option>
            <option value="unpaid">To'lamaganlar</option>
            <option value="partial">Qisman to'laganlar</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Filter size={32} className="mx-auto mb-2 opacity-40" />
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
                {filteredPayments.map((item) => {
                  const isPaid = item.payment?.status === 'completed';
                  const isPartial = item.payment?.status === 'partial';
                  
                  return (
                    <tr key={`${item.studentId}-${item.groupId}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
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
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 size={13} />
                            <span>To'lagan</span>
                          </div>
                        ) : isPartial ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            <AlertCircle size={13} />
                            <span>Qisman to'lagan</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 text-xs font-bold">
                            <XCircle size={13} />
                            <span>To'lamagan</span>
                          </div>
                        )}
                        {item.payment && (
                          <div className="text-xs text-slate-400 font-medium mt-1">
                            {formatMoney(item.payment.amount)} to'landi • {item.payment.payment_method}
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
                            className="px-3.5 py-1.5 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all"
                          >
                            {item.payment ? "Tahrirlash" : "To'lov qabul qilish"}
                          </button>
                          {item.payment && (
                            <button
                              onClick={() => handleClearPayment(item)}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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
              <p className="text-xs font-bold text-brand-blue uppercase tracking-wider">{paymentModal.data.studentName}</p>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                {paymentModal.data.groupName} • {currentMonth} oyi uchun
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Kutilayotgan summa:</span>
                <span className="text-brand-blue font-bold">{formatMoney(paymentModal.data.groupPrice)}</span>
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
                      onClick={() => setPaymentForm({ ...paymentForm, method: method.id as 'cash'|'card'|'transfer' })}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                        paymentForm.method === method.id
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <method.icon size={18} className={paymentForm.method === method.id ? 'text-brand-blue' : 'text-slate-400'} />
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
                className="px-4 py-2.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? "Saqlanmoqda..." : "Tasdiqlash va Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
