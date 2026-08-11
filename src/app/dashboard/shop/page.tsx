"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Coins,
  Sparkles,
  PackageCheck,
  Gift,
  Clock,
  Shirt,
  Ticket,
  Percent,
  Smartphone,
  X,
  Loader2
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getShopItems,
  purchaseShopItem,
  getStudentOrders,
  type ShopItem,
  type ShopOrder
} from "@/lib/supabase-queries";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import { ShopPageSkeleton } from "@/components/ui/Skeleton";

export default function StudentShopPage() {
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchasingItem, setPurchasingItem] = useState<ShopItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'my_orders'>('shop');

  // Fetch shop items & student orders
  const { data: items = [], isLoading: itemsLoading } = useSWR('shopItems', getShopItems);
  const { data: myOrders = [], isLoading: ordersLoading } = useSWR(
    user?.id ? ['studentOrders', user.id] : null,
    () => user?.id ? getStudentOrders(user.id) : Promise.resolve([])
  );

  const studentCoins = profile?.coins || 0;

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const categories = [
    { id: "all", label: "Barcha Sovg'alar", icon: Gift },
    { id: "merch", label: "Promax Merch", icon: Shirt },
    { id: "exam", label: "Exam Chiptalari", icon: Ticket },
    { id: "discount", label: "Chegirmalar", icon: Percent },
    { id: "gadget", label: "Gadjetlar", icon: Smartphone },
  ];

  const handlePurchaseConfirm = async () => {
    if (!user || !purchasingItem) return;

    setIsSubmitting(true);
    try {
      const res = await purchaseShopItem(user.id, purchasingItem);
      if (res.success) {
        toast.success(`"${purchasingItem.title}" muvaffaqiyatli xarid qilindi!`);
        mutate(['userProfile', user.id]);
        mutate('dashboardStats');
        mutate('shopItems');
        if (user.id) mutate(['studentOrders', user.id]);
        setPurchasingItem(null);
      } else {
        toast.error(res.error || "Xaridni amalga oshirishda xatolik");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Standard Ambient background matching all dashboard pages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-[1400px] mx-auto pt-4 sm:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Promax Rewards Collection
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('sidebar.shop') || "Do'kon"}
            </h1>
          </div>

          {/* Coins Balance Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 flex items-center gap-3 shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Coins size={20} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Sizning Balansingiz
              </span>
              <span className="text-xl font-black font-fredoka text-slate-800 dark:text-white">
                {studentCoins} <span className="text-xs font-bold text-amber-500">tanga</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <Gift size={16} />
            <span>Sovg'alar Katalogi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my_orders'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          >
            <PackageCheck size={16} />
            <span>Mening Xaridlarim</span>
            {myOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-amber-600 font-extrabold text-[10px] flex items-center justify-center">
                {myOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* SHOP CATALOG TAB */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-white/60 dark:border-slate-800/60 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Pristine Minimalist Grid */}
            {itemsLoading ? (
              <ShopPageSkeleton />
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Gift size={40} className="mx-auto mb-3 text-slate-400 opacity-50" />
                <p className="text-sm font-semibold text-slate-500">Ushbu kategoriyada sovg'alar topilmadi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const canAfford = studentCoins >= item.price_coins;
                  const isOutOfStock = item.stock <= 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-[2rem] overflow-hidden shadow-lg shadow-black/5 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all flex flex-col justify-between text-left group"
                    >
                      {/* Top Full-Bleed Image (Touches top, left, right directly) */}
                      <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-500">
                            <Gift size={40} />
                          </div>
                        )}

                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                          Qoldi: {item.stock} ta
                        </div>
                      </div>

                      {/* Content Box with Padding */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base font-sans-pro">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>

                        {/* Bottom Price & Action Footer */}
                        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-sm">
                            <Coins size={16} />
                            <span>{item.price_coins} Tanga</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPurchasingItem(item)}
                            disabled={!canAfford || isOutOfStock}
                            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isOutOfStock
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isOutOfStock ? (
                              <span>Tugagan</span>
                            ) : (
                              <>
                                <Sparkles size={14} />
                                <span>Xarid Qilish</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeTab === 'my_orders' && (
          <div className="space-y-3 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Sizning Xaridlaringiz Ro'yxati
            </h3>

            {ordersLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
            ) : myOrders.length === 0 ? (
              <div className="py-16 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <PackageCheck size={40} className="mx-auto mb-3 text-slate-400 opacity-50" />
                <p className="text-sm font-semibold text-slate-500">Siz hali hech qanday sovg'a xarid qilmadingiz</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((order) => {
                  const statusConfig = {
                    pending: { label: "Kutilmoqda (Admin ko'rib chiqmoqda)", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                    delivered: { label: "Topshirildi (Qabul qilingan)", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                    cancelled: { label: "Bekor qilindi (Tangalar qaytarildi)", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
                  }[order.status] || { label: order.status, color: "bg-slate-100 text-slate-600" };

                  return (
                    <div
                      key={order.id}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                          <Gift size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {order.item?.title || order.notes || "Sovg'a Xaridi"}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {new Date(order.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Coins size={13} />
                          {order.coins_spent} Tanga
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {purchasingItem && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-xl relative space-y-4 text-left">
            <button
              type="button"
              onClick={() => setPurchasingItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                <Gift size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base font-sans-pro">
                  Xaridni Tasdiqlash
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Promax Collection
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-700/50 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {purchasingItem.title}
              </h4>
              <div className="flex items-center justify-between font-medium pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">Narxi:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Coins size={13} />
                  {purchasingItem.price_coins} Tanga
                </span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-500">Qoladigan tangalar:</span>
                <span className="text-slate-800 dark:text-slate-100 font-bold">
                  {studentCoins - purchasingItem.price_coins} Tanga
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Xariddan so'ng buyurtmangiz ma'lumotlar bazasida saqlanadi hamda ma'muriyat tomonidan topshiriladi.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePurchaseConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Tasdiqlash & Xarid qilish</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPurchasingItem(null)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
