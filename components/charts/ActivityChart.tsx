"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayPoint } from "@/lib/workouts/stats";

export function ActivityChart({ data, label }: { data: DayPoint[]; label: string }) {
  const empty = data.every((d) => d.minutes === 0);
  return (
    <div role="img" aria-label={label} className="h-56 w-full">
      {empty ? (
        <div className="grid h-full place-items-center text-sm text-mute">Bu davrda faollik yo‘q.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 4, top: 8 }}>
            <CartesianGrid stroke="#2E332C" vertical={false} />
            <XAxis dataKey="label" stroke="#9AA294" fontSize={12} tickLine={false} interval="preserveStartEnd" />
            <YAxis stroke="#9AA294" fontSize={12} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "#222620" }} contentStyle={{ background: "#191C18", border: "1px solid #2E332C", borderRadius: 12 }} formatter={(v) => [`${v} daqiqa`, "Faollik"]} />
            <Bar dataKey="minutes" fill="#C6FF4D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
