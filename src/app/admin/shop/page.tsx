"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  ShoppingBag,
  Coins,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Gift,
  Search,
  Loader2,
  X,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  getShopItems,
  adminGetShopOrders,
  adminUpdateOrderStatus,
  adminCreditCoinsDirectly,
  adminUpdateShopItem,
  adminDeleteShopItem,
  type ShopItem,
  type ShopOrder
} from "@/lib/supabase-queries";

export default function AdminShopPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'items'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // New/Edit Item Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState(300);
  const [itemStock, setItemStock] = useState(10);
  const [itemCategory, setItemCategory] = useState<'merch' | 'exam' | 'discount' | 'gadget'>('merch');
  const [itemImage, setItemImage] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Fetch shop items & admin orders
  const { data: items = [], isLoading: itemsLoading } = useSWR('adminShopItems', getShopItems);
  const { data: orders = [], isLoading: ordersLoading } = useSWR('adminShopOrders', adminGetShopOrders);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      (order.student?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: 'delivered' | 'cancelled', studentId?: string, coinsSpent?: number) => {
    setIsUpdating(orderId);
    try {
      const res = await adminUpdateOrderStatus(orderId, newStatus, studentId, coinsSpent);
      if (res.success) {
        if (res.coinsAdded && res.coinsAdded > 0) {
          toast.success(`To'lov tasdiqlandi va talabaga ${res.coinsAdded} coin muvaffaqiyatli qo'shildi! 💎`);
        } else if (newStatus === 'delivered') {
          toast.success("Buyurtma 'Topshirildi' holatiga o'tkazildi!");
        } else {
          toast.success("Buyurtma bekor qilindi!");
        }
        mutate('adminShopOrders');
      } else {
        toast.error("Holatni yangilashda xatolik");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDirectCredit = async (studentId: string, amount: number, orderId?: string) => {
    if (!studentId || !amount) return;
    setIsUpdating(orderId || studentId);
    try {
      const res = await adminCreditCoinsDirectly(studentId, amount, orderId);
      if (res.success) {
        toast.success(`Talabaga ${amount} coin qo'shildi! Yangi balans: ${res.newBalance} coin 💎`);
        mutate('adminShopOrders');
      } else {
        toast.error(res.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Coin credit error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsUpdating(null);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setItemTitle("");
    setItemDesc("");
    setItemPrice(300);
    setItemStock(10);
    setItemCategory("merch");
    setItemImage("");
    setShowAddModal(true);
  };

  const openEditModal = (item: ShopItem) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemDesc(item.description || "");
    setItemPrice(item.price_coins);
    setItemStock(item.stock);
    setItemCategory(item.category as any);
    setItemImage(item.image_url || "");
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
        toast.success("Rasm yuklandi!");
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
        // Update existing item
        const res = await adminUpdateShopItem(editingItem.id, {
          title: itemTitle,
          description: itemDesc,
          price_coins: itemPrice,
          stock: itemStock,
          category: itemCategory,
          image_url: itemImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"
        });

        if (res.success) {
          toast.success("Sovg'a muvaffaqiyatli tahrirlandi!");
          mutate('adminShopItems');
          mutate('shopItems');
          setShowAddModal(false);
        } else {
          toast.error(res.error || "Tahrirlashda xatolik yuz berdi");
        }
      } else {
        // Create new item
        const supabase = createClient();
        const { error } = await supabase.from('shop_items').insert({
          title: itemTitle,
          description: itemDesc,
          price_coins: itemPrice,
          stock: itemStock,
          category: itemCategory,
          image_url: itemImage || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
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
      console.error("Save item error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!confirm(`"${title}" sovg'asini o'chirishni tasdiqlaysizmi?`)) return;

    setDeletingItemId(itemId);
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
      console.error("Delete item error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Do'kon va Buyurtmalar
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Talabalarning sovg'a xaridlari hamda Promax Coin Shop inventarini boshqarish ({orders.length} ta buyurtma)
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Yangi Sovg'a Qo'shish</span>
        </button>
      </div>

      {/* Platform Standard Summary Stats Cards (Zero shadow, clean glassmorphic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(() => {
          const pendingCount = orders.filter(o => o.status === 'pending').length;
          const deliveredCount = orders.filter(o => o.status === 'delivered').length;

          return [
            { label: "Jami Buyurtmalar", value: `${orders.length} ta`, icon: PackageCheck, color: "text-blue-500" },
            { label: "Kutilayotganlar", value: `${pendingCount} ta`, icon: Clock, color: "text-amber-500" },
            { label: "Topshirilganlar", value: `${deliveredCount} ta`, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Do'kon Inventari", value: `${items.length} xil`, icon: Gift, color: "text-purple-500" }
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex items-center justify-between min-w-0"
            >
              <div className="min-w-0 flex-1 pr-2 text-left">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{s.value}</p>
              </div>
              
              {/* Box-free Icon */}
              <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
            </div>
          ));
        })()}
      </div>

      {/* Navigation Tabs (Harmonized) */}
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <PackageCheck size={16} />
          <span>Talabalar Buyurtmalari</span>
          {orders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
              {orders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'items'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Gift size={16} />
          <span>Do'kon Inventari ({items.length})</span>
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Talaba ismi yoki tafsilot bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Barchasi', count: orders.length },
                { id: 'pending', label: 'Kutilmoqda', count: orders.filter(o => o.status === 'pending').length },
                { id: 'delivered', label: 'Topshirildi', count: orders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: 'Bekor qilingan', count: orders.filter(o => o.status === 'cancelled').length },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    statusFilter === f.id
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Separate Order Cards List */}
          {ordersLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/40 dark:border-slate-800/40" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200/80 dark:border-slate-800/80">
              <PackageCheck size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Buyurtmalar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isCoinOrder = !order.item_id && (order.notes?.includes('Coin xaridi') || order.notes?.includes('coin'));
                const coinMatch = order.notes?.match(/(\d+)\s*coin/i);
                const coinAmount = coinMatch ? parseInt(coinMatch[1], 10) : 0;

                let displayTitle = order.item?.title || order.notes || "Noma'lum Buyurtma";
                let packagePrice = "";
                if (isCoinOrder && order.notes) {
                  const cleanMatch = order.notes.match(/Coin xaridi:\s*([^(]+)\(([^)]+)\)/i);
                  if (cleanMatch) {
                    displayTitle = cleanMatch[1].trim();
                    packagePrice = cleanMatch[2].trim();
                  }
                }

                const studentName = order.student?.full_name || "Noma'lum Talaba";
                const studentInitial = studentName.charAt(0).toUpperCase();

                const statusBadge = {
                  delivered: {
                    label: "Topshirildi",
                    className: "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50",
                    icon: CheckCircle2
                  },
                  pending: {
                    label: "Kutilmoqda",
                    className: "bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50",
                    icon: Clock
                  },
                  cancelled: {
                    label: "Bekor qilingan",
                    className: "bg-red-50/80 dark:bg-red-950/40 text-red-500 border border-red-200/50 dark:border-red-900/50",
                    icon: XCircle
                  }
                }[order.status] || {
                  label: order.status,
                  className: "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/50",
                  icon: Clock
                };

                return (
                  <div
                    key={order.id}
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 text-left"
                  >
                    {/* Left: Avatar + Details */}
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 shrink-0 text-sm">
                        {isCoinOrder ? (
                          <Coins size={22} className="text-amber-500" />
                        ) : (
                          <Gift size={22} className="text-blue-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center flex-wrap gap-2.5">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                            {studentName}
                          </h3>
                          {isCoinOrder ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50 text-[11px] font-extrabold">
                              <Coins size={12} className="text-amber-500" />
                              <span>+{coinAmount.toLocaleString()} Coin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50 text-[11px] font-extrabold">
                              <Gift size={12} className="text-blue-500" />
                              <span>Sovg'a Xaridi</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="text-slate-700 dark:text-slate-200 font-semibold">
                            {displayTitle}
                          </span>
                          {packagePrice && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {packagePrice}
                              </span>
                            </>
                          )}
                          {!isCoinOrder && order.coins_spent > 0 && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                <Coins size={12} />
                                {order.coins_spent} Tanga
                              </span>
                            </>
                          )}
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(order.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${statusBadge.className}`}>
                        <statusBadge.icon size={13} />
                        <span>{statusBadge.label}</span>
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'delivered', order.student_id, order.coins_spent)}
                            disabled={isUpdating === order.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {isUpdating === order.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            <span>{isCoinOrder ? `Tasdiqlash (+${coinAmount})` : "Topshirildi"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'cancelled', order.student_id, order.coins_spent)}
                            disabled={isUpdating === order.id}
                            className="px-3 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            <span>Bekor qilish</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ITEMS TAB WITH EDIT & DELETE CONTROLS AT THE BOTTOM OF THE CARD */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex flex-col justify-between shadow-sm group text-left transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-500">
                      <Gift size={40} />
                    </div>
                  )}

                  {/* Price Pill Top Right */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-black flex items-center gap-1 shadow-sm">
                    <Coins size={13} />
                    {item.price_coins} Tanga
                  </div>

                  {/* Category Pill Top Left */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-sans-pro">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* BOTTOM ACTIONS FOOTER */}
              <div className="p-4 pt-3 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs text-slate-500 font-medium">
                  Omborda: <strong className="text-slate-800 dark:text-slate-100 font-bold">{item.stock} ta</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    disabled={deletingItemId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {deletingItemId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT ITEM MODAL WITH LOCAL FILE UPLOAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-xl relative space-y-4 text-left">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-sans-pro">
              {editingItem ? "Sovg'ani Tahrirlash" : "Yangi Sovg'a Qo'shish"}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Sovg'a nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Promax Futbolka"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Qisqacha ta'rifi</label>
                <textarea
                  rows={2}
                  placeholder="Sovg'a haqida ma'lumot..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Narxi (Tangalarda)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-bold text-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Ombordagi soni</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={itemStock}
                    onChange={(e) => setItemStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Kategoriya</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none font-semibold"
                >
                  <option value="merch">Promax Merch</option>
                  <option value="exam">Mock Exam Chipta</option>
                  <option value="discount">Chegirmalar</option>
                  <option value="gadget">Gadjetlar</option>
                </select>
              </div>

              {/* LOCAL FILE UPLOAD INPUT */}
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Mahsulot Rasmi (Kompyuterdan yuklash)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <Upload size={15} className="text-amber-500" />
                    <span>{itemImage ? "Rasmni almashtirish" : "Kompyuterdan rasm tanlash"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {itemImage && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <Image src={itemImage} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingItem ? <Loader2 size={15} className="animate-spin" /> : <span>{editingItem ? "Yangilash" : "Saqlash & Qo'shish"}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
