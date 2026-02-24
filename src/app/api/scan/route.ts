export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { scans, scanJobs } from "@/db/schema";
import { runBasicScan } from "@/lib/basicScanner";

const Schema = z.object({ url: z.string().min(1) });

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const url = parsed.data.url.trim();
  if (!url.startsWith("https://")) {
    return NextResponse.json({ error: "URL must start with https://" }, { status: 400 });
  }

  const [scan] = await db
    .insert(scans)
    .values({
      url,
      userId: user.id,
      status: "queued",
      progress: 0,
    })
    .returning({ id: scans.id });

  const scanId = scan.id;

  await db.insert(scanJobs).values({
    scanId,
    status: "queued",
  });

  await runBasicScan(scanId, url);

  return NextResponse.json({ scanId });
}
