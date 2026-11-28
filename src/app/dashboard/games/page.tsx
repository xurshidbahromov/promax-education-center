"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import {
  ArrowLeft,
  BrainCircuit,
  Zap,
  Languages,
  Trophy,
  Coins,
  Swords,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { GamesPageSkeleton } from "@/components/ui/Skeleton";
import ArcadeGameModal from "@/components/games/ArcadeGameModal";
import { getGameHighScore, type GameId } from "@/lib/game-engines";

interface PlayableGameCard {
  id: GameId;
  title: string;
  category: string;
  description: string;
  topics: string[];
  rewardText: string;
  icon: typeof Zap;
  iconTile: string;
}

const PLAYABLE_GAMES: PlayableGameCard[] = [
  {
    id: "math",
    title: "Matematika Pro",
    category: "DTM & SAT",
    description:
      "Logarifm, trigonometriya, Viyet teoremasi, progressiya, hosila va funksiyalar bo'yicha 60 soniyalik tezkor mashq.",
    topics: ["Logarifm", "Viyet", "Hosila", "Trigonometriya"],
    rewardText: "60 tagacha tanga",
    icon: Zap,
    iconTile: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    id: "logic",
    title: "Mantiq & IQ Qatorlar",
    category: "IQ & Mantiq",
    description:
      "Sonli ketma-ketliklardagi yashirin qonuniyatni topish: Fibonachchi, kvadrat/kub, ikkilamchi farq va parallel qatorlar.",
    topics: ["Fibonachchi", "Ikkilamchi farq", "Parallel qator"],
    rewardText: "60 tagacha tanga",
    icon: BrainCircuit,
    iconTile: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "vocab",
    title: "Academic Vocab Blitz",
    category: "IELTS & SAT",
    description:
      "Oliy ta'lim va xalqaro imtihonlar uchun eng muhim akademik ingliz tili so'zlari, tarjimalari va sinonimlari.",
    topics: ["IELTS 6–8+", "SAT Vocab", "Sinonimlar"],
    rewardText: "60 tagacha tanga",
    icon: Languages,
    iconTile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
];

const UPCOMING_MODES = [
  {
    id: "1v1",
    title: "1v1 Duel Arena",
    desc: "Boshqa abituriyentlar bilan jonli bellashuv",
    icon: Swords,
    iconTile: "bg-rose-500/10 text-rose-500",
  },
  {
    id: "team",
    title: "Team War League",
    desc: "Guruhlar o'rtasida haftalik jamoaviy liga",
    icon: Trophy,
    iconTile: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
];

export default function GameZonePage() {
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading } = useUserProfile(user?.id);
  const [optimisticDelta, setOptimisticDelta] = useState(0);
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [bestScores, setBestScores] = useState<Record<GameId, number>>({
    math: 0,
    logic: 0,
    vocab: 0,
  });

  const coins = (profile?.coins || 0) + optimisticDelta;

  const refreshHighScores = () => {
    setBestScores({
      math: getGameHighScore("math"),
      logic: getGameHighScore("logic"),
      vocab: getGameHighScore("vocab"),
    });
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refreshHighScores();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-8 select-none">

      <div className="relative z-10 flex flex-col gap-6 max-w-[1400px] mx-auto pt-1 sm:pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors w-fit -mb-2"
        >
          <ArrowLeft size={16} />
          <span>Orqaga</span>
        </Link>

        {/* ── HEADER (Shop aligned) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Abituriyent &amp; SAT Intellektual Arena
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
              {t("games.title") || "O'yin maydoni"}
            </h1>
          </div>

          {/* Coins Balance Card (exact Shop style) */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] p-4 flex items-center gap-3 shadow-none shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-none shrink-0">
              <Coins size={20} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Sizning Balansingiz
              </span>
              <span className="text-xl font-semibold font-sans tracking-tight text-slate-800 dark:text-white tabular-nums">
                {coins} <span className="text-xs font-bold text-amber-500">tanga</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── 3 ACTIVE PLAYABLE GAMES (Signature Notched-Tab Banner Cards) ── */}
        {isLoading ? (
          <GamesPageSkeleton />
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {PLAYABLE_GAMES.map((game) => {
                const Icon = game.icon;
                const best = bestScores[game.id];

                return (
                  <div key={game.id} className="relative w-full">
                    {/* ── TOP ROW: TRANSPARENT SHELF TAB + SEAMLESS RIGHT GLASS HEADER ── */}
                    <div className="flex items-stretch relative z-20">
                      <button
                        type="button"
                        onClick={() => setActiveGameId(game.id)}
                        className="w-[40%] sm:w-[30%] bg-transparent px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center shrink-0 z-10 cursor-pointer text-left group/step"
                      >
                        <h3 className="text-sm sm:text-xl font-medium font-sans tracking-tight text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="truncate">{game.category}</span>
                          <ArrowDownRight
                            size={18}
                            className="text-amber-500 stroke-[2.5] sm:w-[20px] sm:h-[20px] shrink-0 group-hover/step:translate-x-0.5 group-hover/step:translate-y-0.5 transition-transform"
                          />
                        </h3>
                      </button>

                      <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3 rounded-t-3xl border-t border-r border-white/60 dark:border-slate-800/60 border-b-0 border-l-0 flex items-center justify-center gap-3 z-20 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                          <Coins size={14} className="text-amber-500 shrink-0" />
                          <span>{game.rewardText}</span>
                        </span>
                        {best > 0 && (
                          <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold tabular-nums whitespace-nowrap">
                            <Trophy size={11} />
                            {best} ball
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── MAIN CARD BODY ── */}
                    <div className="relative z-10 w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-l border-r border-t-0 border-white/60 dark:border-slate-800/60 shadow-none">
                      {/* Smooth Top-Left Corner Curved Border */}
                      <div className="absolute top-0 left-0 w-[40%] sm:w-[30%] h-6 rounded-tl-3xl border-t border-l border-white/60 dark:border-slate-800/60 pointer-events-none z-10" />

                      {/* Left: Icon + Title + Description + Topic Pills */}
                      <div className="relative z-10 flex items-start sm:items-center gap-3.5 min-w-0 flex-1 w-full">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${game.iconTile} border flex items-center justify-center shrink-0`}
                        >
                          <Icon size={22} strokeWidth={2.1} />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base sm:text-xl font-semibold font-sans tracking-tight text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                              {game.title}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              O&apos;rta · DTM · SAT
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                            {game.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {game.topics.map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Pill Button */}
                      <div className="relative z-10 shrink-0 w-full sm:w-auto flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveGameId(game.id)}
                          className="group/btn w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span>O&apos;ynash</span>
                          <ArrowUpRight
                            size={15}
                            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── COMPACT UPCOMING MULTIPLAYER STRIP ── */}
            <section className="space-y-3 pt-1">
              <h2 className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Yaqinlashayotgan rejimlar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UPCOMING_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <div
                      key={mode.id}
                      className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl ${mode.iconTile} flex items-center justify-center shrink-0`}>
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {mode.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {mode.desc}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Clock size={11} />
                        Tez kunda
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Unified Arcade Game Modal */}
      <ArcadeGameModal
        gameId={activeGameId}
        onClose={() => {
          setActiveGameId(null);
          refreshHighScores();
          setOptimisticDelta(0);
        }}
        onCoinsEarned={(newCoins) => {
          setOptimisticDelta((prev) => prev + newCoins);
        }}
      />
    </div>
  );
}
