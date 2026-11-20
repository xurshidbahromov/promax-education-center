"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  BrainCircuit,
  Languages,
  Timer,
  Trophy,
  Coins,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Play,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  DIFFICULTY_META,
  gameSfx,
  generateArcadeQuestion,
  getGameHighScore,
  saveGameHighScore,
  type ArcadeQuestion,
  type GameDifficulty,
  type GameId,
} from "@/lib/game-engines";

interface ArcadeGameModalProps {
  gameId: GameId | null;
  onClose: () => void;
  onCoinsEarned: (coins: number) => void;
}

const GAME_CONFIG: Record<
  GameId,
  {
    title: string;
    subtitle: string;
    icon: typeof Zap;
    iconTile: string;
    duration: number;
  }
> = {
  math: {
    title: "Matematika Pro",
    subtitle: "DTM va SAT darajasidagi tezkor misollar",
    icon: Zap,
    iconTile: "bg-amber-500/10 text-amber-500",
    duration: 60,
  },
  logic: {
    title: "Mantiq & IQ Qatorlar",
    subtitle: "Ketma-ketlikdagi yashirin qonuniyatni toping",
    icon: BrainCircuit,
    iconTile: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    duration: 60,
  },
  vocab: {
    title: "Academic Vocab Blitz",
    subtitle: "IELTS va SAT akademik so'zlari hamda sinonimlari",
    icon: Languages,
    iconTile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    duration: 60,
  },
};

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function ArcadeGameModal({
  gameId,
  onClose,
  onCoinsEarned,
}: ArcadeGameModalProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"lobby" | "playing" | "gameover">("lobby");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("dtm");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [question, setQuestion] = useState<ArcadeQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [savingReward, setSavingReward] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const difficultyRef = useRef<GameDifficulty>("dtm");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    correctRef.current = correctCount;
  }, [correctCount]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // Reset when modal opens for a game
  useEffect(() => {
    if (gameId) {
      setPhase("lobby");
      setHighScore(getGameHighScore(gameId));
      setIsNewRecord(false);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    }
  }, [gameId]);

  const toggleSound = () => {
    gameSfx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const finishGame = useCallback(async () => {
    if (!gameId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);

    setPhase("gameover");
    gameSfx.playGameOver();

    const finalScore = scoreRef.current;
    const finalCorrect = correctRef.current;
    const mult = DIFFICULTY_META[difficultyRef.current].coinMultiplier;

    const beatRecord = saveGameHighScore(gameId, finalScore);
    setIsNewRecord(beatRecord);
    if (beatRecord) setHighScore(finalScore);

    // Reward formula: scaled by difficulty multiplier, capped cleanly per 60s session
    const baseCoins = finalCorrect >= 3 ? Math.max(5, Math.floor((finalScore / 22) * mult)) : 0;
    const calculatedCoins = Math.min(baseCoins, 60);
    setEarnedCoins(calculatedCoins);

    if (calculatedCoins > 0) {
      setSavingReward(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("coins")
            .eq("id", user.id)
            .single();

          const updatedCoins = (profile?.coins || 0) + calculatedCoins;
          await supabase
            .from("profiles")
            .update({ coins: updatedCoins })
            .eq("id", user.id);

          onCoinsEarned(calculatedCoins);
          window.dispatchEvent(new CustomEvent("promax_coins_updated"));
        }
      } catch (err) {
        console.warn("Failed to persist arcade coins:", err);
      } finally {
        setSavingReward(false);
      }
    }
  }, [gameId, onCoinsEarned]);

  const startGame = useCallback(() => {
    if (!gameId) return;
    const duration = GAME_CONFIG[gameId].duration;
    setTimeLeft(duration);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    correctRef.current = 0;
    setTotalAnswered(0);
    setSelectedOption(null);
    setFeedback(null);
    setEarnedCoins(0);
    setIsNewRecord(false);
    setQuestion(generateArcadeQuestion(gameId, difficulty));
    setPhase("playing");
  }, [gameId, difficulty]);

  // Countdown timer
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, finishGame]);

  const handleSelectOption = useCallback(
    (option: string) => {
      if (phase !== "playing" || !question || feedback || !gameId) return;

      setSelectedOption(option);
      setTotalAnswered((prev) => prev + 1);

      if (option === question.correctAnswer) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo((prev) => Math.max(prev, newCombo));
        setCorrectCount((prev) => prev + 1);

        const comboMult = newCombo >= 10 ? 3 : newCombo >= 6 ? 2 : newCombo >= 3 ? 1.5 : 1;
        const diffBonus = difficulty === "sat" ? 15 : difficulty === "dtm" ? 12 : 10;
        const gained = Math.round(diffBonus * comboMult);
        setScore((prev) => prev + gained);

        if (newCombo === 3 || newCombo === 6 || newCombo === 10) {
          gameSfx.playCombo();
        } else {
          gameSfx.playCorrect();
        }

        setFeedback("correct");
        nextTimerRef.current = setTimeout(() => {
          setFeedback(null);
          setSelectedOption(null);
          setQuestion(generateArcadeQuestion(gameId, difficulty));
        }, 240);
      } else {
        setCombo(0);
        gameSfx.playWrong();
        setFeedback("wrong");
        // Brief pause on wrong answer so student can see the explanation
        nextTimerRef.current = setTimeout(() => {
          setFeedback(null);
          setSelectedOption(null);
          setQuestion(generateArcadeQuestion(gameId, difficulty));
        }, 1250);
      }
    },
    [phase, question, feedback, gameId, combo, difficulty]
  );

  // Keyboard shortcuts (1-4 to pick options, Esc to close)
  useEffect(() => {
    if (!gameId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (phase === "playing" && question && !feedback) {
        const idx = ["1", "2", "3", "4"].indexOf(e.key);
        if (idx !== -1 && question.options[idx]) {
          handleSelectOption(question.options[idx]);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [gameId, phase, question, feedback, handleSelectOption, onClose]);

  if (!mounted || !gameId) return null;

  const cfg = GAME_CONFIG[gameId];
  const GameIcon = cfg.icon;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const timePct = Math.round((timeLeft / cfg.duration) * 100);

  return createPortal(
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && phase !== "playing") onClose();
        }}
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 36, scale: 0.98 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden text-left text-slate-800 dark:text-white"
        >
          {/* Sticky Header (Shop style) */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 sm:px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-xl ${cfg.iconTile} flex items-center justify-center shrink-0`}>
                  <GameIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight truncate">
                    {cfg.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {phase === "playing" ? DIFFICULTY_META[difficulty].label : cfg.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Ovozni yoqish/o'chirish"
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Yopish"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── PHASE 1: LOBBY ── */}
          {phase === "lobby" && (
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Stats preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Shaxsiy Rekord
                  </span>
                  <p className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {highScore} <span className="text-xs font-bold text-amber-500">ball</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Davomiyligi
                  </span>
                  <p className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {cfg.duration} <span className="text-xs font-bold text-slate-400">soniya</span>
                  </p>
                </div>
              </div>

              {/* Difficulty selector */}
              <div className="space-y-2">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Qiyinlik darajasini tanlang
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["medium", "dtm", "sat"] as GameDifficulty[]).map((level) => {
                    const meta = DIFFICULTY_META[level];
                    const active = difficulty === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                          active
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60 hover:border-amber-400"
                        }`}
                      >
                        <p className="text-xs font-extrabold leading-tight">{meta.short}</p>
                        <p
                          className={`text-[10px] font-bold mt-1 ${
                            active ? "text-amber-100" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {meta.coinMultiplier}x tanga
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {DIFFICULTY_META[difficulty].desc}
                </p>
              </div>

              {/* Tip box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-start gap-2.5 text-xs">
                <Sparkles size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Ketma-ket to&apos;g&apos;ri javoblar <strong className="text-amber-900 dark:text-amber-200">Combo (x1.5, x2, x3)</strong> beradi. Kompyuterda <strong className="text-amber-900 dark:text-amber-200">1–4</strong> tugmalari bilan ham tez javob berish mumkin.
                </p>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="w-full py-3.5 px-5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Play size={16} className="fill-white" />
                <span>O&apos;yinni boshlash</span>
              </button>
            </div>
          )}

          {/* ── PHASE 2: PLAYING ── */}
          {phase === "playing" && question && (
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Top HUD */}
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tabular-nums border ${
                    timeLeft <= 10
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Timer size={14} />
                  <span>{timeLeft}s</span>
                </div>

                <div className="flex items-center gap-2">
                  {combo >= 2 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-extrabold tabular-nums">
                      <Flame size={13} className="text-amber-500" />
                      {combo}x
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-extrabold tabular-nums">
                    <Trophy size={13} />
                    {score}
                  </span>
                </div>
              </div>

              {/* Time progress bar */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    timeLeft <= 10 ? "bg-red-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${timePct}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-center space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {question.topic}
                </span>

                {question.sequence ? (
                  <>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {question.prompt}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {question.sequence.map((item, idx) => (
                        <span
                          key={idx}
                          className={`min-w-[44px] h-11 px-3 rounded-2xl flex items-center justify-center text-base sm:text-lg font-black font-fredoka tabular-nums ${
                            item === "?"
                              ? "bg-amber-500 text-white"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 dark:text-white tracking-tight break-words">
                      {question.prompt}
                    </p>
                    {question.subprompt && (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {question.subprompt}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-2 gap-2.5">
                {question.options.map((opt, idx) => {
                  const isCorrectOpt = opt === question.correctAnswer;
                  const isSelected = selectedOption === opt;
                  let btnStyle =
                    "bg-white dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:border-amber-400 dark:hover:border-amber-500";

                  if (feedback) {
                    if (isCorrectOpt) {
                      btnStyle =
                        "bg-emerald-500 text-white border-emerald-500";
                    } else if (isSelected && !isCorrectOpt) {
                      btnStyle = "bg-red-500 text-white border-red-500";
                    } else {
                      btnStyle =
                        "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={`${opt}-${idx}`}
                      type="button"
                      disabled={Boolean(feedback)}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center shrink-0 ${
                          feedback && (isCorrectOpt || isSelected)
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-300"
                        }`}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-sm font-bold leading-snug break-words flex-1">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Brief learning explanation on mistake */}
              {feedback === "wrong" && question.explanation && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-medium">
                  <XCircle size={15} className="shrink-0" />
                  <span>{question.explanation}</span>
                </div>
              )}
            </div>
          )}

          {/* ── PHASE 3: GAME OVER ── */}
          {phase === "gameover" && (
            <div className="p-6 space-y-5 overflow-y-auto text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <Trophy size={26} />
                </div>
                {isNewRecord && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                    Yangi Rekord!
                  </span>
                )}
                <h4 className="text-xl font-black font-fredoka text-slate-900 dark:text-white">
                  O&apos;yin yakunlandi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {DIFFICULTY_META[difficulty].label} darajasi natijasi
                </p>
              </div>

              {/* Score & Metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Ball</span>
                  <p className="text-xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {score}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">To&apos;g&apos;ri</span>
                  <p className="text-xl font-black font-fredoka text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                    {correctCount}/{totalAnswered}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Aniqlik</span>
                  <p className="text-xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {accuracy}%
                  </p>
                </div>
              </div>

              {/* Earned Coins Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Coins size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {earnedCoins > 0 ? "Yutib olingan mukofot" : "Mukofot uchun kamida 3 ta to'g'ri javob"}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                      {savingReward
                        ? "Balansga qo'shilmoqda..."
                        : maxCombo > 1
                        ? `Maksimal combo: ${maxCombo}x`
                        : "Yana urinib ko'ring!"}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-black font-fredoka text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                  +{earnedCoins}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startGame}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Qayta o&apos;ynash</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
