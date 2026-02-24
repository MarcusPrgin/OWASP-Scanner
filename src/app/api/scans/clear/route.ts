export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { scans } from "@/db/schema";
import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.delete(scans).where(eq(scans.userId, user.id));

  return NextResponse.json({ ok: true });
}
