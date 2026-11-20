"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundFx } from "@/lib/sound-effects";

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundFx.isEnabled());
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setEnabled(detail);
      } else {
        setEnabled(soundFx.isEnabled());
      }
    };
    window.addEventListener("promax_sound_toggled", onToggle);
    return () => window.removeEventListener("promax_sound_toggled", onToggle);
  }, []);

  const handleToggle = () => {
    const next = soundFx.toggle();
    setEnabled(next);
  };

  return (
    <button
      type="button"
      data-no-sound="true"
      onClick={handleToggle}
      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0 ${
        enabled
          ? "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
      }`}
      title={enabled ? "Ovoz effektlari yoqilgan (o'chirish)" : "Ovoz effektlari o'chirilgan (yoqish)"}
      aria-label={enabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
    >
      {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  );
}
