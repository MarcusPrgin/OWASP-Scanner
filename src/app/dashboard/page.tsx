export const runtime = "nodejs";

import Link from "next/link";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { scans } from "@/db/schema";
import { COOKIE_NAME, getUserFromToken } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  const user = await getUserFromToken(token);

  if (!user) {
    return (
      <main style={styles.page}>
        <div style={styles.bgGlow} aria-hidden />
        <div style={styles.shell}>
          <div style={styles.brandRow}>
            <div style={styles.logoMark} aria-hidden />
            <div>
              <div style={styles.brandName}>OWASP Scanner</div>
              <div style={styles.brandTag}>My Results</div>
            </div>
          </div>

          <div style={styles.card}>
            <h1 style={styles.h1}>Dashboard</h1>
            <p style={styles.sub}>Please sign in to view your scan history.</p>
            <Link href="/signin" style={styles.btnLink}>
              Go to Sign in →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const rows = await db
    .select()
    .from(scans)
    .where(eq(scans.userId, user.id))
    .orderBy(desc(scans.id))
    .limit(50);

  return (
    <main style={styles.page}>
      <div style={styles.bgGlow} aria-hidden />
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div style={styles.brandRow}>
            <div style={styles.logoMark} aria-hidden />
            <div>
              <div style={styles.brandName}>OWASP Scanner</div>
              <div style={styles.brandTag}>My Results</div>
            </div>
          </div>

          <div style={styles.topBtns}>
            <Link href="/" style={styles.pillBtn}>
              Home
            </Link>
            <Link href="/dashboard" style={styles.pillBtn}>
              Refresh
            </Link>
          </div>
        </div>

        <div style={styles.card}>
          <h1 style={styles.h1}>Dashboard</h1>
          <p style={styles.sub}>
            Your scan history lives here. Run scans only on systems you own or have permission to
            test.
          </p>

          {rows.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>No scans yet</div>
              <div style={styles.emptyBody}>Go to Home and start your first scan.</div>
              <Link href="/" style={styles.btnLink}>
                Back home →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {rows.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/results/${s.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={styles.rowCard}>
                    <div style={styles.rowTop}>
                      <div style={styles.url}>{s.url}</div>
                      <div style={styles.badge}>{String(s.status).toUpperCase()}</div>
                    </div>

                    <div style={styles.rowMeta}>
                      <div style={styles.metaItem}>Progress: {s.progress ?? 0}%</div>
                      <div style={styles.metaItem}>
                        Created:{" "}
                        {s.createdAt
                          ? new Date(Number(s.createdAt)).toLocaleString()
                          : "—"}
                      </div>
                      <div style={styles.metaItem}>Scan ID: {s.id}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
    color: "#0B1220",
    background:
      "radial-gradient(1200px 700px at 20% 10%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(900px 550px at 80% 20%, rgba(34,197,94,0.14), transparent 60%), linear-gradient(#ffffff, #f7f8fb)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    inset: -200,
    background:
      "radial-gradient(closest-side at 30% 30%, rgba(99,102,241,0.12), transparent 70%), radial-gradient(closest-side at 70% 40%, rgba(34,197,94,0.10), transparent 70%)",
    filter: "blur(20px)",
    pointerEvents: "none",
  },
  shell: { width: "100%", maxWidth: 1100, position: "relative" },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    padding: "0 6px",
    flexWrap: "wrap",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 14,
    height: 14,
    borderRadius: 5,
    background: "linear-gradient(135deg, #111827, #6366f1)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  },
  brandName: { fontWeight: 900, letterSpacing: -0.2 },
  brandTag: { marginTop: 2, fontSize: 13, color: "rgba(11,18,32,0.62)", fontWeight: 600 },
  topBtns: { display: "flex", gap: 10 },
  pillBtn: {
    textDecoration: "none",
    color: "rgba(11,18,32,0.9)",
    fontWeight: 900,
    padding: "10px 14px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.65)",
  },
  card: {
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 28px 90px rgba(2,6,23,0.14)",
    padding: 22,
  },
  h1: { fontSize: 44, letterSpacing: -1, margin: "4px 0 8px" },
  sub: { margin: "0 0 10px", color: "rgba(11,18,32,0.72)", lineHeight: 1.55, maxWidth: 760 },
  empty: {
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
    padding: 16,
  },
  emptyTitle: { fontWeight: 950, fontSize: 16 },
  emptyBody: { marginTop: 6, color: "rgba(11,18,32,0.68)", fontWeight: 650 },
  btnLink: {
    display: "inline-block",
    marginTop: 12,
    padding: "10px 14px",
    borderRadius: 16,
    textDecoration: "none",
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(135deg, #111827, #0b1220)",
  },
  rowCard: {
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.78)",
  },
  rowTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  url: { fontWeight: 950, fontSize: 18, letterSpacing: -0.2 },
  badge: {
    fontWeight: 950,
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.85)",
  },
  rowMeta: { marginTop: 10, display: "flex", gap: 18, flexWrap: "wrap" },
  metaItem: { color: "rgba(11,18,32,0.70)", fontWeight: 750, fontSize: 13 },
};
