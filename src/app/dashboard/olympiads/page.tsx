"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Trophy, 
  ArrowLeft, 
  Clock, 
  Users, 
  Gift, 
  CheckCircle2, 
  X,
  FileText,
  ArrowUpRight,
  MessageSquare,
  Send,
  ThumbsUp
} from "lucide-react";
import { SAMPLE_OLYMPIADS, OlympiadItem } from "@/components/dashboard/OlympiadSection";

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  text: string;
  likes: number;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    author: "Jasurbek Aliyev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasurbek",
    role: "O'quvchi",
    time: "10 daqiqa avval",
    text: "Matematika olimpiadasi savollari darajasi qanday bo'ladi? Tayyorgarlik uchun tayyor testlar bormi?",
    likes: 8,
  },
  {
    id: "c2",
    author: "Promax Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PromaxAdmin",
    role: "Tashkilotchi",
    time: "5 daqiqa avval",
    text: "Assalomu alaykum! Olimpiada testlari mantiqiy va standart murakkablikda bo'ladi. Dashboardning Testlar bo'limida tayyorgarlik testlarini yechishingiz mumkin.",
    likes: 15,
  },
  {
    id: "c3",
    author: "Sevinch Usmonova",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sevinch",
    role: "O'quvchi",
    time: "Zamonagacha",
    text: "Top o'rin egalari uchun sertifikatlar elektron tarzda taqdim etiladimi?",
    likes: 4,
  },
];

export default function OlympiadsPage() {
  const [activeTab, setActiveTab] = useState<"tournaments" | "comments">("tournaments");
  const [selectedItem, setSelectedItem] = useState<OlympiadItem | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  
  // Comments state
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  const handleRegister = (id: string, title: string) => {
    if (registeredIds.includes(id)) {
      toast.success("Siz ushbu musobaqaga allaqachon ro'yxatdan o'tgansiz!", {
        icon: "✅"
      });
      return;
    }
    setRegisteredIds((prev) => [...prev, id]);
    toast.success(`"${title}" musobaqasiga muvaffaqiyatli ro'yxatdan o'tdingiz!`, {
      icon: "🎉"
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error("Iltimos, izoh matnini kiriting!");
      return;
    }

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: "Men (Siz)",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StudentUser",
      role: "O'quvchi",
      time: "Hozirgincha",
      text: newCommentText.trim(),
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
    toast.success("Fikringiz muvaffaqiyatli joylandi!", { icon: "💬" });
  };

  const handleToggleLike = (id: string) => {
    if (likedCommentIds.includes(id)) {
      setLikedCommentIds((prev) => prev.filter((item) => item !== id));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: c.likes - 1 } : c))
      );
    } else {
      setLikedCommentIds((prev) => [...prev, id]);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
      );
    }
  };

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-16">
      <div className="relative z-10 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pt-2 sm:pt-4">
        
        {/* Top Back Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ArrowLeft size={15} />
            <span>Dashboardga qaytish</span>
          </Link>

          {/* Minimalist Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-6 rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-none">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                Milliy bilim musobaqalari
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Bilimingizni sinang va mukofotlarni qo'lga kiriting
              </p>
            </div>

            {/* Simple Text Stats */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" />
                <span>Bilim musobaqalari</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-brand-blue" />
                <span>1,240+ qatnashuvchi</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Gift size={14} className="text-amber-500" />
                <span>Top mukofotlar</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── TOP SWITCH TOGGLE BAR (Musobaqalar vs Izohlar) ── */}
        <div className="w-full rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/80 dark:border-slate-800/80 p-1.5 flex items-center justify-between gap-3 shadow-none">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("tournaments")}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "tournaments"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Trophy size={16} />
              <span>Musobaqalar</span>
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "comments"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare size={16} />
              <span>Izohlar va Muhokama</span>
            </button>
          </div>

          <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 font-medium px-3">
            {activeTab === "tournaments" ? "Barcha musobaqalar ro'yxati" : "Savol-javoblar va muhokamalar"}
          </span>
        </div>

        {/* ── TAB 1: TOURNAMENTS GRID ── */}
        {activeTab === "tournaments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {SAMPLE_OLYMPIADS.map((item) => {
              const isRegistered = registeredIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-5 border border-white/80 dark:border-slate-800/80 flex flex-col justify-between gap-4 shadow-none"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </span>

                      {item.status === "live" ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Faol</span>
                        </span>
                      ) : item.status === "upcoming" ? (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          {item.startDate}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          Yakunlangan
                        </span>
                      )}
                    </div>

                    {/* Title & Short Description */}
                    <div>
                      <h3 className="text-base font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Clean Specs Bar */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} />
                          Vaqti:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.startTime} ({item.durationMinutes} daqiqa)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Users size={13} />
                          Qatnashuvchilar:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.participantsCount} nafar
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Gift size={13} />
                          Mukofotlar:
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          Top o'rinlar uchun
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simple Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs active:scale-95"
                    >
                      Nizamnoma
                    </button>

                    <button
                      onClick={() => handleRegister(item.id, item.title)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs active:scale-95 flex items-center justify-center gap-1 ${
                        isRegistered
                          ? "bg-emerald-500 text-white"
                          : "bg-brand-blue text-white"
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Ro'yxatdasiz</span>
                        </>
                      ) : (
                        <>
                          <span>Qatnashish</span>
                          <ArrowUpRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB 2: COMMENTS & DISCUSSION SECTION ── */}
        {activeTab === "comments" && (
          <div className="w-full bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 border border-white/80 dark:border-slate-800/80 space-y-6 shadow-none">
            
            {/* Comments Section Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                  Izohlar va Muhokamalar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Musobaqalar bo'yicha savollaringizni qoldiring va o'zaro fikr almashing
                </p>
              </div>
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Musobaqa bo'yicha savolingiz yoki fikringizni yozing..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <span>Yuborish</span>
                <Send size={14} />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.map((comment) => {
                const isLiked = likedCommentIds.includes(comment.id);

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-start gap-3.5"
                  >
                    {/* Author Avatar */}
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"
                    />

                    {/* Comment Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            comment.role === "Tashkilotchi"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            {comment.role}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {comment.time}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {comment.text}
                      </p>

                      {/* Like Action */}
                      <div className="pt-1">
                        <button
                          onClick={() => handleToggleLike(comment.id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                            isLiked
                              ? "text-brand-blue"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        >
                          <ThumbsUp size={13} className={isLiked ? "fill-brand-blue" : ""} />
                          <span>Foydali ({comment.likes})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Simple Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-white/80 dark:border-slate-800 shadow-xl space-y-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-blue">
                  {selectedItem.subject}
                </span>
                <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                  {selectedItem.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {selectedItem.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">Musobaqa Qoidalari:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {selectedItem.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Yopish
                </button>

                <button
                  onClick={() => {
                    handleRegister(selectedItem.id, selectedItem.title);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center justify-center gap-1"
                >
                  <span>Musobaqaga kirish</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
