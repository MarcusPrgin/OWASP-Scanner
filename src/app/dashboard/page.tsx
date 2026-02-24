
import Link from "next/link";
import { db } from "@/db";
import { scans } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";

export default async function Dashboard() {
  const cookieStore = await cookies();
const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
const user = await getUserFromToken(token);
  if (!user) {
    return (
      <main style={{ maxWidth: 900, margin: "60px auto", padding: 16, fontFamily: "system-ui" }}>
        <h1>Unauthorized</h1>
        <Link href="/signin">Sign in</Link>
      </main>
    );
  }

  const myScans = await db
    .select()
    .from(scans)
    .where(eq(scans.userId, user.id))
    .orderBy(desc(scans.id));

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>My Results</h1>
          <div style={{ color: "rgba(11,18,32,0.65)" }}>{user.email}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/" style={btn}>Home</Link>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        {myScans.length === 0 ? (
          <div style={card}>No scans yet.</div>
        ) : (
          myScans.map((s) => (
            <Link
              key={s.id}
              href={`/results/${s.id}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "#0B1220",
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(255,255,255,0.75)",
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>{s.url}</div>
              <div style={{ color: "rgba(11,18,32,0.65)", marginTop: 4 }}>
                status: {s.status} • progress: {s.progress}% • id: {s.id}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.7)",
  textDecoration: "none",
  color: "#0B1220",
  fontWeight: 800,
};

const card: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(255,255,255,0.75)",
};
