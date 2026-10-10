"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { useBoard } from "@/hooks/useBoard";
import { DemoBadge, EmptyState, PageHeader } from "@/components/ui/primitives";
import { TEAMS } from "@/lib/storage/state";
import type { Period } from "@/lib/teams/leaderboard";

const seg = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-lime bg-lime text-ink" : "border-line text-mute hover:text-white"}`;

export default function LeaderboardPage() {
  const { state } = useApp();
  const [period, setPeriod] = useState<Period>("week");
  const [view, setView] = useState<"teams" | "players">("teams");
  const [team, setTeam] = useState("all");
  const [sort, setSort] = useState<"points" | "workouts">("points");
  const { players, teams } = useBoard(period);
  const rows = players.filter((p) => team === "all" || p.teamId === team).slice().sort((a, b) => (sort === "points" ? 0 : b.workouts - a.workouts));

  return (
    <>
      <PageHeader title="Reyting" subtitle="Ballar faqat saqlangan va tasdiqlangan mashqlar (ball daftari) asosida hisoblanadi." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-2" role="group" aria-label="Ko‘rinish"><button className={seg(view === "teams")} aria-pressed={view === "teams"} onClick={() => setView("teams")}>Jamoalar</button><button className={seg(view === "players")} aria-pressed={view === "players"} onClick={() => setView("players")}>O‘quvchilar</button></div>
        <div className="flex gap-2" role="group" aria-label="Davr"><button className={seg(period === "week")} aria-pressed={period === "week"} onClick={() => setPeriod("week")}>Haftalik</button><button className={seg(period === "all")} aria-pressed={period === "all"} onClick={() => setPeriod("all")}>Butun davr</button></div>
        {view === "players" && (<>
          <select aria-label="Jamoa bo‘yicha filtr" className="input !w-auto" value={team} onChange={(e) => setTeam(e.target.value)}><option value="all">Barcha jamoalar</option>{TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <select aria-label="Saralash" className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value as "points" | "workouts")}><option value="points">Ball bo‘yicha</option><option value="workouts">Mashqlar soni bo‘yicha</option></select></>)}
      </div>
      <p className="mb-3 flex items-center gap-2 text-xs text-mute"><DemoBadge /> Sinfdoshlar namunaviy (demo) ma’lumot. Sizning natijangiz haqiqiy yozuvlardan hisoblanadi.</p>

      {view === "teams" ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm"><caption className="sr-only">Jamoalar reytingi</caption>
            <thead className="border-b border-line text-mute"><tr><th className="p-3">#</th><th className="p-3">Jamoa</th><th className="p-3 text-right">Ball</th><th className="p-3 text-right">Mashqlar</th><th className="p-3 text-right">Faol a’zolar</th></tr></thead>
            <tbody>{teams.map((t) => (<tr key={t.teamId} className={`border-b border-line last:border-0 ${t.teamId === state.profile.teamId ? "bg-lime/10" : ""}`}><td className="p-3 font-extrabold">{t.rank}</td><td className="p-3 font-semibold">{t.name}{t.teamId === state.profile.teamId && <span className="ml-2 text-xs text-lime">sizning jamoa</span>}</td><td className="p-3 text-right font-bold">{t.points}</td><td className="p-3 text-right">{t.workouts}</td><td className="p-3 text-right">{t.activeMembers}</td></tr>))}</tbody></table>
        </div>
      ) : rows.length === 0 ? <EmptyState icon={Trophy} title="Natija yo‘q" text="Bu filtr bo‘yicha o‘quvchi topilmadi." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm"><caption className="sr-only">O‘quvchilar reytingi</caption>
            <thead className="border-b border-line text-mute"><tr><th className="p-3">#</th><th className="p-3">Ism</th><th className="p-3">Jamoa</th><th className="p-3 text-right">Ball</th><th className="p-3 text-right">Mashqlar</th></tr></thead>
            <tbody>{rows.map((p) => (<tr key={p.id} className={`border-b border-line last:border-0 ${p.isMe ? "bg-lime/10" : ""}`}><td className="p-3 font-extrabold">{p.rank}</td><td className="p-3 font-semibold">{p.name} {p.isMe ? <span className="text-xs text-lime">(siz)</span> : <DemoBadge />}</td><td className="p-3">{p.teamId}</td><td className="p-3 text-right font-bold">{p.points}</td><td className="p-3 text-right">{p.workouts}</td></tr>))}</tbody></table>
        </div>
      )}
    </>
  );
}
