"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LocalStorageRepository } from "@/lib/storage/repository";
import {
  addWater as addWaterFn, clearSampleData, createInitialState, joinChallenge as joinFn, saveWorkout as saveFn,
  setTeam as setTeamFn, type AppState, type Profile, type SaveResult,
} from "@/lib/storage/state";
import type { Challenge } from "@/types/domain";
import type { WorkoutInput } from "@/lib/workouts/validate";
import type { PlanState } from "@/lib/workouts/plan";

interface Toast { id: number; text: string; tone: "ok" | "error" }

interface Ctx {
  /** Deterministic placeholder until localStorage is read (avoids hydration mismatch). */
  state: AppState;
  ready: boolean;
  now: string;
  toast: (text: string, tone?: Toast["tone"]) => void;
  saveWorkout: (w: WorkoutInput & { startedAt: string }) => SaveResult | null;
  joinChallenge: (id: string) => boolean;
  setTeam: (teamId: string | null) => void;
  setProfile: (p: Partial<Profile>) => void;
  addWater: (ml: number) => void;
  setPlan: (p: PlanState | null) => void;
  upsertChallenge: (c: Challenge) => void;
  clearSamples: () => void;
  resetDemo: () => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("AppProvider topilmadi");
  return c;
};

const PLACEHOLDER = createInitialState("2026-01-01T00:00:00.000Z");

export function AppProvider({ children }: { children: React.ReactNode }) {
  const repo = useRef(new LocalStorageRepository());
  const [state, setState] = useState<AppState>(PLACEHOLDER);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState("2026-01-01T00:00:00.000Z");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const s = repo.current.load();
    setState(s);
    setNow(new Date().toISOString());
    setReady(true);
    const t = setInterval(() => setNow(new Date().toISOString()), 60_000);
    return () => clearInterval(t);
  }, []);

  const commit = useCallback((s: AppState) => {
    stateRef.current = s;
    setState(s);
    repo.current.save(s);
  }, []);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state, ready, now, toast,
      saveWorkout: (w) => {
        try {
          const res = saveFn(stateRef.current, { ...w, id: `w_${crypto.randomUUID()}` }, new Date().toISOString());
          commit(res.state);
          return res;
        } catch {
          toast("Mashqni saqlashda xatolik yuz berdi.", "error");
          return null;
        }
      },
      joinChallenge: (id) => {
        const r = joinFn(stateRef.current, id, new Date().toISOString());
        if (r.error) { toast(r.error, "error"); return false; }
        commit(r.state);
        toast("Challenge’ga qo‘shildingiz.");
        return true;
      },
      setTeam: (teamId) => commit(setTeamFn(stateRef.current, teamId)),
      setProfile: (p) => commit({ ...stateRef.current, profile: { ...stateRef.current.profile, ...p } }),
      addWater: (ml) => commit(addWaterFn(stateRef.current, new Date().toISOString(), ml)),
      setPlan: (plan) => commit({ ...stateRef.current, plan }),
      upsertChallenge: (c) => {
        const list = stateRef.current.challenges;
        commit({ ...stateRef.current, challenges: list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c] });
      },
      clearSamples: () => commit(clearSampleData(stateRef.current)),
      resetDemo: () => { commit(repo.current.reset()); toast("Demo ma’lumotlar asl holiga qaytarildi."); },
    }),
    [state, ready, now, toast, commit],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`pointer-events-auto max-w-md rounded-xl border px-4 py-3 text-sm shadow-lg ${t.tone === "error" ? "border-red-400/40 bg-[#2a1717] text-red-200" : "border-lime/40 bg-panel text-white"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}
