"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/profile";
import { updateUserCoins } from "@/lib/supabase-queries";
import {
  Gamepad2,
  BrainCircuit,
  Calculator,
  Languages,
  Trophy,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameZonePage() {
 const { t } = useLanguage();
 // Start with 0 until loaded
 const [coins, setCoins] = useState(0);
 const [userId, setUserId] = useState<string | null>(null);
 const [activeGame, setActiveGame] = useState<string | null>(null);
 const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
 const [score, setScore] = useState(0);
 const [question, setQuestion] = useState({ q: "", a: 0 });
 const [userAnswer, setUserAnswer] = useState("");
 const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

 // Load user coins on mount
 useEffect(() => {
 const loadUserData = async () => {
 const profile = await getUserProfile();
 if (profile) {
 setCoins(profile.coins || 0);
 setUserId(profile.id);
 }
 };
 loadUserData();
 }, []);

 // Math Game Logic
 const generateMathQuestion = () => {
 const operators = ['+', '-', '*'];
 const operator = operators[Math.floor(Math.random() * operators.length)];
 let num1 = Math.floor(Math.random() * 20) + 1;
 let num2 = Math.floor(Math.random() * 20) + 1;

 if (operator === '-') {
 if (num1 < num2) [num1, num2] = [num2, num1]; // Ensure positive result
 }

 let answer = 0;
 switch (operator) {
 case '+': answer = num1 + num2; break;
 case '-': answer = num1 - num2; break;
 case '*': answer = num1 * num2; break;
 }

 setQuestion({ q: `${num1} ${operator} ${num2} = ?`, a: answer });
 setUserAnswer("");
 setFeedback(null);
 };

 const handleAnswerSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 const numAns = parseInt(userAnswer);
 if (isNaN(numAns)) return;

 if (numAns === question.a) {
 setFeedback('correct');
 setScore(s => s + 10);
 setTimeout(() => {
 generateMathQuestion();
 }, 1000);
 } else {
 setFeedback('wrong');
 }
 };

 const startGame = (gameType: string) => {
 setActiveGame(gameType);
 setGameState('playing');
 setScore(0);
 if (gameType === 'math') generateMathQuestion();
 };

 const endGame = async () => {
 // Optimistic update
 const earned = score;
 setCoins(c => c + earned);
 setGameState('end');

 // Persist to DB
 if (userId && earned > 0) {
 await updateUserCoins(userId, earned);
 }
 };

 const closeGame = () => {
 setActiveGame(null);
 setGameState('start');
 };

 const games = [
 {
 id: 'math',
 title: "Math Challenge",
 description: "Solve arithmetic problems quickly to earn coins!",
 icon: Calculator,
 color: "from-blue-500 to-indigo-600",
 available: false
 },
 {
 id: 'word',
 title: "Word Scramble",
 description: "Unscramble English words. Great for vocabulary!",
 icon: Languages,
 color: "from-green-500 to-emerald-600",
 available: false
 },
 {
 id: 'logic',
 title: "Logic Puzzle",
 description: "Test your critical thinking and pattern recognition.",
 icon: BrainCircuit,
 color: "from-purple-500 to-pink-600",
 available: false
 },
 {
 id: '1v1',
 title: "1v1 Battle",
 description: "Challenge a friend in a real-time math duel!",
 icon: Trophy,
 color: "from-red-500 to-orange-600",
 available: false
 },
 {
 id: 'team',
 title: "Team War",
 description: "Join forces and compete against other teams.",
 icon: Gamepad2,
 color: "from-indigo-600 to-blue-800",
 available: false
 }
 ];

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-[1600px] mx-auto pt-4 sm:pt-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
            {t('games.subtitle') || "Bilimingizni sinab ko'ring va tangalar ishlang"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight uppercase flex items-center gap-3">
            <span>{t('games.title') || "O'yin maydoni"}</span>
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 px-3 py-1.5 rounded-xl border border-amber-500/25 dark:border-amber-500/15 shadow-sm text-amber-600 dark:text-amber-400 font-bold text-base leading-none">
              <Coins size={16} className="text-amber-500 dark:text-amber-400 animate-pulse" />
              <span>{coins}</span>
            </div>
          </h1>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ y: -5 }}
              className="relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-lg group cursor-pointer transition-all duration-300"
              onClick={() => game.available && startGame(game.id)}
            >
              {/* Background Splat */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${game.color} opacity-[0.08] dark:opacity-[0.12] rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />

              <div className="p-8 relative z-10 flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-6 shadow-md shadow-gray-200/50 dark:shadow-none group-hover:scale-110 transition-transform duration-300`}>
                  <game.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-fredoka tracking-wide">{game.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">{game.description}</p>

                <div className="mt-auto">
                  {game.available ? (
                    <button className={`px-6 py-2.5 rounded-[12px] font-bold text-[13px] text-white bg-gradient-to-r ${game.color} shadow-sm hover:shadow-md transition-all flex items-center gap-2`}>
                      <Play size={16} className="fill-white" /> O'YNASH
                    </button>
                  ) : (
                    <span className="px-4 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider border border-gray-200/50 dark:border-slate-700/50">
                      Tez kunda
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game Modal */}
        <AnimatePresence>
          {activeGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl w-full max-w-md rounded-[2rem] p-8 shadow-2xl border border-white/60 dark:border-slate-700/50 relative overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

                <button
                  onClick={closeGame}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                {gameState === 'playing' && activeGame === 'math' && (
                  <div className="text-center py-6">
                    <div className="mb-3 text-[11px] text-slate-400 font-bold tracking-widest uppercase">
                      Savolni yeching
                    </div>
                    <div className="text-5xl font-black text-slate-800 dark:text-white mb-8 font-fredoka tracking-wider drop-shadow-sm">
                      {question.q.replace('*', '×')}
                    </div>

                    <form onSubmit={handleAnswerSubmit} className="relative max-w-[200px] mx-auto">
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        autoFocus
                        className="w-full text-center text-3xl font-bold py-3 bg-white dark:bg-slate-800 border-2 border-brand-blue/30 focus:border-brand-blue rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all text-slate-800 dark:text-slate-100 shadow-sm"
                        placeholder="?"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={22} />
                      </button>
                    </form>

                    {/* Feedback Area */}
                    <div className="h-10 mt-6 flex items-center justify-center">
                      {feedback === 'correct' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl"
                        >
                          To'g'ri! +10 Tanga <Trophy size={18} />
                        </motion.div>
                      )}
                      {feedback === 'wrong' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl"
                        >
                          Xato qildingiz! <AlertCircle size={18} />
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={endGame}
                        className="text-slate-400 hover:text-red-500 text-sm font-bold transition-colors"
                      >
                        O'yinni yakunlash
                      </button>
                    </div>
                  </div>
                )}

                {gameState === 'end' && (
                  <div className="text-center py-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/20 rotate-3">
                      <Trophy size={48} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold font-fredoka text-slate-800 dark:text-white mb-2">O'yin tugadi!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Sizning yutug'ingiz</p>
                    <div className="text-5xl font-black text-brand-orange mb-8 flex items-center justify-center gap-2">
                      +{score} <span className="text-xl text-slate-400 mt-2 tracking-wide font-bold uppercase">tanga</span>
                    </div>
                    <button
                      onClick={closeGame}
                      className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-blue-600 text-white rounded-xl font-bold text-[15px] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      Ajoyib!
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
