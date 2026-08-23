"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { getUserProfile } from "@/lib/profile";
import {
  Gamepad2,
  BrainCircuit,
  Zap,
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
  iconColor: string;
  iconBg: string;
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
      icon: Zap,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/25",
    },
    {
      id: 'word',
      title: "Word Unscramble Arena",
      category: "Ingliz tili",
      description: "Aralashib ketgan inglizcha so'z harflarini tartiblab, lug'at boyligini oshirish rejimi.",
      rewardText: "+10 Tanga / Savol",
      icon: Languages,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/25",
    },
    {
      id: 'logic',
      title: "Logic Pattern Match",
      category: "Mantiqiy Ketma-ketlik",
      description: "Sonlar va mantiqiy ketma-ketliklardagi yashiringan qonuniyatni topish intellekt rejimi.",
      rewardText: "+15 Tanga / Savol",
      icon: BrainCircuit,
      iconColor: "text-purple-500 dark:text-purple-400",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/25",
    },
    {
      id: '1v1',
      title: "1v1 Duel Arena",
      category: "Jonli Musobaqa",
      description: "Boshqa o'quvchilar bilan real-vaqtda jonli efirda intellektual duelda bellashuv.",
      rewardText: "Duel Sovrini: 500 Tanga",
      icon: Swords,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/25",
    },
    {
      id: 'team',
      title: "Team War League",
      category: "Guruhlar Jangi",
      description: "Guruhdoshlar bilan birlashib, haftalik turnirlarda boshqa guruhlarga qarshi jang.",
      rewardText: "Liga Sovrini: 2000 Tanga",
      icon: Trophy,
      iconColor: "text-blue-500 dark:text-blue-400",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/25",
    }
  ];

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-4">
      {/* Standard Ambient background matching all dashboard subpages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-[1400px] mx-auto pt-1 sm:pt-2">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-left">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              Promax Interactive Arcade Arena
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
              {t('games.title') || "O'yin maydoni"}
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
                  className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] p-6 shadow-none flex flex-col justify-between text-left relative overflow-hidden active:scale-[0.99] transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${game.iconBg} border flex items-center justify-center ${game.iconColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <Icon size={24} strokeWidth={2.2} />
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
