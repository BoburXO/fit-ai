"use client";

import { useState } from "react";
import { Flag, Users } from "lucide-react";
import { useApp } from "@/components/layout/AppProvider";
import { challengeProgress } from "@/lib/storage/state";
import { challengeStatus } from "@/lib/challenges/progress";
import { DemoBadge, EmptyState, PageHeader, ProgressBar } from "@/components/ui/primitives";

const KIND = { daily: "Kunlik", weekly: "Haftalik", special: "Maxsus" } as const;
const STATUS = { upcoming: "Tez orada", active: "Faol", closed: "Yopilgan" } as const;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });

export default function ChallengesPage() {
  const { state, now, joinChallenge } = useApp();
  const [filter, setFilter] = useState<"all" | "individual" | "team">("all");
  const list = state.challenges.filter((c) => filter === "all" || c.scope === filter);

  return (
    <>
      <PageHeader title="Challenge’lar" subtitle="Faqat kamera orqali o‘lchangan va yakunlangan mashqlar hisobga olinadi." />
      <div className="mb-4 flex gap-2" role="group" aria-label="Filtr">
        {([["all", "Hammasi"], ["individual", "Shaxsiy"], ["team", "Jamoaviy"]] as const).map(([k, l]) => (
          <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${filter === k ? "border-lime bg-lime text-ink" : "border-line text-mute"}`}>{l}</button>))}
      </div>
      {list.length === 0 ? <EmptyState icon={Flag} title="Challenge yo‘q" text="Tashkilotchi yangi challenge qo‘shganda shu yerda ko‘rinadi." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((c) => {
            const st = challengeStatus(c, now);
            const p = challengeProgress(state, c);
            const joined = !!state.joined[c.id];
            const done = p?.completed && state.ledger.some((e) => e.key === `challenge:${c.id}:${state.userId}`);
            return (
              <article key={c.id} className={`card p-4 ${c.id === "ch-fitness-7" ? "border-lime/50" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-md bg-raised px-2 py-0.5 font-semibold">{KIND[c.kind]}</span><span className="rounded-md bg-raised px-2 py-0.5 font-semibold">{c.scope === "team" ? "Jamoaviy" : "Shaxsiy"}</span><span className={st === "active" ? "text-lime" : "text-mute"}>{STATUS[st]}</span>{c.isDemo && <DemoBadge />}</div>
                <h2 className="mt-2 text-lg font-bold">{c.title}</h2>
                <p className="mt-1 text-sm text-mute">{c.description}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-mute">{c.rules.map((r) => <li key={r}>{r}</li>)}</ul>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-mute"><span>{fmtDate(c.startsAt)} – {fmtDate(c.endsAt)}</span><span className="font-semibold text-lime">+{c.rewardPoints} ball</span></div>
                {c.scope === "team" && <p className="mt-1 flex items-center gap-1 text-xs text-mute"><Users size={12} aria-hidden /> Jamoa hisobi: sizning mashqlaringiz + demo sinfdoshlar</p>}
                {joined && p ? (
                  <div className="mt-3"><div className="mb-1 flex justify-between text-xs"><span>{p.current} / {p.target}</span><span>{done ? "Yakunlandi, mukofot olindi" : p.completed ? "Shart bajarildi" : `${p.percent}%`}</span></div><ProgressBar percent={p.percent} /></div>
                ) : (
                  <button className="btn-primary mt-3" disabled={st !== "active"} onClick={() => joinChallenge(c.id)}>{st === "active" ? "Qo‘shilish" : "Qo‘shilib bo‘lmaydi"}</button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
