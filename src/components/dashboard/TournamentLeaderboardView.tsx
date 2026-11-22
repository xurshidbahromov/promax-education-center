"use client";

import Link from "next/link";
import {
  Award,
  Clock,
  Crown,
  Gift,
  Medal,
  Play,
  RotateCcw,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";

export interface UnifiedLeaderboardEntry {
  id: string;
  user_id: string;
  student_name: string;
  student_avatar?: string;
  score: number;
  max_score: number;
  scaled_score?: string;
  percentage: number;
  time_spent_seconds: number;
  rank: number;
  completed_at: string;
  prize?: string;
}

export interface UnifiedTournamentOption {
  id: string;
  title: string;
  subject?: string;
  status?: string;
}

interface TournamentLeaderboardViewProps {
  mode: "national" | "international";
  title?: string;
  subtitle: string;
  tournaments: UnifiedTournamentOption[];
  selectedTournamentId: string;
  onSelectTournament: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  entries: UnifiedLeaderboardEntry[];
  completedIds: string[];
  currentUserId?: string;
  currentUserAvatar?: string | null;
  onStartParticipate: () => void;
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins === 0) return `${rem} son`;
  return rem > 0 ? `${mins} daq ${rem} son` : `${mins} daq`;
}

function formatCompactDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  if (mins === 0) return `${rem} son`;
  return `${mins} daq`;
}

export default function TournamentLeaderboardView({
  mode,
  title = "G'oliblar & Natijalar Reytingi",
  subtitle,
  tournaments,
  selectedTournamentId,
  onSelectTournament,
  searchQuery,
  onSearchChange,
  entries,
  completedIds,
  currentUserId,
  currentUserAvatar,
  onStartParticipate,
}: TournamentLeaderboardViewProps) {
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;

  const filteredEntries = isSearching
    ? entries.filter((e) =>
        (e.student_name || "").toLowerCase().includes(trimmedSearch)
      )
    : entries;

  // When searching, show ALL matches (including top 1–3) so top students are always searchable!
  // Otherwise, top 3 live in the editorial podium and 4+ live in the ranked list below.
  const listEntries = isSearching
    ? filteredEntries
    : entries.filter((e) => e.rank > 3);

  const practiceHref =
    mode === "international"
      ? `/dashboard/tests/${selectedTournamentId}/take?type=international&international=true&mode=practice`
      : `/dashboard/tests/${selectedTournamentId}/take?type=olympiad&olympiad=true&mode=practice`;

  const top1 = entries.find((e) => e.rank === 1) || entries[0];
  const top2 = entries.find((e) => e.rank === 2) || entries[1];
  const top3 = entries.find((e) => e.rank === 3) || entries[2];

  const renderAvatar = (
    entry: UnifiedLeaderboardEntry,
    sizeClass: string,
    ringClass: string,
    fallbackClass: string
  ) => {
    const isSelf = Boolean(currentUserId && entry.user_id === currentUserId);
    const avatar = isSelf
      ? currentUserAvatar || entry.student_avatar
      : entry.student_avatar;
    const hasAvatar = Boolean(avatar && !avatar.includes("dicebear"));

    if (hasAvatar && avatar) {
      return (
        <img
          src={avatar}
          alt={entry.student_name}
          className={`${sizeClass} rounded-full object-cover ${ringClass} shrink-0`}
        />
      );
    }

    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-extrabold uppercase select-none shrink-0 ${ringClass} ${fallbackClass}`}
      >
        {(entry.student_name || "O")[0]}
      </div>
    );
  };

  const render3DPodiumSlot = (
    rank: 1 | 2 | 3,
    entry?: UnifiedLeaderboardEntry
  ) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;

    const capGradient = isFirst
      ? "from-amber-200 via-amber-300 to-yellow-200 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-300"
      : isSecond
      ? "from-blue-200 via-indigo-200 to-sky-200 dark:from-blue-500 dark:via-indigo-400 dark:to-sky-400"
      : "from-orange-200 via-amber-200 to-rose-200 dark:from-orange-500 dark:via-amber-400 dark:to-rose-400";

    const standGradient = isFirst
      ? "from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700"
      : isSecond
      ? "from-blue-400 via-indigo-500 to-indigo-600 dark:from-blue-600 dark:via-indigo-700 dark:to-indigo-800"
      : "from-orange-400 via-orange-500 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-800";

    const standHeight = isFirst
      ? "h-36 sm:h-44"
      : isSecond
      ? "h-28 sm:h-36"
      : "h-24 sm:h-28";

    const capHeight = isFirst ? "h-5 sm:h-6" : "h-4 sm:h-5";

    const ringClass = isFirst
      ? "border-4 border-amber-400 ring-4 ring-amber-400/25"
      : isSecond
      ? "border-2 border-blue-300 dark:border-blue-500"
      : "border-2 border-orange-300 dark:border-orange-500";

    const fallbackClass = isFirst
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 text-xl sm:text-2xl"
      : isSecond
      ? "bg-blue-100 dark:bg-blue-900/40 text-brand-blue dark:text-blue-300 text-lg sm:text-xl"
      : "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 text-lg sm:text-xl";

    const scoreColor = isFirst
      ? "text-amber-600 dark:text-amber-400"
      : isSecond
      ? "text-brand-blue dark:text-blue-400"
      : "text-orange-600 dark:text-orange-400";

    const openRingColor = isSecond
      ? "border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50"
      : "border-orange-400 dark:border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/50";

    if (!entry) {
      return (
        <div key={`open-${rank}`} className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center space-y-1 mb-2.5">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center ${openRingColor}`}
            >
              <Medal size={18} />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5">
                Ochiq
              </span>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {rank}-o&apos;rin bo&apos;sh
            </h4>
            <span className="text-[10px] font-semibold text-slate-400">
              Kutilmoqda
            </span>
          </div>

          {/* 3D Isometric Stand (Empty) */}
          <div className="w-full opacity-85">
            <div
              className={`${capHeight} w-full bg-gradient-to-r ${capGradient} rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/25`}
            />
            <div
              className={`${standHeight} w-full bg-gradient-to-b ${standGradient} rounded-b-2xl flex flex-col items-center justify-center text-white relative overflow-hidden`}
            >
              <span className="text-4xl sm:text-5xl font-black font-fredoka tracking-tighter">
                {rank}
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/80 -mt-1">
                Kutilmoqda
              </span>
            </div>
          </div>
        </div>
      );
    }

    const isSelf = Boolean(currentUserId && entry.user_id === currentUserId);

    return (
      <div
        key={entry.id}
        className={`flex flex-col items-center text-center ${
          isFirst ? "-mt-6 sm:-mt-8 z-20" : ""
        }`}
      >
        {/* Floating Profile Info */}
        <div className="flex flex-col items-center space-y-1 mb-2.5 w-full">
          <div className="relative">
            {renderAvatar(
              entry,
              isFirst ? "w-16 h-16 sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16",
              ringClass,
              fallbackClass
            )}
            {isFirst && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 p-1.5 bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-full border border-amber-200">
                <Crown size={14} className="fill-white" />
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 max-w-[96px] sm:max-w-[140px]">
            <h4
              className={`truncate text-slate-900 dark:text-white ${
                isFirst ? "font-black text-sm sm:text-base" : "font-bold text-xs sm:text-sm"
              }`}
            >
              {entry.student_name}
            </h4>
            {isSelf && (
              <span className="px-1.5 py-0.5 rounded bg-brand-blue text-white text-[8px] font-black uppercase shrink-0">
                Siz
              </span>
            )}
          </div>

          {/* Score + Max Score + Percentage */}
          <div className="flex flex-col items-center gap-0.5 tabular-nums">
            {mode === "international" && entry.scaled_score ? (
              <>
                <span className={`font-extrabold ${isFirst ? "text-xs sm:text-sm" : "text-xs"} ${scoreColor}`}>
                  {entry.scaled_score}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {entry.score} / {entry.max_score} ball · {entry.percentage}%
                </span>
              </>
            ) : (
              <>
                <div className={`font-extrabold ${isFirst ? "text-xs sm:text-sm" : "text-xs"} ${scoreColor}`}>
                  <span>{entry.score}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {" "}/ {entry.max_score} ball
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  {entry.percentage}%
                </span>
              </>
            )}
          </div>

          {/* Time */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-semibold tabular-nums">
            <Clock size={10} />
            <span>
              {isFirst
                ? formatDuration(entry.time_spent_seconds)
                : formatCompactDuration(entry.time_spent_seconds)}
            </span>
          </div>
        </div>

        {/* 3D Isometric Stand */}
        <div className="w-full">
          <div
            className={`${capHeight} w-full bg-gradient-to-r ${capGradient} rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/30`}
          />
          <div
            className={`${standHeight} w-full bg-gradient-to-b ${standGradient} rounded-b-2xl flex items-center justify-center text-white relative overflow-hidden`}
          >
            <span
              className={`${
                isFirst ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
              } font-black font-fredoka tracking-tighter`}
            >
              {rank}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── TOP TOOLBAR ── */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy size={21} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold font-fredoka text-slate-900 dark:text-white leading-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {tournaments.length > 0 && (
            <select
              value={selectedTournamentId}
              onChange={(e) => onSelectTournament(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-brand-blue sm:max-w-[230px] truncate cursor-pointer"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject ? `[${t.subject}] ` : ""}
                  {t.title}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ishtirokchi qidirish..."
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-brand-blue"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Qidiruvni tozalash"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {selectedTournamentId && (
            <Link
              href={practiceHref}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>
                {completedIds.includes(selectedTournamentId)
                  ? "Qayta yechish"
                  : "Mashq qilish"}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* ── 3D ISOMETRIC OLYMPIC PODIUM (TOP 3) — hidden while searching so search hits show right at the top ── */}
      {!isSearching && entries.length >= 1 && (
        <div className="relative w-full bg-white/90 dark:bg-slate-900/90 rounded-[28px] p-5 sm:p-8 border border-slate-200/70 dark:border-slate-800 overflow-hidden">
          {/* Subtle CSS radial aura behind champion (zero GPU blur lag) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 20%, rgba(245,158,11,0.10) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top 3 Sovrindorlar
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
              <Users size={13} />
              {entries.length} ishtirokchi
            </span>
          </div>

          <div className="relative z-10 max-w-lg mx-auto pt-4 pb-1">
            <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-4">
              {render3DPodiumSlot(2, top2)}
              {render3DPodiumSlot(1, top1)}
              {render3DPodiumSlot(3, top3)}
            </div>
          </div>
        </div>
      )}

      {/* ── RANKED LIST ── */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border border-slate-200/70 dark:border-slate-800 p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold font-fredoka text-sm sm:text-base text-slate-900 dark:text-white">
              {isSearching ? "Qidiruv natijalari" : "Ishtirokchilar ro'yxati"}
            </h4>
            {!isSearching && entries.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                4-o&apos;rindan
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums">
            {listEntries.length} ta
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Award size={24} />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Ushbu musobaqa bo&apos;yicha hali natijalar yo&apos;q
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Birinchi bo&apos;lib qatnashing va 1-o&apos;rinni egallang!
            </p>
            <button
              type="button"
              onClick={onStartParticipate}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              <span>Qatnashish</span>
            </button>
          </div>
        ) : listEntries.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Trophy size={18} />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
              {isSearching
                ? `"${searchQuery}" bo'yicha ishtirokchi topilmadi`
                : "Barcha ishtirokchilar yuqoridagi Top 3 shoxsupada"}
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              {isSearching
                ? "Ismni boshqacha yozib ko'ring yoki qidiruvni tozalang."
                : "Keyingi topshirgan barcha ishtirokchilar 4-o'rindan boshlab shu yerda ko'rinadi."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {listEntries.map((entry) => {
              const isSelf = Boolean(currentUserId && entry.user_id === currentUserId);
              const rankBadgeClass =
                entry.rank === 1
                  ? "bg-amber-500 text-white"
                  : entry.rank === 2
                  ? "bg-slate-500 text-white"
                  : entry.rank === 3
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";

              return (
                <div
                  key={entry.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isSelf
                      ? "bg-brand-blue/[0.06] dark:bg-brand-blue/15 border-brand-blue/30"
                      : "bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border-slate-200/60 dark:border-slate-800"
                  }`}
                >
                  {/* Left: Rank + Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs tabular-nums inline-flex items-center justify-center shrink-0 ${rankBadgeClass}`}
                    >
                      #{entry.rank}
                    </span>

                    {renderAvatar(
                      entry,
                      "w-9 h-9 sm:w-10 sm:h-10",
                      "border border-slate-200/80 dark:border-slate-700",
                      "bg-brand-blue/10 text-brand-blue dark:text-blue-400 text-xs"
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {entry.student_name}
                        </p>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded-md bg-brand-blue text-white text-[9px] font-extrabold uppercase shrink-0">
                            Siz
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {entry.completed_at}
                      </p>
                    </div>
                  </div>

                  {/* Right: Score + Percentage + Time */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0 tabular-nums">
                    {entry.prize && (
                      <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                        <Gift size={12} className="text-amber-500" />
                        <span>{entry.prize}</span>
                      </span>
                    )}

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {mode === "international" && entry.scaled_score ? (
                          <>
                            <span className="text-brand-blue dark:text-blue-400">
                              {entry.scaled_score}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              ({entry.score}/{entry.max_score} ball)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-brand-blue dark:text-blue-400">
                              {entry.score}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              / {entry.max_score} ball
                            </span>
                          </>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          {entry.percentage}%
                        </span>
                      </div>
                      <p className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                        <Clock size={10} />
                        <span>{formatDuration(entry.time_spent_seconds)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Open Podium CTA when < 3 participants */}
        {entries.length > 0 && entries.length < 3 && !isSearching && (
          <div className="p-3.5 sm:p-4 rounded-2xl border border-dashed border-amber-500/35 bg-amber-500/[0.06] dark:bg-amber-500/10 flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Trophy size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Shoxsupada yana {3 - entries.length} ta sovrinli o&apos;rin ochiq!
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Qatnashib Top 3 sovrindorlar qatoridan joy oling.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onStartParticipate}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={12} className="fill-white" />
              <span>Qatnashish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
