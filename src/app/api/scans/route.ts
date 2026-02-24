export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scans } from "@/db/schema";
import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const scanId = Number.parseInt(id, 10);

  if (!Number.isFinite(scanId)) {
    return NextResponse.json({ error: "Invalid scan id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(scans)
    .where(and(eq(scans.id, scanId), eq(scans.userId, user.id)))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ scan: rows[0] });
}
