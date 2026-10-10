"use client";

import { useMemo } from "react";
import { useApp } from "@/components/layout/AppProvider";
import { DEMO_PEERS, TEAMS } from "@/lib/storage/state";
import { buildPlayers, buildTeams, type Period } from "@/lib/teams/leaderboard";
import { addDays } from "@/lib/workouts/dates";

export function useBoard(period: Period) {
  const { state, now } = useApp();
  return useMemo(() => {
    const input = {
      me: { id: state.userId, name: state.profile.name, teamId: state.profile.teamId },
      peers: DEMO_PEERS,
      ledger: state.ledger,
      workouts: state.workouts,
      teams: TEAMS,
      weekStartIso: addDays(now, -7),
    };
    return { players: buildPlayers(input, period), teams: buildTeams(input, period) };
  }, [state, now, period]);
}
