content = """"use client";

import { useState, useMemo } from "react";
import {
  Banknote, Calendar, Filter, Search, User, CreditCard,
  MoreVertical, CheckCircle2, XCircle, AlertCircle, ChevronDown, Plus, Wallet
} from "lucide-react";
import { useSubjects, useGroups } from "@/hooks/useAdminData";
import { useExpectedPayments, processPayment, deletePayment, ExpectedPayment } from "@/hooks/usePayments";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

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

  // Computed totals for the summary cards
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 font-sans-pro tracking-tight">
            Moliya va To'lovlar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            O'quvchilarning oylik to'lovlarini kuzating va boshqaring.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Kutilayotgan summa", value: formatMoney(summary.expected), icon: Wallet, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Yig'ilgan summa", value: formatMoney(summary.collected), icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "To'lov qilganlar", value: `${summary.paidCount} ta o'quvchi`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Qarzdorlar", value: `${summary.pendingCount} ta o'quvchi`, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }
        ].map((s, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg}`}>
              <s.icon size={28} className={s.color} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 p-5 rounded-[2rem] shadow-sm flex flex-col xl:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <div className="w-12 h-12 absolute left-1 top-1 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="O'quvchi ISH yoki tel raqami bilan qidirish..."
            className="w-full h-14 pl-16 pr-4 bg-transparent border border-gray-200/50 dark:border-slate-700/50 rounded-full focus:ring-2 focus:ring-brand-blue/20 outline-none text-slate-700 dark:text-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full xl:w-auto overflow-x-auto no-scrollbar gap-3 pb-2 xl:pb-0">
          {/* Month Filter */}
          <div className="min-w-[160px] relative">
            <input
              type="month"
              className="w-full appearance-none h-14 pl-12 pr-4 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-full outline-none focus:ring-2 focus:ring-brand-blue/20 text-slate-700 dark:text-slate-200 font-medium"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
            />
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <select
            className="min-w-[150px] appearance-none h-14 px-5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-full outline-none focus:ring-2 focus:ring-brand-blue/20 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="all">Barcha fanlar</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <select
            className="min-w-[150px] appearance-none h-14 px-5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-full outline-none focus:ring-2 focus:ring-brand-blue/20 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="all">Barcha guruhlar</option>
            {allGroups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <select
            className="min-w-[150px] appearance-none h-14 px-5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-full outline-none focus:ring-2 focus:ring-brand-blue/20 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 flex flex-col gap-4 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Filter size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ma'lumot topilmadi</h3>
            <p className="text-slate-500 dark:text-slate-400">Bu filtrlarga mos keluvchi to'lovlar yo'q.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead>
                <tr className="border-b border-gray-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">O'quvchi</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Guruh & Fan</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">To'lov holati</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Guruh summasi</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredPayments.map((item, idx) => {
                  const isPaid = item.payment?.status === 'completed';
                  const isPartial = item.payment?.status === 'partial';
                  const isUnpaid = !item.payment;
                  
                  return (
                    <tr key={`${item.studentId}-${item.groupId}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{item.studentName || 'Ismsiz'}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{item.studentPhone || 'Raqam yo\'q'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{item.groupName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{item.subjectTitle}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800/30">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">To'lagan</span>
                          </div>
                        ) : isPartial ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-800/30">
                            <AlertCircle size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Qisman to'lagan</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/30">
                            <XCircle size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">To'lamagan</span>
                          </div>
                        )}
                        {item.payment && (
                          <div className="text-[11px] text-slate-400 font-medium mt-1.5">
                            {formatMoney(item.payment.amount)} to'landi • {item.payment.payment_method}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          {formatMoney(item.groupPrice)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPaymentModal(item)}
                            className="px-4 py-2 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-sm font-bold transition-all active:scale-95"
                          >
                            {item.payment ? "Tahrirlash" : "To'lov qabul qilish"}
                          </button>
                          {item.payment && (
                            <button
                              onClick={() => handleClearPayment(item)}
                              className="w-9 h-9 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closePaymentModal} />
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 font-sans-pro tracking-tight">
                  To'lov qabul qilish
                </h3>
                <button onClick={closePaymentModal} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 mb-6">
                <p className="text-sm font-bold text-brand-blue mb-1 uppercase tracking-wider">{paymentModal.data.studentName}</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                  {paymentModal.data.groupName} • {currentMonth} oyi uchun
                </p>
                <div className="mt-3 pt-3 border-t border-brand-blue/10 flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Kutilayotgan summa:</span>
                  <span className="text-brand-blue font-black">{formatMoney(paymentModal.data.groupPrice)}</span>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">To'langan summa</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className="w-full h-14 pl-5 pr-14 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand-blue/30 focus:border-transparent outline-none transition-all text-xl font-bold text-slate-800 dark:text-slate-100 font-fredoka"
                      value={paymentForm.amount || ''}
                      onChange={e => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      UZS
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">To'lov usuli</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cash', label: 'Naqd pul', icon: Banknote },
                      { id: 'card', label: 'Karta', icon: CreditCard },
                      { id: 'transfer', label: 'Otkazma', icon: Wallet }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentForm({ ...paymentForm, method: method.id as 'cash'|'card'|'transfer' })}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          paymentForm.method === method.id
                            ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-gray-200'
                        }`}
                      >
                        <method.icon size={20} className={paymentForm.method === method.id ? 'text-brand-blue' : 'text-slate-400'} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleSavePayment}
                  disabled={isSubmitting || paymentForm.amount <= 0}
                  className="w-full h-14 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Tasdiqlash va Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
""""

with open("src/app/admin/payments/page.tsx", "w") as f:
    f.write(content)
print("Payments page created successfully")
