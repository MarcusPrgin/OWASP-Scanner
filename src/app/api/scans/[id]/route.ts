// src/app/api/scans/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, desc } from "drizzle-orm";

import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { scans, scanJobs, findings } from "@/db/schema";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const scanId = Number(id);

  if (!Number.isFinite(scanId)) {
    return NextResponse.json({ error: "Invalid scan id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scanRows = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);

  if (scanRows.length === 0) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  const scan = scanRows[0];

  // optional: enforce ownership
  if (scan.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const jobRows = await db
    .select()
    .from(scanJobs)
    .where(eq(scanJobs.scanId, scanId))
    .limit(1);

  const job = jobRows.length ? jobRows[0] : null;

  const findingRows = await db
    .select()
    .from(findings)
    .where(eq(findings.scanId, scanId))
    .orderBy(desc(findings.id));

  return NextResponse.json({
    scan,
    job,
    findings: findingRows,
  });
}
