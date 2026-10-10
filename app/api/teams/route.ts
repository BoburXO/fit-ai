import { ok } from "@/lib/server/http";
import { DEMO_PEERS, TEAMS } from "@/lib/storage/state";

export async function GET() {
  return ok(TEAMS.map((t) => ({ ...t, demoMembers: DEMO_PEERS.filter((p) => p.teamId === t.id).length, isDemo: true })));
}
