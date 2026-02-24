export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME, createToken } from "@/lib/auth";

const Schema = z.object({ email: z.string().trim().min(3) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  if (!email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  let userId: number;

  if (existing.length > 0) {
    userId = existing[0].id;
  } else {
    // Create user and get id back
    const [created] = await db.insert(users).values({ email }).returning({ id: users.id });
    userId = created.id;
  }

  const token = createToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({ token, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt, // optional but recommended
  });

  return NextResponse.json({ ok: true });
}
