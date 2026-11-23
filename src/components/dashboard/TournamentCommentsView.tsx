"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";

export interface UnifiedCommentItem {
  id: string;
  author: string;
  avatar?: string | null;
  role: string;
  time: string;
  text: string;
  likes: number;
  user_id?: string;
}

interface TournamentCommentsViewProps {
  title?: string;
  subtitle?: string;
  comments: UnifiedCommentItem[];
  likedCommentIds: string[];
  currentUserId?: string;
  currentUserName: string;
  currentUserAvatar?: string | null;
  currentUserRole: string;
  isAdmin?: boolean;
  newCommentText: string;
  onNewCommentTextChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => Promise<void> | void;
  onToggleLike: (id: string) => void;
  onDeleteComment?: (id: string) => Promise<void> | void;
}

const MAX_LEN = 500;

export default function TournamentCommentsView({
  title = "Muhokama & Izohlar",
  subtitle = "Musobaqa haqida savollaringiz yoki fikrlaringizni qoldiring",
  comments,
  likedCommentIds,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isAdmin = false,
  newCommentText,
  onNewCommentTextChange,
  onSubmitComment,
  onToggleLike,
  onDeleteComment,
}: TournamentCommentsViewProps) {
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedComments = useMemo(() => {
    if (sortBy === "popular") {
      return [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    return comments;
  }, [comments, sortBy]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmitComment(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteComment || deletingId) return;
    setDeletingId(id);
    try {
      await onDeleteComment(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === "Tashkilotchi") {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20";
    }
    if (role === "Ustoz") {
      return "bg-brand-blue/10 text-brand-blue dark:text-blue-400 border border-brand-blue/20";
    }
    return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── COMPOSER CARD ── */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border border-slate-200/70 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
              <MessageSquare size={19} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold tabular-nums shrink-0">
                  {comments.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {comments.length > 1 && (
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === "newest"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Eng yangi
              </button>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === "popular"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Mashhur
              </button>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex items-start gap-3">
          {currentUserAvatar && !currentUserAvatar.includes("dicebear") ? (
            <img
              src={currentUserAvatar}
              alt={currentUserName}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 object-cover border border-slate-200 dark:border-slate-700 mt-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-extrabold text-sm flex items-center justify-center border border-brand-blue/20 shrink-0 select-none uppercase mt-0.5">
              {(currentUserName || "O")[0]}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <textarea
              rows={2}
              maxLength={MAX_LEN}
              value={newCommentText}
              onChange={(e) => onNewCommentTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newCommentText.trim() && !submitting) {
                    handleFormSubmit(e);
                  }
                }
              }}
              placeholder="Fikringiz yoki savolingizni yozing..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                {newCommentText.length > 350
                  ? `${newCommentText.length} / ${MAX_LEN}`
                  : "Enter — yuborish"}
              </span>
              <button
                type="submit"
                disabled={!newCommentText.trim() || submitting}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Yuborish</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── COMMENTS LIST ── */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border border-slate-200/70 dark:border-slate-800 p-4 sm:p-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare size={22} />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Hozircha izohlar yo&apos;q
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Birinchi bo&apos;lib fikringiz yoki savolingizni qoldiring!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => {
              const isLiked = likedCommentIds.includes(comment.id);
              const canDelete = Boolean(
                onDeleteComment &&
                  (isAdmin || (currentUserId && comment.user_id === currentUserId))
              );
              const hasAvatar = Boolean(
                comment.avatar && !comment.avatar.includes("dicebear")
              );

              return (
                <div
                  key={comment.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/75 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
                >
                  {hasAvatar && comment.avatar ? (
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-brand-blue/20 shrink-0 select-none uppercase">
                      {(comment.author || "O")[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {comment.author}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadgeStyle(
                            comment.role
                          )}`}
                        >
                          {comment.role}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {comment.time || "Yaqinda"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                      {comment.text}
                    </p>

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleLike(comment.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                          isLiked
                            ? "bg-brand-blue/10 text-brand-blue dark:text-blue-400"
                            : "bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200/70 dark:border-slate-700/70"
                        }`}
                      >
                        <ThumbsUp
                          size={12}
                          className={isLiked ? "fill-current" : ""}
                        />
                        <span>{comment.likes || 0}</span>
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          disabled={deletingId === comment.id}
                          onClick={() => handleDelete(comment.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          aria-label="Izohni o'chirish"
                        >
                          {deletingId === comment.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          <span className="hidden sm:inline">O&apos;chirish</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
