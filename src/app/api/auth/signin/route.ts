export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME, createToken } from "@/lib/auth";

const ADMIN_EMAIL = "marcusprgin121@gmail.com";
const ADMIN_PASSWORD = "mp44";

const Schema = z.object({
  email: z.string().trim().min(3),
  password: z.string().min(4), // mp44 is 4 chars
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  // Fetch user (typed)
  const existing = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId!: number;

  if (existing.length === 0) {
    // Only allow creating the first account if it matches admin creds
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({ email, passwordHash })
      .returning({ id: users.id });

    userId = created.id;
  } else {
    const user = existing[0]!;

    // Optional: if admin logs in with the admin password, re-sync hash to mp44
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const newHash = await bcrypt.hash(password, 10);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
      userId = user.id;
    } else {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      userId = user.id;
    }
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
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}
