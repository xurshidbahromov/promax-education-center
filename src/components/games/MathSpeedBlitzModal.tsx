"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Timer,
  Trophy,
  Coins,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MathSpeedBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsEarned: (coins: number) => void;
}

interface Question {
  text: string;
  options: number[];
  correctAnswer: number;
}

// Lightweight Web Audio API Synthesizer (No external sound files required)
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playCorrect() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  playWrong() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  playCombo() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.05;
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.11);
      });
    } catch {}
  }

  playGameOver() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }
}

const sfx = new SoundFx();

function generateQuestion(level: number): Question {
  let a: number, b: number, op: string, answer: number;

  if (level < 4) {
    // Level 1: Simple Addition & Subtraction (1..25)
    op = Math.random() > 0.5 ? "+" : "-";
    if (op === "+") {
      a = Math.floor(Math.random() * 25) + 1;
      b = Math.floor(Math.random() * 25) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
    }
  } else if (level < 9) {
    // Level 2: Multiplication tables & Division
    op = Math.random() > 0.4 ? "×" : "÷";
    if (op === "×") {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      answer = a * b;
    } else {
      b = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 2;
      a = b * answer;
    }
  } else {
    // Level 3: Faster multi-digit arithmetic or mixed operations
    const opType = Math.random();
    if (opType < 0.35) {
      a = Math.floor(Math.random() * 12) + 3;
      b = Math.floor(Math.random() * 12) + 3;
      op = "×";
      answer = a * b;
    } else if (opType < 0.7) {
      a = Math.floor(Math.random() * 70) + 30;
      b = Math.floor(Math.random() * 50) + 10;
      op = "+";
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 90) + 20;
      b = Math.floor(Math.random() * 40) + 10;
      op = "-";
      answer = a - b;
    }
  }

  // Generate 3 unique plausible distractors
  const optionsSet = new Set<number>([answer]);
  const offsets = [-10, 10, -1, 1, -2, 2, -5, 5, -3, 3];
  
  while (optionsSet.size < 4) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const distractor = answer + offset;
    if (distractor > 0 && distractor !== answer) {
      optionsSet.add(distractor);
    } else {
      optionsSet.add(Math.max(1, answer + Math.floor(Math.random() * 15) - 7));
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    text: `${a} ${op} ${b}`,
    correctAnswer: answer,
    options,
  };
}

export default function MathSpeedBlitzModal({
  isOpen,
  onClose,
  onCoinsEarned,
}: MathSpeedBlitzModalProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [savingReward, setSavingReward] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const toggleSound = () => {
    sfx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Start game
  const startGame = useCallback(() => {
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setFeedback(null);
    setEarnedCoins(0);
    setCurrentQuestion(generateQuestion(1));
    setGameState("playing");
  }, []);

  // End game and calculate reward
  const endGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("gameover");
    sfx.playGameOver();

    // Calculate coins: 1 coin per 25 pts + min 5 coins if correctCount >= 3
    const calculatedCoins = Math.max(
      correctCount >= 3 ? 5 : 0,
      Math.floor(score / 25)
    );
    setEarnedCoins(calculatedCoins);

    if (calculatedCoins > 0) {
      setSavingReward(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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
        console.warn("Failed to persist game coins:", err);
      } finally {
        setSavingReward(false);
      }
    }
  }, [score, correctCount, onCoinsEarned]);

  // Timer loop
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, endGame]);

  // Answer handler
  const handleSelectOption = (selected: number) => {
    if (gameState !== "playing" || !currentQuestion || feedback) return;

    if (selected === currentQuestion.correctAnswer) {
      // Correct!
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setCorrectCount((prev) => prev + 1);

      // Multiplier: 1x, 1.5x at 3, 2x at 6, 3x at 10+
      const multiplier = newCombo >= 10 ? 3 : newCombo >= 6 ? 2 : newCombo >= 3 ? 1.5 : 1;
      const pointsGained = Math.round(10 * multiplier);
      setScore((prev) => prev + pointsGained);

      if (newCombo === 3 || newCombo === 6 || newCombo === 10) {
        sfx.playCombo();
      } else {
        sfx.playCorrect();
      }

      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestion(generateQuestion(correctCount + 1));
      }, 200);
    } else {
      // Wrong!
      sfx.playWrong();
      setCombo(0);
      setFeedback("wrong");
      // Penalty of -2 seconds
      setTimeLeft((prev) => Math.max(0, prev - 2));

      setTimeout(() => {
        setFeedback(null);
        setCurrentQuestion(generateQuestion(Math.max(1, correctCount)));
      }, 350);
    }
  };

  // Keyboard navigation (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing" || !currentQuestion) return;
      const keyMap: Record<string, number> = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "Numpad1": 0,
        "Numpad2": 1,
        "Numpad3": 2,
        "Numpad4": 3,
      };
      if (keyMap[e.key] !== undefined || keyMap[e.code] !== undefined) {
        const index = keyMap[e.key] !== undefined ? keyMap[e.key] : keyMap[e.code];
        if (currentQuestion.options[index] !== undefined) {
          handleSelectOption(currentQuestion.options[index]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentQuestion, feedback]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.25rem] p-6 sm:p-8 border border-white/80 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-white"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <Zap size={22} className="fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                Math Speed Blitz
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                60 soniyalik tezkor hisob-kitob
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── STATE 1: IDLE / RULES SCREEN ── */}
        {gameState === "idle" && (
          <div className="py-8 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30">
                <Zap size={44} className="fill-white animate-bounce" />
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Blitz
              </span>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                Tayyormisiz?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                60 soniya ichida imkon qadar ko'p arifmetik amallarni to'g'ri yeching. Ketma-ket to'g'ri javoblar uchun <strong>Combo x3</strong> gacha bonus va <strong>tangalar</strong> yutib oling!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-xs text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase">Vaqt</p>
                <p className="text-base font-black font-fredoka text-slate-800 dark:text-white">60 soniya</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase">Combo</p>
                <p className="text-base font-black font-fredoka text-amber-500">x3 gacha</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase">Sovrin</p>
                <p className="text-base font-black font-fredoka text-emerald-500">+tangalar</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={20} className="fill-white" />
              <span>O'yinni boshlash!</span>
            </button>
          </div>
        )}

        {/* ── STATE 2: PLAYING SCREEN ── */}
        {gameState === "playing" && (
          <div className="pt-5 pb-2 space-y-6">
            {/* Live Stats Bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Timer */}
              <div className={`p-2.5 rounded-2xl border transition-all ${
                timeLeft <= 10
                  ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white"
              }`}>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Timer size={13} />
                  <span>Vaqt</span>
                </div>
                <p className="text-xl font-black font-fredoka mt-0.5">{timeLeft}s</p>
              </div>

              {/* Score */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-slate-400">
                  <Trophy size={13} className="text-amber-500" />
                  <span>Ball</span>
                </div>
                <p className="text-xl font-black font-fredoka text-amber-500 mt-0.5">{score}</p>
              </div>

              {/* Combo Multiplier */}
              <div className={`p-2.5 rounded-2xl border transition-all ${
                combo >= 3
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400"
              }`}>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase">
                  <Flame size={13} className={combo >= 3 ? "text-orange-500 fill-orange-500" : ""} />
                  <span>Combo</span>
                </div>
                <p className="text-xl font-black font-fredoka mt-0.5">
                  {combo >= 10 ? "x3.0" : combo >= 6 ? "x2.0" : combo >= 3 ? "x1.5" : "x1.0"}
                </p>
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <motion.div
                key={currentQuestion.text}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`py-8 px-4 rounded-3xl border text-center transition-colors relative overflow-hidden ${
                  feedback === "correct"
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : feedback === "wrong"
                    ? "bg-red-500/10 border-red-500/40"
                    : "bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/20 border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {/* Feedback Indicator */}
                {feedback === "correct" && (
                  <span className="absolute top-2 right-3 text-emerald-500 font-bold text-xs flex items-center gap-1 animate-bounce">
                    <CheckCircle2 size={16} /> To'g'ri!
                  </span>
                )}
                {feedback === "wrong" && (
                  <span className="absolute top-2 right-3 text-red-500 font-bold text-xs flex items-center gap-1 animate-bounce">
                    <AlertCircle size={16} /> Noto'g'ri (-2s)
                  </span>
                )}

                <div className="text-4xl sm:text-5xl font-black font-fredoka text-slate-900 dark:text-white tracking-wide">
                  {currentQuestion.text} = ?
                </div>
              </motion.div>
            )}

            {/* Answer Options Grid (4 options with keyboard shortcut hints) */}
            {currentQuestion && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, index) => {
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className="py-4 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 font-fredoka text-2xl font-bold transition-all active:scale-95 shadow-sm relative group cursor-pointer"
                    >
                      <span className="absolute top-2 left-3 text-[10px] font-sans font-bold text-slate-400 group-hover:text-white/80">
                        [{index + 1}]
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STATE 3: GAME OVER SCREEN ── */}
        {gameState === "gameover" && (
          <div className="py-6 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Trophy size={42} className="fill-white" />
              </div>
              <Sparkles size={24} className="absolute -top-1 -right-2 text-amber-400 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-fredoka text-slate-900 dark:text-white">
                Vaqt tugadi!
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Blitz o'yini muvaffaqiyatli yakunlandi
              </p>
            </div>

            {/* Coin Award Showcase */}
            <div className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 border border-amber-500/25 rounded-3xl p-5 text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                Yutilgan mukofot
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Coins size={28} className="text-amber-500" />
                <span className="text-3xl font-black font-fredoka text-slate-900 dark:text-white">
                  +{earnedCoins}
                </span>
                <span className="text-sm font-bold text-amber-500">tanga</span>
              </div>
              {savingReward && (
                <p className="text-[11px] text-slate-400 mt-1">Tangalar balansingizga saqlanmoqda...</p>
              )}
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-3 gap-3 w-full text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold uppercase">To'plangan ball</p>
                <p className="text-lg font-black font-fredoka text-slate-800 dark:text-white">{score}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold uppercase">To'g'ri javob</p>
                <p className="text-lg font-black font-fredoka text-emerald-500">{correctCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-bold uppercase">Maksimal Combo</p>
                <p className="text-lg font-black font-fredoka text-orange-500">{maxCombo}x</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={startGame}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm transition-all active:scale-95 shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Qaytadan o'ynash</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all active:scale-95 cursor-pointer"
              >
                Chiqish
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
