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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Do'kon va Buyurtmalar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Talabalarning sovg'a xaridlari hamda Promax Coin Shop inventarini boshqarish
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Yangi Sovg'a Qo'shish</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <PackageCheck size={15} />
          <span>Talabalar Buyurtmalari</span>
          {orders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
              {orders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'items'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
          }`}
        >
          <Gift size={15} />
          <span>Do'kon Inventari ({items.length})</span>
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'pending', label: 'Kutilmoqda' },
                { id: 'delivered', label: 'Topshirildi' },
                { id: 'cancelled', label: 'Bekor qilingan' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Talaba ismi orqali qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <PackageCheck size={36} className="mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="text-xs font-medium text-slate-500">Buyurtmalar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusConfig = {
                  pending: { label: "Kutilmoqda", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                  delivered: { label: "Topshirildi", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                  cancelled: { label: "Bekor qilingan", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
                }[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600" };

                const isCoinOrder = !order.item_id && (order.notes?.includes('Coin xaridi') || order.notes?.includes('coin'));
                const coinMatch = order.notes?.match(/(\d+)\s*coin/i);
                const coinAmount = coinMatch ? parseInt(coinMatch[1], 10) : 0;

                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isCoinOrder
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {isCoinOrder ? <Coins size={20} /> : <Gift size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {order.student?.full_name || "Noma'lum Talaba"}
                          </h4>
                          {isCoinOrder && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              +{coinAmount} Coin Xaridi
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                          <span>
                            {isCoinOrder ? "Tafsilot: " : "Sovg'a: "}
                            <strong className="text-slate-700 dark:text-slate-200 font-bold">
                              {order.item?.title || order.notes}
                            </strong>
                          </span>
                          {!isCoinOrder && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <Coins size={13} />
                                {order.coins_spent} Tanga
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>

                      {order.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'delivered', order.student_id, order.coins_spent)}
                            disabled={isUpdating === order.id}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            <span>{isCoinOrder ? `Tasdiqlash (+${coinAmount} coin)` : "Topshirildi"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'cancelled', order.student_id, order.coins_spent)}
                            disabled={isUpdating === order.id}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            <span>Bekor qilish</span>
                          </button>
                        </div>
                      )}

                      {order.status === 'delivered' && isCoinOrder && coinAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDirectCredit(order.student_id, coinAmount, order.id)}
                          disabled={isUpdating === order.id}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Agar talabaga coin tushmagan bo'lsa, ushbu tugma orqali balansiga o'tkazish"
                        >
                          <Coins size={12} />
                          <span>Coin o'tkazish</span>
                        </button>
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
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm group text-left"
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

              {/* BOTTOM ACTIONS FOOTER (Stock info + Edit & Delete buttons at the bottom) */}
              <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs text-slate-500 font-medium">
                  Omborda: <strong className="text-slate-800 dark:text-slate-100 font-bold">{item.stock} ta</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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
