export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // expire immediately
  });

  return NextResponse.json({ ok: true });
}
