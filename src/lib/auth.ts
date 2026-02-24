import crypto from "crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const COOKIE_NAME = "owasp_session";

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function getUserFromToken(token: string | null) {
  if (!token) return null;

  const sess = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (sess.length === 0) return null;

  // expiresAt stored as timestamp_ms integer (recommended)
  const expiresAtMs =
    typeof (sess[0] as any).expiresAt === "number"
      ? (sess[0] as any).expiresAt
      : (sess[0] as any).expiresAt?.getTime?.() ?? 0;

  if (expiresAtMs < Date.now()) return null;

  const u = await db.select().from(users).where(eq(users.id, sess[0].userId)).limit(1);
  return u[0] ?? null;
}
