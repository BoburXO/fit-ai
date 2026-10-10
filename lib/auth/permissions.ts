import type { Role } from "../../types/domain";

export type Action = "challenge:manage" | "admin:view" | "workout:read" | "workout:write";

/**
 * Role -> allowed actions. In demo mode the role is picked by the user (prototype only);
 * with real auth the role must come from the verified session, never from the client.
 */
const PERMISSIONS: Record<Role, readonly Action[]> = {
  student: ["workout:read", "workout:write"],
  teacher: ["workout:read", "workout:write", "challenge:manage", "admin:view"],
};

export function can(role: Role | null | undefined, action: Action): boolean {
  return !!role && PERMISSIONS[role].includes(action);
}

/** A user may only touch their own records. */
export function ownsRecord(sessionUserId: string | null | undefined, recordUserId: string): boolean {
  return !!sessionUserId && sessionUserId === recordUserId;
}
