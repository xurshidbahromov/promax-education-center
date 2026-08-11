"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { getUserProfile } from "@/lib/profile";
import {
  Gamepad2,
  BrainCircuit,
  Calculator,
  Languages,
  Trophy,
  Coins,
  Swords,
  Clock
} from "lucide-react";
import { GamesPageSkeleton } from "@/components/ui/Skeleton";

interface GameCard {
  id: string;
  title: string;
  category: string;
  description: string;
  rewardText: string;
  icon: any;
  gradient: string;
}

export default function GameZonePage() {
  const { t } = useLanguage();
  const { data: profile, isLoading } = useSWR('userProfileGame', getUserProfile);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (profile) {
      setCoins(profile.coins || 0);
    }
  }, [profile]);

  const games: GameCard[] = [
    {
      id: 'math',
      title: "Math Speed Blitz",
      category: "Matematika Blits",
      description: "Chaqmoqdek tezlikdagi aritmetik tenglamalarni yechish va mantiqiy tezlikni oshirish rejimi.",
      rewardText: "+10 Tanga / Savol",
      icon: Calculator,
      gradient: "from-blue-500 via-indigo-600 to-blue-700",
    },
    {
      id: 'word',
      title: "Word Unscramble Arena",
      category: "Ingliz tili",
      description: "Aralashib ketgan inglizcha so'z harflarini tartiblab, lug'at boyligini oshirish rejimi.",
      rewardText: "+10 Tanga / Savol",
      icon: Languages,
      gradient: "from-emerald-500 via-teal-600 to-emerald-700",
    },
    {
      id: 'logic',
      title: "Logic Pattern Match",
      category: "Mantiqiy Ketma-ketlik",
      description: "Sonlar va mantiqiy ketma-ketliklardagi yashiringan qonuniyatni topish intellekt rejimi.",
      rewardText: "+15 Tanga / Savol",
      icon: BrainCircuit,
      gradient: "from-purple-500 via-violet-600 to-purple-700",
    },
    {
      id: '1v1',
      title: "1v1 Duel Arena",
      category: "Jonli Musobaqa",
      description: "Boshqa o'quvchilar bilan real-vaqtda jonli efirda intellektual duelda bellashuv.",
      rewardText: "Duel Sovrini: 500 Tanga",
      icon: Swords,
      gradient: "from-amber-500 via-orange-600 to-red-600",
    },
    {
      id: 'team',
      title: "Team War League",
      category: "Guruhlar Jangi",
      description: "Guruhdoshlar bilan birlashib, haftalik turnirlarda boshqa guruhlarga qarshi jang.",
      rewardText: "Liga Sovrini: 2000 Tanga",
      icon: Gamepad2,
      gradient: "from-rose-500 via-pink-600 to-purple-700",
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Standard Ambient background matching all dashboard subpages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-[1400px] mx-auto pt-4 sm:pt-6">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Promax Interactive Arcade Arena
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {t('games.title') || "O'yin maydoni"}
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
                {coins} <span className="text-xs font-bold text-amber-500">tanga</span>
              </span>
            </div>
          </div>
        </div>

        {/* LOADING STATE OR STATIC ARCADE CARDS */}
        {isLoading ? (
          <GamesPageSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.id}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between text-left relative overflow-hidden active:scale-[0.99] transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-white shadow-md shadow-slate-200/50 dark:shadow-none shrink-0`}>
                        <Icon size={26} />
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider">
                        {game.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-fredoka">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Coins size={14} />
                      {game.rewardText}
                    </span>

                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Clock size={13} />
                      <span>Tez kunda</span>
                    </span>
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
