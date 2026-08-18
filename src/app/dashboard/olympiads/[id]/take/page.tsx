"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentRunnerRedirect({ params }: PageProps) {
  const { id: tournamentId } = use(params);
  const router = useRouter();

  useEffect(() => {
    if (tournamentId) {
      router.replace(`/dashboard/tests/${tournamentId}/take?type=olympiad`);
    }
  }, [tournamentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Musobaqa test sahifasi yuklanmoqda...</p>
      </div>
    </div>
  );
}
