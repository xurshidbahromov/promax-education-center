'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import {
  PackageCheck,
  Coins,
  CheckCircle2,
  Clock,
  Gift,
  Search,
  X,
  Pencil,
  Trash2,
  Upload,
  Plus,
  Smartphone,
  Sparkles,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import {
  getShopItems,
  adminGetShopOrders,
  adminUpdateOrderStatus,
  adminCreditCoinsDirectly,
  adminUpdateShopItem,
  adminDeleteShopItem,
  type ShopItem,
  type ShopOrder
} from '@/lib/supabase-queries';
import { getStudents, type Student } from '@/lib/admin-queries';
import { formatUzPhone } from '@/lib/phone-formatter';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  merch: { label: 'Merch & Kiyim', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  exam: { label: 'Imtihon & Sertifikat', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  discount: { label: 'Chegirma Vaucheri', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  gadget: { label: 'Kitob & Gadjet', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
};

// ── SKELETON LOADER (LIST ROWS) ──
function ShopSkeleton() {
  return (
    <div className="space-y-3 animate-pulse pt-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-4 sm:p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4 backdrop-blur-xl h-20"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-1/3 rounded bg-slate-200/80 dark:bg-slate-800/80" />
              <div className="h-3 w-1/4 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      ))}
    </div>
  );
}

export default function AdminShopPage() {
  const [activeTab, setActiveTab] = useState<'gifts' | 'coins' | 'inventory'>('gifts');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Direct Coin Bonus Modal state
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [bonusAmount, setBonusAmount] = useState(100);
  const [bonusReason, setBonusReason] = useState('');
  const [isSendingBonus, setIsSendingBonus] = useState(false);

  // New / Edit Shop Item Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState(300);
  const [itemStock, setItemStock] = useState(10);
  const [itemCategory, setItemCategory] = useState<'merch' | 'exam' | 'discount' | 'gadget'>('merch');
  const [itemImage, setItemImage] = useState('');
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Fetch shop items & orders
  const { data: items = [], isLoading: itemsLoading } = useSWR('adminShopItems', getShopItems);
  const { data: orders = [], isLoading: ordersLoading } = useSWR('adminShopOrders', adminGetShopOrders);

  // Load students for coin bonus selector
  useEffect(() => {
    getStudents().then(setAllStudents).catch(console.error);
  }, []);

  // Split Orders into Gifts Orders vs Coin Bonus History
  const giftOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.item_id !== null ||
        (o.coins_spent > 0 && !o.notes?.toLowerCase().includes('bonus') && !o.notes?.toLowerCase().includes('coin xaridi'))
    );
  }, [orders]);

  const coinBonusHistory = useMemo(() => {
    return orders.filter(
      (o) =>
        o.item_id === null &&
        (o.notes?.toLowerCase().includes('bonus') || o.notes?.toLowerCase().includes('coin') || o.coins_spent === 0)
    );
  }, [orders]);

  // Global KPI Summary
  const stats = useMemo(() => {
    const totalOrders = giftOrders.length;
    const pendingOrders = giftOrders.filter((o) => o.status === 'pending').length;
    const deliveredOrders = giftOrders.filter((o) => o.status === 'delivered').length;
    const totalItems = items.length;
    const totalBonusGiven = coinBonusHistory.length;

    return { totalOrders, pendingOrders, deliveredOrders, totalItems, totalBonusGiven };
  }, [giftOrders, items, coinBonusHistory]);

  // Filtered Gift Orders
  const filteredGiftOrders = useMemo(() => {
    return giftOrders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        (order.student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.item?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [giftOrders, statusFilter, searchTerm]);

  // Filtered Coin Bonus History
  const filteredCoinHistory = useMemo(() => {
    return coinBonusHistory.filter((order) => {
      const matchesSearch =
        !searchTerm ||
        (order.student?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [coinBonusHistory, searchTerm]);

  // Filtered Inventory Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [items, categoryFilter, searchTerm]);

  // ── ORDER STATUS HANDLERS ──
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'delivered' | 'cancelled',
    studentId?: string,
    coinsSpent?: number
  ) => {
    setIsUpdating(orderId);
    try {
      const res = await adminUpdateOrderStatus(orderId, newStatus, studentId, coinsSpent);
      if (res.success) {
        if (newStatus === 'delivered') {
          toast.success("Sovg'a o'quvchiga topshirildi deb belgilandi! ✅");
        } else {
          toast.success("Buyurtma bekor qilindi va tangalar o'quvchiga qaytarildi! 🔄");
        }
        mutate('adminShopOrders');
      } else {
        toast.error('Holatni yangilashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsUpdating(null);
    }
  };

  // ── DIRECT COIN BONUS HANDLER ──
  const handleSendCoinBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("O'quvchini tanlang!");
      return;
    }
    if (!bonusAmount || bonusAmount <= 0) {
      toast.error('Tanga miqdorini kiriting!');
      return;
    }

    setIsSendingBonus(true);
    try {
      const res = await adminCreditCoinsDirectly(
        selectedStudentId,
        bonusAmount,
        undefined,
        bonusReason || 'Faollik uchun'
      );
      if (res.success) {
        toast.success(`O'quvchiga +${bonusAmount} Promax Coin muvaffaqiyatli berildi! 💎`);
        mutate('adminShopOrders');
        setShowBonusModal(false);
        setSelectedStudentId('');
        setBonusAmount(100);
        setBonusReason('');
      } else {
        toast.error(res.error || 'Tanga berishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Xatolik: ' + err.message);
    } finally {
      setIsSendingBonus(false);
    }
  };

  // ── ITEM CRUD HANDLERS ──
  const openAddModal = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemDesc('');
    setItemPrice(300);
    setItemStock(10);
    setItemCategory('merch');
    setItemImage('');
    setShowAddModal(true);
  };

  const openEditModal = (item: ShopItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemDesc(item.description || '');
    setItemPrice(item.price_coins);
    setItemStock(item.stock);
    setItemCategory(item.category as any);
    setItemImage(item.image_url || '');
    setShowAddModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan kichik bo'lishi kerak!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setItemImage(result);
        toast.success('Rasm yuklandi!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) {
      toast.error("Sovg'a nomini kiriting!");
      return;
    }

    setIsSavingItem(true);

    try {
      if (editingItem) {
        const res = await adminUpdateShopItem(editingItem.id, {
          title: itemTitle,
          description: itemDesc,
          price_coins: itemPrice,
          stock: itemStock,
          category: itemCategory,
          image_url:
            itemImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80'
        });

        if (res.success) {
          toast.success("Sovg'a muvaffaqiyatli tahrirlandi!");
          mutate('adminShopItems');
          mutate('shopItems');
          setShowAddModal(false);
        } else {
          toast.error(res.error || 'Tahrirlashda xatolik yuz berdi');
        }
      } else {
        const supabase = createClient();
        const { error } = await supabase.from('shop_items').insert({
          title: itemTitle,
          description: itemDesc,
          price_coins: itemPrice,
          stock: itemStock,
          category: itemCategory,
          image_url:
            itemImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
          is_active: true
        });

        if (error) {
          toast.error("Ma'lumotlar bazasida xatolik yuz berdi");
        } else {
          toast.success("Yangi sovg'a qo'shildi!");
          mutate('adminShopItems');
          mutate('shopItems');
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!confirm(`"${title}" sovg'asini do'kondan o'chirishni tasdiqlaysizmi?`)) return;

    try {
      const res = await adminDeleteShopItem(itemId);
      if (res.success) {
        toast.success("Sovg'a o'chirildi!");
        mutate('adminShopItems');
        mutate('shopItems');
      } else {
        toast.error("O'chirishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    }
  };

  const loading = itemsLoading || ordersLoading;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* ── TOP HEADER (CLEAN TYPOGRAPHY, NO ICON) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Promax Coin Do'koni va Tanga Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Talabalarning sovg'a xaridlari, tanga mukofotlari va do'kon inventari ({items.length} xil mahsulot)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Direct Coin Bonus Button */}
          <button
            type="button"
            onClick={() => setShowBonusModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Coins size={16} />
            <span>O'quvchiga Tanga Berish</span>
          </button>

          {/* New Item Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Yangi Sovg'a Qo'shish</span>
          </button>
        </div>
      </div>

      {/* ── GLOBAL KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami Buyurtmalar', value: `${stats.totalOrders} ta`, icon: PackageCheck, color: 'text-blue-500' },
          { label: 'Kutilayotgan Sovg\'alar', value: `${stats.pendingOrders} ta`, icon: Clock, color: 'text-amber-500' },
          { label: 'Topshirilgan Sovg\'alar', value: `${stats.deliveredOrders} ta`, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Do\'kondagi Mahsulotlar', value: `${stats.totalItems} xil`, icon: Gift, color: 'text-purple-500' }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">
                {s.label}
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate font-sans-pro">
                {s.value}
              </p>
            </div>
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── TABS (SEGMENTED CONTROL: GIFTS vs COIN HISTORY vs INVENTORY) ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 max-w-fit">
        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gifts'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Gift size={15} className="text-blue-500" />
          <span>Sovg'alar Buyurtmalari</span>
          {stats.pendingOrders > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
              {stats.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('coins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'coins'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Coins size={15} className="text-amber-500" />
          <span>Tanga Berish Tarixi</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {stats.totalBonusGiven}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PackageCheck size={15} className="text-purple-500" />
          <span>Do'kon Inventari</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {stats.totalItems}
          </span>
        </button>
      </div>

      {/* ── UNIFIED TOOLBAR: SEARCH & FILTERS ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'gifts'
                ? "O'quvchi ismi yoki sovg'a nomi bo'yicha qidirish..."
                : activeTab === 'coins'
                ? "O'quvchi ismi yoki bonus sababi bo'yicha qidirish..."
                : "Sovg'a nomi yoki tavsifi bo'yicha qidirish..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter for Gifts Orders */}
        {activeTab === 'gifts' && (
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Barcha Holatlar</option>
              <option value="pending">Kutilmoqda</option>
              <option value="delivered">Topshirildi</option>
              <option value="cancelled">Bekor qilingan</option>
            </select>
          </div>
        )}

        {/* Category Filter for Inventory */}
        {activeTab === 'inventory' && (
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">Barcha Toifalar</option>
              <option value="merch">Merch & Kiyim</option>
              <option value="exam">Imtihon & Sertifikat</option>
              <option value="discount">Chegirma Vaucheri</option>
              <option value="gadget">Kitob & Gadjet</option>
            </select>
          </div>
        )}
      </div>

      {/* ── CONTENT SECTIONS (CLEAN HORIZONTAL ROWS) ── */}
      {loading ? (
        <ShopSkeleton />
      ) : activeTab === 'gifts' ? (
        /* ── VIEW 1: GIFTS ORDERS (HORIZONTAL ROWS) ── */
        filteredGiftOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Gift size={36} className="mx-auto opacity-40" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Hech qanday sovg'a buyurtmasi topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGiftOrders.map((order) => {
              const studentName = order.student?.full_name || "Noma'lum o'quvchi";
              const studentInitial = studentName[0].toUpperCase();
              const formattedPhone = order.student?.phone ? formatUzPhone(order.student.phone) : null;
              const isPending = order.status === 'pending';
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';
              const orderDate = new Date(order.created_at).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  {/* Left: Student + Item info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm font-sans-pro border border-blue-500/20">
                        {studentInitial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate font-sans-pro">
                          {studentName}
                        </h3>
                        {formattedPhone && (
                          <a
                            href={`tel:${order.student?.phone}`}
                            className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1"
                          >
                            <Smartphone size={11} />
                            <span>{formattedPhone}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Divider on desktop */}
                    <div className="hidden sm:block h-8 w-[1px] bg-slate-200/60 dark:bg-slate-800/60" />

                    {/* Gift preview */}
                    <div className="flex items-center gap-3 min-w-0">
                      {order.item?.image_url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
                          <Image src={order.item.image_url} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20">
                          <Gift size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {order.item?.title || order.notes || "Sovg'a"}
                        </p>
                        <p className="text-[11px] text-slate-400">{orderDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Coins + Status + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-black text-amber-500 font-sans-pro flex items-center gap-1">
                      <Coins size={14} />
                      <span>{order.coins_spent} coin</span>
                    </span>

                    {isPending ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Clock size={10} />
                        <span>Kutilmoqda</span>
                      </span>
                    ) : isDelivered ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        <span>Topshirildi</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Bekor qilingan
                      </span>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          disabled={isUpdating === order.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                          <Check size={13} />
                          <span>Topshirildi</span>
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(order.id, 'cancelled', order.student_id, order.coins_spent)
                          }
                          disabled={isUpdating === order.id}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'coins' ? (
        /* ── VIEW 2: COIN BONUS & TRANSACTION HISTORY (HORIZONTAL ROWS) ── */
        filteredCoinHistory.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Coins size={36} className="mx-auto opacity-40 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tanga berish tarixi mavjud emas</p>
              <p className="text-xs text-slate-400 mt-1">O'quvchilarga rag'batlantiruvchi tangalar berishingiz mumkin</p>
            </div>
            <button
              onClick={() => setShowBonusModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>O'quvchiga Tanga Berish</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCoinHistory.map((order) => {
              const studentName = order.student?.full_name || "Noma'lum o'quvchi";
              const studentInitial = studentName[0].toUpperCase();
              const formattedPhone = order.student?.phone ? formatUzPhone(order.student.phone) : null;
              const dateStr = new Date(order.created_at).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  {/* Left: Student + Reason */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm font-sans-pro border border-amber-500/20">
                        {studentInitial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate font-sans-pro">
                          {studentName}
                        </h3>
                        {formattedPhone && <p className="text-xs text-slate-400 font-medium">{formattedPhone}</p>}
                      </div>
                    </div>

                    <div className="hidden sm:block h-8 w-[1px] bg-slate-200/60 dark:bg-slate-800/60" />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {order.notes || "Promax Tanga mukofoti"}
                      </p>
                      <p className="text-[11px] text-slate-400">{dateStr}</p>
                    </div>
                  </div>

                  {/* Right: Coin status badge */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="px-3 py-1 rounded-xl text-xs font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 font-sans-pro flex items-center gap-1">
                      <Sparkles size={12} />
                      <span>Promax Coin</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Muvaffaqiyatli
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── VIEW 3: INVENTORY ITEMS (HORIZONTAL ROWS) ── */
        filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <PackageCheck size={36} className="mx-auto opacity-40" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Sovg'alar topilmadi</p>
              <p className="text-xs text-slate-400 mt-1">Yangi sovg'a qo'shishingiz mumkin</p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={15} />
              <span>Yangi Sovg'a Qo'shish</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const catConf = CATEGORY_CONFIG[item.category] || {
                label: "Sovg'a",
                color: 'bg-slate-500/10 text-slate-600 border-slate-500/20'
              };

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  {/* Left: Photo + Title + Category */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80'
                        }
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate font-sans-pro">
                          {item.title}
                        </h3>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${catConf.color}`}
                        >
                          {catConf.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description || "Qo'shimcha ma'lumot kiritilmagan"}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price + Stock + Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-black text-amber-500 font-sans-pro flex items-center gap-1">
                      <Coins size={14} />
                      <span>{item.price_coins} coin</span>
                    </span>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Qoldiq: <span className="font-black text-slate-800 dark:text-slate-200">{item.stock} ta</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── MODAL 1: DIRECT COIN BONUS MODAL ── */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Coins size={18} className="text-amber-500" />
                <h3 className="font-bold text-base">O'quvchiga Tanga Berish</h3>
              </div>
              <button
                onClick={() => setShowBonusModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendCoinBonus} className="p-6 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  O'quvchini tanlang *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                  required
                >
                  <option value="">-- O'quvchini tanlang --</option>
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.phone || 'Raqamsiz'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Coin Amount & Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tanga miqdori (Promax Coin) *
                </label>
                <div className="flex items-center gap-2">
                  {[50, 100, 200, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBonusAmount(preset)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black font-sans-pro border transition-all ${
                        bonusAmount === preset
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full mt-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-800 dark:text-slate-100 outline-none font-sans-pro"
                  placeholder="Maxsus miqdor..."
                  required
                />
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Bonus sababi / Izoh
                </label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="Masalan: Mock imtihon 1-o'rin uchun"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSendingBonus || !selectedStudentId}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSendingBonus ? 'Yuborilmoqda...' : 'Tangani Yuborish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD / EDIT PRODUCT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Gift size={18} className="text-purple-500" />
                <h3 className="font-bold text-base">
                  {editingItem ? "Sovg'ani Tahrirlash" : "Yangi Sovg'a Qo'shish"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Sovg'a Nomi *
                </label>
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="Masalan: Promax Brendlangan Xudi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Toifasi *
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e: any) => setItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    <option value="merch">Merch & Kiyim</option>
                    <option value="exam">Imtihon & Sertifikat</option>
                    <option value="discount">Chegirma Vaucheri</option>
                    <option value="gadget">Kitob & Gadjet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Narxi (Coin) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none font-sans-pro"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Ombordagi Qoldiq Soni (Stock) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemStock}
                  onChange={(e) => setItemStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Sovg'a Haqida Tavsif
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none resize-none"
                  placeholder="Sovg'a haqida batafsil ma'lumot..."
                />
              </div>

              {/* Image URL or Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Rasm (URL yoki Fayl)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <Upload size={14} />
                      <span>Fayl yuklash</span>
                      <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSavingItem ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
