"use client";

import { useState, useEffect } from "react";
import { X, Globe, Save, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { InternationalTournament } from "@/lib/international-tournaments";
import TournamentSchedulePicker from "@/components/admin/TournamentSchedulePicker";

interface InternationalTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament?: InternationalTournament | null;
  onSave: (tournament: Partial<InternationalTournament>) => void;
}

const CATEGORY_OPTIONS: { value: InternationalTournament["category"]; label: string; defaultScale: string }[] = [
  { value: "sat", label: "Digital SAT (1600 Shkalasi)", defaultScale: "1600 Ballik SAT Shkalasi" },
  { value: "amc", label: "AMC Matematika (150 Shkalasi)", defaultScale: "150 Ballik AMC Shkalasi" },
  { value: "ielts", label: "IELTS Arena (9.0 Band)", defaultScale: "9.0 IELTS Band Shkalasi" },
  { value: "stem", label: "STEM & Science Arena", defaultScale: "100 Ballik Shkala" },
  { value: "general", label: "Umumiy Xalqaro Musobaqa", defaultScale: "100 Ballik Shkala" },
];

export default function InternationalTournamentModal({
  isOpen,
  onClose,
  tournament,
  onSave,
}: InternationalTournamentModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<InternationalTournament["category"]>("sat");
  const [subject, setSubject] = useState("SAT Math & Reading");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("15:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(60);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [entryCoins, setEntryCoins] = useState(100);
  const [prizePool, setPrizePool] = useState("");
  const [scoringScale, setScoringScale] = useState("1600 Ballik SAT Shkalasi");
  const [topPrizesText, setTopPrizesText] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [status, setStatus] = useState<"upcoming" | "live" | "finished">("upcoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tournament) {
      setTitle(tournament.title || "");
      setCategory(tournament.category || "sat");
      setSubject(tournament.subject || "SAT Math & Reading");
      setDescription(tournament.description || "");
      setStartDate(tournament.startDate || new Date().toISOString().split("T")[0]);
      setStartTime(tournament.startTime || "15:00");
      setEndDate(tournament.endDate || tournament.startDate || new Date().toISOString().split("T")[0]);
      setEndTime(tournament.endTime || "18:00");
      setDurationMinutes(tournament.durationMinutes || 60);
      setTotalQuestions(tournament.totalQuestions || 30);
      setEntryCoins(tournament.entryCoins || 100);
      setPrizePool(tournament.prizePool || "");
      setScoringScale(tournament.scoringScale || "1600 Ballik SAT Shkalasi");
      setTopPrizesText((tournament.topPrizes || []).join("\n"));
      setRulesText((tournament.rules || []).join("\n"));
      setStatus(tournament.status || "upcoming");
    } else {
      // Reset defaults for new international tournament
      const today = new Date().toISOString().split("T")[0];
      setTitle("");
      setCategory("sat");
      setSubject("SAT Math & Reading");
      setDescription("Digital SAT formati bo'yicha xalqaro onlayn olimpiada.");
      setStartDate(today);
      setStartTime("16:00");
      setEndDate(today);
      setEndTime("20:00");
      setDurationMinutes(70);
      setTotalQuestions(30);
      setEntryCoins(150);
      setPrizePool("2,000,000 SO'M + Ivy League SAT Kursi");
      setScoringScale("1600 Ballik SAT Shkalasi");
      setTopPrizesText(
        "🥇 1-O'rin: 1,000,000 So'm + Ivy League SAT Kursi\n🥈 2-O'rin: 600,000 So'm + Cambridge SAT Kitobi\n🥉 3-O'rin: 400,000 So'm + Sertifikat"
      );
      setRulesText(
        "Multiple choice va Grid-In (yopiq) savollar to'liq avtomatik tekshiriladi.\nTest davomiyligi 70 daqiqa.\nVaqt tugaganda test avtomatik topshiriladi."
      );
      setStatus("upcoming");
    }
    setError("");
  }, [tournament, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: InternationalTournament["category"]) => {
    setCategory(newCat);
    const catObj = CATEGORY_OPTIONS.find(c => c.value === newCat);
    if (catObj) {
      setScoringScale(catObj.defaultScale);
      if (newCat === "sat") setSubject("SAT Math & Reading");
      else if (newCat === "amc") setSubject("AMC Mathematics");
      else if (newCat === "ielts") setSubject("IELTS English Language");
      else setSubject("Xalqaro Fan");
    }
  };

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
      .map((p) => p.trim())
      .filter(Boolean);

    const rules = rulesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const payload: Partial<InternationalTournament> = {
      ...(tournament?.id ? { id: tournament.id } : {}),
      title: title.trim(),
      category,
      categoryLabel: category === "sat" ? "SAT Digital" : category === "amc" ? "AMC Math" : category === "ielts" ? "IELTS Arena" : "Xalqaro",
      subject: subject.trim(),
      description: description.trim(),
      startDate: startDate.trim(),
      startTime: startTime.trim(),
      endDate: endDate.trim(),
      endTime: endTime.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      totalQuestions: Number(totalQuestions) || 30,
      entryCoins: Number(entryCoins) || 0,
      prizePool: prizePool.trim(),
      scoringScale: scoringScale.trim(),
      topPrizes: topPrizes.length > 0 ? topPrizes : ["🥇 1-O'rin: Xalqaro Grant"],
      rules: rules.length > 0 ? rules : ["Belgilangan vaqt ichida testni topshiring."],
      status,
    };

    onSave(payload);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Globe size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {tournament ? "Musobaqani Tahrirlash" : "Yangi Xalqaro Musobaqa"}
              </h3>
              <p className="text-xs text-slate-500">
                Digital SAT, AMC, IELTS va xalqaro bellashuvlar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Musobaqa Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Digital SAT Grand League (Math & EBRW 1600)"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
              required
            />
          </div>

          {/* Category & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Xalqaro Format / Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Fan / Yo'nalish
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="SAT Math & Reading"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Scoring Scale */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Baholash Shkalasi
            </label>
            <input
              type="text"
              value={scoringScale}
              onChange={(e) => setScoringScale(e.target.value)}
              placeholder="Masalan: 1600 Ballik SAT Shkalasi"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* ── SCHEDULE PICKER & LIVE TABLE ── */}
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

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Holati (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold"
            >
              <option value="upcoming">Kutilmoqda</option>
              <option value="live">Faol</option>
              <option value="finished">Yakunlangan</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tavsif (Description)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Musobaqa haqida qisqacha ma'lumot..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prize Pool */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sovrin Jamg'armasi
            </label>
            <input
              type="text"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="2,000,000 SO'M + Grantlar"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-bold text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Top Prizes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              O'rinlar Bo'yicha Sovrinlar (Har bir qatorga alohida)
            </label>
            <textarea
              value={topPrizesText}
              onChange={(e) => setTopPrizesText(e.target.value)}
              rows={3}
              placeholder="🥇 1-O'rin: 1,000,000 So'm&#10;🥈 2-O'rin: 600,000 So'm&#10;🥉 3-O'rin: 400,000 So'm"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Rules Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nizom & Qoidalar (Har bir qatorga alohida)
            </label>
            <textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              rows={3}
              placeholder="Multiple choice va Grid-in savollar mavjud.&#10;Vaqt to'xtatilmaydi."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{tournament ? "O'zgarishlarni Saqlash" : "Musobaqani Yaratish"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
