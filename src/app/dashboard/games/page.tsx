"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import {
    Gamepad2,
    BrainCircuit,
    Calculator,
    Languages,
    Trophy,
    Play,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameZonePage() {
    const { t } = useLanguage();
    const [coins, setCoins] = useState(1250); // Initial coins (mock)
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState({ q: "", a: 0 });
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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

    const endGame = () => {
        setCoins(c => c + score);
        setGameState('end');
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
        <div className="space-y-8 min-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Gamepad2 className="text-brand-blue" size={32} />
                        {t('games.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('games.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-brand-orange/10 px-4 py-2 rounded-2xl border border-brand-orange/20 text-brand-orange font-bold text-xl shadow-sm">
                    <Trophy size={24} className="fill-brand-orange" />
                    <span>{coins}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <motion.div
                        key={game.id}
                        whileHover={{ y: -5 }}
                        className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-lg group cursor-pointer"
                        onClick={() => game.available && startGame(game.id)}
                    >
                        {/* Background Splat */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />

                        <div className="p-8 relative z-10 flex flex-col items-center text-center h-full">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-200 dark:shadow-none`}>
                                <game.icon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{game.description}</p>

                            <div className="mt-auto">
                                {game.available ? (
                                    <button className={`px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r ${game.color} shadow-md hover:shadow-lg transition-all flex items-center gap-2`}>
                                        <Play size={16} className="fill-white" /> Play Now
                                    </button>
                                ) : (
                                    <span className="px-4 py-1 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-full text-xs font-semibold uppercase tracking-wider">
                                        Coming Soon
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800 relative overflow-hidden"
                        >
                            {/* Confetti / Decoration (Simplified) */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-brand-orange" />

                            <button
                                onClick={closeGame}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {gameState === 'playing' && activeGame === 'math' && (
                                <div className="text-center py-8">
                                    <div className="mb-2 text-sm text-gray-400 font-medium tracking-widest uppercase">Question</div>
                                    <div className="text-5xl font-black text-gray-900 dark:text-white mb-8 font-mono tracking-wider">
                                        {question.q.replace('*', '×')}
                                    </div>

                                    <form onSubmit={handleAnswerSubmit} className="relative max-w-[200px] mx-auto">
                                        <input
                                            type="number"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            autoFocus
                                            className="w-full text-center text-3xl font-bold py-3 bg-gray-50 dark:bg-slate-800 border-2 border-brand-blue rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/20 transition-all text-gray-900 dark:text-white"
                                            placeholder="?"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </form>

                                    {/* Feedback Area */}
                                    <div className="h-8 mt-4">
                                        {feedback === 'correct' && (
                                            <motion.span
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-green-500 font-bold flex items-center justify-center gap-2"
                                            >
                                                Correct! +10 Coins <Trophy size={16} />
                                            </motion.span>
                                        )}
                                        {feedback === 'wrong' && (
                                            <motion.span
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-500 font-bold flex items-center justify-center gap-2"
                                            >
                                                Try Again! <AlertCircle size={16} />
                                            </motion.span>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={endGame}
                                            className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                                        >
                                            End Game
                                        </button>
                                    </div>
                                </div>
                            )}

                            {gameState === 'end' && (
                                <div className="text-center py-8">
                                    <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Trophy size={48} className="text-yellow-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Game Over!</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">You earned</p>
                                    <div className="text-5xl font-black text-brand-orange mb-8 flex items-center justify-center gap-2">
                                        +{score} <span className="text-2xl">Coins</span>
                                    </div>
                                    <button
                                        onClick={closeGame}
                                        className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                                    >
                                        Awesome!
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
