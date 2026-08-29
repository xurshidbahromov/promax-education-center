"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Save, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AdminTournament } from "@/lib/admin-queries";
import TournamentSchedulePicker from "@/components/admin/TournamentSchedulePicker";

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament?: AdminTournament | null;
  onSave: (tournament: Partial<AdminTournament>) => void;
}

const SUBJECT_OPTIONS = [
  "Matematika",
  "Fizika",
  "Ona Tili",
  "Ingliz Tili",
  "Tarix",
  "Biologiya",
  "Kimyo",
  "Huquq",
  "Dasturlash & IT",
  "Mantiqiy Fikrlash"
];

export default function TournamentModal({
  isOpen,
  onClose,
  tournament,
  onSave
}: TournamentModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("15:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(60);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [entryCoins, setEntryCoins] = useState(50);
  const [prizePool, setPrizePool] = useState("");
  const [topPrizesText, setTopPrizesText] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [status, setStatus] = useState<"upcoming" | "live" | "finished">("upcoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tournament) {
      setTitle(tournament.title || "");
      setSubject(tournament.subject || "Matematika");
      setDescription(tournament.description || "");
      setStartDate(tournament.startDate || new Date().toISOString().split("T")[0]);
      setStartTime(tournament.startTime || "15:00");
      setEndDate(tournament.endDate || tournament.startDate || new Date().toISOString().split("T")[0]);
      setEndTime(tournament.endTime || "18:00");
      setDurationMinutes(tournament.durationMinutes || 60);
      setTotalQuestions(tournament.totalQuestions || 30);
      setEntryCoins(tournament.entryCoins || 50);
      setPrizePool(tournament.prizePool || "");
      setTopPrizesText((tournament.topPrizes || []).join("\n"));
      setRulesText((tournament.rules || []).join("\n"));
      setStatus(tournament.status || "upcoming");
    } else {
      const today = new Date().toISOString().split("T")[0];
      setTitle("");
      setSubject("Matematika");
      setDescription("");
      setStartDate(today);
      setStartTime("16:00");
      setEndDate(today);
      setEndTime("20:00");
      setDurationMinutes(60);
      setTotalQuestions(30);
      setEntryCoins(50);
      setPrizePool("1,000,000 SO'M");
      setTopPrizesText(
        "🥇 1-O'rin: 600,000 So'm + Maxsus Sertifikat\n🥈 2-O'rin: 300,000 So'm\n🥉 3-O'rin: 100,000 So'm"
      );
      setRulesText(
        "Test davomiyligi 60 daqiqa, jami 30 ta savol.\nHar bir to'g'ri javob uchun 3.1 ball beriladi.\nVaqt tugaganda test avtomatik yakunlanadi."
      );
      setStatus("upcoming");
    }
    setError("");
  }, [tournament, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Iltimos, musobaqa nomini kiriting!");
      return;
    }
    if (!startDate.trim()) {
      setError("Iltimos, boshlanish sanasini kiriting!");
      return;
    }

    setLoading(true);

    const topPrizes = topPrizesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const rules = rulesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: Partial<AdminTournament> = {
      id: tournament?.id || `tournament_${Date.now()}`,
      title: title.trim(),
      subject,
      description: description.trim(),
      startDate: startDate.trim(),
      startTime: startTime.trim(),
      endDate: endDate.trim(),
      endTime: endTime.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      totalQuestions: Number(totalQuestions) || 30,
      entryCoins: Number(entryCoins) || 0,
      prizePool: prizePool.trim() || "Foydali Sovg'alar",
      topPrizes: topPrizes.length > 0 ? topPrizes : ["Top o'rinlar uchun mukofotlar"],
      rules: rules.length > 0 ? rules : ["Musobaqa qoidalariga rioya qiling."],
      status,
      participantsCount: tournament?.participantsCount || 0
    };

    onSave(payload);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/60 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black font-fredoka text-slate-800 dark:text-slate-100">
                {tournament ? t("admin.tournaments.edit") || "Musobaqani Tahrirlash" : t("admin.tournaments.create") || "Yangi Musobaqa Qo'shish"}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {t("admin.tournaments.subtitle") || "Musobaqa ma'lumotlari va qoidalarini belgilang"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-center gap-3 text-xs font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("admin.tournaments.form.title") || "Musobaqa Sarlavhasi"} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Respublika Matematika Pro Musobaqasi 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
              required
            />
          </div>

          {/* Subject & Coins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("admin.tournaments.form.subject") || "Fan"}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("admin.tournaments.form.coins") || "Qatnashish Narxi (Tanga)"}
              </label>
              <input
                type="number"
                value={entryCoins}
                onChange={(e) => setEntryCoins(Number(e.target.value))}
                placeholder="0 (Bepul bo'lsa 0 qoldiring)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
                min={0}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("admin.tournaments.form.description") || "Qisqacha Tavsif"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Musobaqa maqsadi, kimlar uchun mo'ljallangani haqida qisqacha yozing..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
            />
          </div>

          {/* ── SCHEDULE PICKER ── */}
          <TournamentSchedulePicker
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endDate={endDate}
            setEndDate={setEndDate}
            endTime={endTime}
            setEndTime={setEndTime}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
          />

          {/* Prize Pool & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("admin.tournaments.form.prizePool") || "Mukofot Jamg'armasi"}
              </label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="Masalan: 1,500,000 SO'M + Planshet"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t("admin.tournaments.form.status") || "Holati"}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-brand-blue"
              >
                <option value="upcoming">
                  {t("admin.tournaments.filter.upcoming") || "Kutilmoqda"}
                </option>
                <option value="live">
                  {t("admin.tournaments.filter.live") || "Faol"}
                </option>
                <option value="finished">
                  {t("admin.tournaments.filter.finished") || "Yakunlangan"}
                </option>
              </select>
            </div>
          </div>

          {/* Top Prizes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("admin.tournaments.form.topPrizes") || "G'oliblar Sovg'alari (har bir qatorda bittadan)"}
            </label>
            <textarea
              value={topPrizesText}
              onChange={(e) => setTopPrizesText(e.target.value)}
              rows={3}
              placeholder="🥇 1-O'rin: 1,000,000 So'm + Oltin Medal&#10;🥈 2-O'rin: 300,000 So'm&#10;🥉 3-O'rin: 100,000 So'm"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-brand-blue font-mono"
            />
          </div>

          {/* Rules Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t("admin.tournaments.form.rules") || "Musobaqa Nizomi & Qoidalari (har bir qatorda bittadan)"}
            </label>
            <textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              rows={3}
              placeholder="Test vaqti 60 daqiqa, jami 30 ta savol.&#10;Har bir to'g'ri javob uchun 3.1 ball beriladi.&#10;Kalkulyatordan foydalanish taqiqlanadi."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-brand-blue font-mono"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
            >
              {t("olympiad.close") || "Bekor qilish"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-brand-blue/10"
            >
              <Save size={15} />
              <span>
                {tournament
                  ? t("admin.tournaments.modal.edit_title") || "O'zgarishlarni Saqlash"
                  : t("admin.tournaments.modal.create_title") || "Musobaqani Yaratish"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
