"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useSWR, { mutate } from "swr";
import { useQueryClient } from "@tanstack/react-query";
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
  Loader2,
  Star,
  Rocket,
  Crown,
  ArrowRight,
  ShoppingCart,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getShopItems,
  purchaseShopItem,
  getStudentOrders,
  buyCoinsPackage,
  COIN_PACKAGES,
  type ShopItem,
  type ShopOrder,
  type CoinPackage
} from "@/lib/supabase-queries";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import { ShopPageSkeleton } from "@/components/ui/Skeleton";

interface ActiveCheckout {
  name: string;
  coins: number;
  priceUzs: number;
  icon: 'sparkles' | 'star' | 'rocket' | 'crown' | 'coins';
}

const PAYMENT_CONFIG = {
  cardNumber: "8600 5304 1234 5678",
  cardHolder: "PROMAX EDUCATION CENTER",
  bankTitle: "PROMAX EDUCATION • BANK KARTASI",
  telegramUsername: "promax_admin",
  telegramUrl: "https://t.me/promax_admin",
  phoneDisplay: "+998 (95) 513-77-76",
  phoneRaw: "+998955137776",
  centerName: "PROMAX Education Center"
};

export default function StudentShopPage() {
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [purchasingItem, setPurchasingItem] = useState<ShopItem | null>(null);
  const [activeCheckout, setActiveCheckout] = useState<ActiveCheckout | null>(null);
  const [customCoinsInput, setCustomCoinsInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'buy_coins' | 'my_orders'>('shop');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Copy card number
  const handleCopyCard = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    toast.success("Karta raqami nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Gift item purchase confirmation
  const handlePurchaseConfirm = async () => {
    if (!user || !purchasingItem) return;

    setIsSubmitting(true);
    try {
      const res = await purchaseShopItem(user.id, purchasingItem);
      if (res.success) {
        toast.success(`"${purchasingItem.title}" muvaffaqiyatli xarid qilindi!`);
        if (user.id) {
          queryClient.invalidateQueries({ queryKey: ['userProfile', user.id] });
          queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
          mutate(['userProfile', user.id]);
          mutate('dashboardStats');
          mutate(['studentOrders', user.id]);
        }
        mutate('shopItems');
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

  // Custom amount submit
  const handleCustomSubmit = () => {
    const amount = parseInt(customCoinsInput) || 0;
    if (amount < 10) {
      toast.error("Minimal miqdor 10 coin");
      return;
    }
    setActiveCheckout({
      name: "Maxsus",
      coins: amount,
      priceUzs: amount * 100,
      icon: 'coins'
    });
  };

  // Final payment confirmation & telegram redirect
  const handleConfirmPaymentSent = async () => {
    if (!user || !activeCheckout) return;

    setIsSubmitting(true);
    try {
      await buyCoinsPackage(
        user.id,
        activeCheckout.coins,
        activeCheckout.priceUzs,
        "card",
        `${activeCheckout.name} Paket`
      );

      // Open Telegram with prefilled message
      const text = encodeURIComponent(
        `Assalomu alaykum! Men ${PAYMENT_CONFIG.centerName} platformasida coin xarid qildim.\n\nFIO: ${profile?.full_name || 'O\'quvchi'}\nPaket: ${activeCheckout.name} (${activeCheckout.coins} coin)\nSumma: ${activeCheckout.priceUzs.toLocaleString()} so'm\n\nTo'lov chekini ushbu xabarga ilova qilyapman:`
      );
      window.open(`${PAYMENT_CONFIG.telegramUrl}?text=${text}`, '_blank');

      toast.success("So'rovingiz qabul qilindi! Chekni Telegram orqali adminga yuboring.", {
        duration: 5000
      });

      if (user.id) {
        mutate(['studentOrders', user.id]);
      }
      setActiveCheckout(null);
    } catch (err) {
      console.error("Payment confirmation error:", err);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const customCoinsNum = parseInt(customCoinsInput) || 0;

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-8 select-none">
      {/* Standard Ambient background matching all dashboard pages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-[1400px] mx-auto pt-1 sm:pt-2">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Promax Rewards Collection & Store
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('sidebar.shop') || "Do'kon"}
            </h1>
          </div>

          {/* Coins Balance Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl p-4 flex items-center gap-3 shadow-none shrink-0">
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

        {/* ── NAVIGATION TABS ── */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Gift size={16} />
            <span>Sovg'alar Katalogi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buy_coins')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'buy_coins'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Coins size={16} className={activeTab === 'buy_coins' ? 'text-white' : 'text-amber-500'} />
            <span>Coin Sotib Olish</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_orders')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'my_orders'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
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

        {/* ── 🛒 TAB 1: SHOP CATALOG TAB ── */}
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
                      onClick={() => setPurchasingItem(item)}
                      className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-none hover:border-amber-500/40 dark:hover:border-amber-500/40 active:scale-[0.99] transition-all flex flex-col justify-between text-left group cursor-pointer"
                    >
                      {/* Top Full-Bleed Image */}
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

        {/* ── 🪙 TAB 2: BUY COINS (TANGALAR SOTIB OLISH) ── */}
        {activeTab === 'buy_coins' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            
            {/* LEFT COLUMN: COIN PACKAGES (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COIN_PACKAGES.map((pkg) => {
                  const isPro = pkg.id === 'pro';
                  const isVip = pkg.id === 'vip';
                  const isPopular = pkg.id === 'standard';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setActiveCheckout({
                        name: pkg.name,
                        coins: pkg.coins,
                        priceUzs: pkg.priceUzs,
                        icon: pkg.icon
                      })}
                      className="relative overflow-hidden bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[28px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)] cursor-pointer group hover:border-slate-300/80 dark:hover:border-white/20"
                    >
                      {/* Glassy Inner Top Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/5 to-transparent dark:from-white/[0.06] dark:via-transparent dark:to-transparent pointer-events-none rounded-[28px]" />

                      {/* 🌟 Atmospheric Ambient Glow */}
                      <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700 ${
                        isPro
                          ? 'bg-amber-500/15'
                          : isVip
                          ? 'bg-purple-500/15'
                          : isPopular
                          ? 'bg-blue-500/15'
                          : 'bg-emerald-500/15'
                      }`} />

                      {/* 🔮 Geometric Pattern / Watermark (Naqshlar) */}
                      <div className="absolute right-2 top-2 pointer-events-none opacity-40 dark:opacity-20 group-hover:opacity-70 dark:group-hover:opacity-40 transition-opacity duration-500">
                        {pkg.id === 'starter' && (
                          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-emerald-500">
                            <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
                            <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="0.6" />
                            <path d="M40 8L44 36L72 40L44 44L40 72L36 44L8 40L36 36Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.7" />
                          </svg>
                        )}

                        {pkg.id === 'standard' && (
                          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-blue-500">
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
                            <circle cx="40" cy="40" r="26" stroke="currentColor" strokeWidth="0.7" />
                            <circle cx="40" cy="40" r="14" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
                            <polygon points="40,16 47,32 64,34 51,46 55,63 40,54 25,63 29,46 16,34 33,32" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.7" />
                          </svg>
                        )}

                        {pkg.id === 'pro' && (
                          <svg width="85" height="85" viewBox="0 0 85 85" fill="none" className="text-amber-500">
                            <circle cx="42.5" cy="42.5" r="38" stroke="currentColor" strokeWidth="0.8" strokeDasharray="5 3" />
                            <circle cx="42.5" cy="42.5" r="28" stroke="currentColor" strokeWidth="0.8" />
                            <circle cx="42.5" cy="42.5" r="16" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
                            <path d="M42.5 5L48 37L80 42.5L48 48L42.5 80L37 48L5 42.5L37 37Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="0.8" />
                          </svg>
                        )}

                        {pkg.id === 'vip' && (
                          <svg width="85" height="85" viewBox="0 0 85 85" fill="none" className="text-purple-500">
                            <polygon points="42.5,4 78,23 78,62 42.5,81 7,62 7,23" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
                            <polygon points="42.5,14 68,29 68,56 42.5,71 17,56 17,29" stroke="currentColor" strokeWidth="0.7" />
                            <polygon points="42.5,24 58,33 58,52 42.5,61 27,52 27,33" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="0.6" />
                          </svg>
                        )}
                      </div>

                      <div className="relative z-10">
                        {/* Top Header: Icon, Name, Badges */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2.5">
                            {pkg.icon === 'crown' ? (
                              <Crown size={20} className="text-purple-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            ) : pkg.icon === 'rocket' ? (
                              <Rocket size={20} className="text-amber-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            ) : pkg.icon === 'star' ? (
                              <Star size={20} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <Sparkles size={20} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                            )}
                            <span className="font-bold text-slate-900 dark:text-white text-base">
                              {pkg.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {pkg.discountBadge && (
                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                                {pkg.discountBadge}
                              </span>
                            )}
                            {pkg.tagBadge && (
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold backdrop-blur-sm ${
                                isPro
                                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : isVip
                                  ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                  : isPopular
                                  ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50'
                              }`}>
                                {pkg.tagBadge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Big Coins Count */}
                        <div className="flex items-baseline gap-1.5 mb-4">
                          <span className="text-3xl sm:text-4xl font-black font-fredoka text-slate-900 dark:text-white tracking-tight">
                            {pkg.coins}
                          </span>
                          <span className="text-sm font-bold text-slate-400 font-sans">
                            coin
                          </span>
                        </div>

                        {/* Delicate Gradient Separator */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/60 to-transparent mb-4" />

                        {/* Price & Action */}
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <span className="text-xs text-slate-400 line-through block mb-0.5 font-medium">
                              {pkg.originalPriceUzs.toLocaleString()} so'm
                            </span>
                            <span className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white block leading-tight">
                              {pkg.priceUzs.toLocaleString()} <span className="text-xs font-bold text-slate-500 font-sans">so'm</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                              {pkg.perCoinPrice}
                            </span>
                          </div>

                          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-white/10 text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 group-hover:scale-110 shadow-sm">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* RIGHT COLUMN: CUSTOM INPUT & HOW IT WORKS (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* O'zingiz miqdor kiriting */}
              <div className="relative overflow-hidden bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[28px] p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/[0.04] pointer-events-none rounded-[28px]" />
                
                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      O'zingiz miqdor kiriting
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      1 coin = 100 so'm (o'zingiz kiritgan miqdorda chegirma yo'q)
                    </p>
                  </div>

                  {/* Quick preset buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[50, 100, 250, 500, 1000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomCoinsInput(String(preset))}
                        className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-amber-500">
                      <Coins size={18} />
                    </div>
                    <input
                      type="number"
                      min="10"
                      placeholder="Minimum 10 coin"
                      value={customCoinsInput}
                      onChange={(e) => setCustomCoinsInput(e.target.value)}
                      className="w-full pl-11 pr-28 py-3 bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner"
                    />
                    {customCoinsNum > 0 && (
                      <span className="absolute right-3.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        = {(customCoinsNum * 100).toLocaleString()} so'm
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <span>To'lovga o'tish</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Qanday ishlaydi? */}
              <div className="relative overflow-hidden bg-white/65 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[28px] p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/[0.04] pointer-events-none rounded-[28px]" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <ShoppingCart size={16} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Qanday ishlaydi?
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                          Paket tanlang
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Kerakli coin paketini tanlang
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                          Karta orqali to'lang
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Ko'rsatilgan karta raqamiga summani o'tkazing
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                          Kvitansiya yuboring
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Skrinshot yoki to'lov chekini adminga yuboring
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                          Coinlar tushadi
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Admin tasdiqlashi bilan hisobga qo'shiladi
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── 📦 TAB 3: MY ORDERS TAB ── */}
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
                      className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none"
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

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 🛒 ITEM PURCHASE CONFIRMATION MODAL (BOTTOM SHEET) ── */}
      {purchasingItem && mounted && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPurchasingItem(null); }}
          className="fixed inset-0 z-[9999999] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-auto transition-all animate-in fade-in duration-200 overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-900 border-t border-x border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-t-[36px] max-w-xl w-full shadow-2xl relative flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300 ease-out">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 sm:px-7 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 rounded-t-[32px] sm:rounded-t-[36px] flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <ShoppingCart size={16} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-sans-pro">
                    Xaridni Tasdiqlash
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPurchasingItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto text-left">
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
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
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
                  className="py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 💳 COIN PURCHASE BOTTOM SHEET (PROMAX ADAPTED SPEC) ── */}
      {activeCheckout && mounted && createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveCheckout(null); }}
          className="fixed inset-0 z-[9999999] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-auto transition-all animate-in fade-in duration-200 overflow-hidden"
        >
          <div className="bg-white dark:bg-slate-900 border-t border-x border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-t-[36px] max-w-xl w-full shadow-2xl relative flex flex-col max-h-[88vh] animate-in slide-in-from-bottom duration-300 ease-out">
            
            {/* Sticky Header with Title & X Button */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 sm:px-7 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 rounded-t-[32px] sm:rounded-t-[36px] flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl font-fredoka">
                  Coin sotib olish
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveCheckout(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-7 space-y-5 overflow-y-auto text-left">
              {/* Selected Package Info Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {activeCheckout.icon === 'crown' ? (
                    <Crown size={26} className="text-purple-500 shrink-0" />
                  ) : activeCheckout.icon === 'rocket' ? (
                    <Rocket size={26} className="text-amber-500 shrink-0" />
                  ) : activeCheckout.icon === 'star' ? (
                    <Star size={26} className="text-blue-500 shrink-0" />
                  ) : activeCheckout.icon === 'coins' ? (
                    <Coins size={26} className="text-amber-500 shrink-0" />
                  ) : (
                    <Sparkles size={26} className="text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {activeCheckout.name} Paket
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {activeCheckout.coins} coin olish uchun
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-fredoka">
                    {activeCheckout.priceUzs.toLocaleString()} <span className="text-xs font-bold text-slate-400 font-sans">so'm</span>
                  </span>
                </div>
              </div>

              {/* Step 1: To'lovni amalga oshiring */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    1. To'lovni amalga oshiring
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
                    Quyidagi karta raqamiga belgilangan summani (<span className="font-bold text-slate-800 dark:text-slate-200">{activeCheckout.priceUzs.toLocaleString()} so'm</span>) o'tkazing. O'tkazma izohida ism-familiyangizni yozing.
                  </p>
                </div>

                {/* Bank Card Widget */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#131d31] to-slate-900 text-white p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      {PAYMENT_CONFIG.bankTitle}
                    </span>
                    <div className="flex gap-1.5 opacity-60">
                      <div className="w-5 h-3.5 rounded-sm bg-slate-600/60" />
                      <div className="w-5 h-3.5 rounded-sm bg-slate-500/60" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-white">
                      {PAYMENT_CONFIG.cardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                      title="Karta raqamidan nusxa olish"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-300 tracking-wider">
                    {PAYMENT_CONFIG.cardHolder}
                  </div>

                  {/* Decorative overlay circle */}
                  <div className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-blue-500/10 pointer-events-none blur-xl" />
                </div>
              </div>

              {/* Step 2: Chekni adminga yuboring */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    2. Chekni (skrinshot) adminga yuboring
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-1">
                    To'lov qilinganidan so'ng, tasdiqlash uchun kvitansiya nusxasini Telegram orqali adminga jo'nating.
                  </p>
                </div>

                {/* Telegram & Phone info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Telegram:</span>
                    <a
                      href={PAYMENT_CONFIG.telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      @{PAYMENT_CONFIG.telegramUsername}
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-500 font-medium">Telefon:</span>
                    <a
                      href={`tel:${PAYMENT_CONFIG.phoneRaw}`}
                      className="font-bold text-slate-800 dark:text-slate-100 hover:underline"
                    >
                      {PAYMENT_CONFIG.phoneDisplay}
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-500 font-medium">O'quv markazi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {PAYMENT_CONFIG.centerName}
                    </span>
                  </div>
                </div>

                {/* Alert note */}
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200/60 dark:border-amber-500/20 text-xs">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Siz kvitansiyani yuborib pastdagi tugmani bosganingizdan keyin admin sizning so'rovingizni tekshirib tasdiqlaydi. Yolg'on so'rov bermang.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmPaymentSent}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span>To'lov qildim — Chekni yubordim</span>
                )}
              </button>

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
