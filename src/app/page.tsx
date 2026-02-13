import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGlow} aria-hidden />

      <header style={styles.header}>
        <div style={styles.badge}>OWASP Scanner • MVP</div>

        <h1 style={styles.h1}>
          Built by
          <span style={styles.h1Accent}> Marcus</span>
        </h1>

        <p style={styles.subtitle}>
          Built with Next.js + TypeScript + Drizzle + SQLite.
        </p>

        <div style={styles.actions}>
          <Link href="/scan" style={styles.primaryBtn}>
            Start a scan
          </Link>
          <Link href="/results" style={styles.secondaryBtn}>
            View results
          </Link>
        </div>

        <div style={styles.metaRow}>
          <div style={styles.metaPill}>✅ Passive checks only</div>
          <div style={styles.metaPill}>🗂️ Saved in SQLite</div>
          <div style={styles.metaPill}>⚡ Quick MVP</div>
        </div>
      </header>

      <section style={styles.grid}>
        <Card
          title="One-click scanning"
          text="Enter a URL and run a passive scan. No exploitation—just fast signals."
          icon="🔍"
        />
        <Card
          title="Clear findings"
          text="Headers + HTTPS checks, stored as findings with severity levels."
          icon="📋"
        />
        <Card
          title="Dev-friendly"
          text="SQLite database you can open in DBeaver. Easy to extend into a real scanner."
          icon="🧩"
        />
      </section>

      <section style={styles.callout}>
        <div>
          <h2 style={styles.calloutTitle}>Ready to run your next scan?</h2>
          <p style={styles.calloutText}>
            Kick off a scan, then review results immediately. Add more checks later (auth, crawling, sitemap, etc.).
          </p>
        </div>
        <div style={styles.calloutActions}>
          <Link href="/scan" style={styles.primaryBtn}>
            Start a scan
          </Link>
          <Link href="/results" style={styles.secondaryBtn}>
            Browse results
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <span style={styles.footerText}>
          MVP build • Next.js + TS • SQLite + Drizzle
        </span>
      </footer>
    </main>
  );
}

function Card({ title, text, icon }: { title: string; text: string; icon: string }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.icon}>{icon}</div>
        <div style={styles.cardTitle}>{title}</div>
      </div>
      <p style={styles.cardText}>{text}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    padding: "48px 16px",
    color: "#0b0b0f",
    background: "linear-gradient(180deg, #fafafa 0%, #ffffff 60%, #f7f7ff 100%)",
    position: "relative",
    overflow: "hidden",
  },

  bgGlow: {
    position: "absolute",
    inset: "-200px -200px auto auto",
    width: 520,
    height: 520,
    background:
      "radial-gradient(circle at 30% 30%, rgba(120, 80, 255, 0.25), rgba(120, 80, 255, 0) 60%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },

  header: {
    maxWidth: 980,
    margin: "0 auto",
    textAlign: "left",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(6px)",
    fontSize: 13,
    color: "rgba(0,0,0,0.75)",
  },

  h1: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    maxWidth: 820,
  },

  h1Accent: {
    color: "#4a2bff",
  },

  subtitle: {
    marginTop: 0,
    maxWidth: 760,
    fontSize: 18,
    lineHeight: 1.55,
    color: "rgba(0,0,0,0.70)",
  },

  actions: {
    display: "flex",
    gap: 12,
    marginTop: 22,
    flexWrap: "wrap",
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#0b0b0f",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 650,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },

  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.8)",
    color: "#0b0b0f",
    textDecoration: "none",
    fontWeight: 650,
  },

  metaRow: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },

  metaPill: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.75)",
    fontSize: 13,
    color: "rgba(0,0,0,0.75)",
  },

  grid: {
    maxWidth: 980,
    margin: "34px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },

  card: {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(6px)",
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.9)",
    fontSize: 18,
  },

  cardTitle: {
    fontWeight: 750,
    fontSize: 16,
    letterSpacing: "-0.01em",
  },

  cardText: {
    margin: 0,
    color: "rgba(0,0,0,0.70)",
    lineHeight: 1.5,
    fontSize: 14.5,
  },

  callout: {
    maxWidth: 980,
    margin: "22px auto 0",
    borderRadius: 18,
    border: "1px solid rgba(74,43,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(74,43,255,0.10), rgba(255,255,255,0.85))",
    padding: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },

  calloutTitle: {
    margin: 0,
    fontSize: 18,
    letterSpacing: "-0.01em",
  },

  calloutText: {
    margin: "6px 0 0",
    maxWidth: 640,
    color: "rgba(0,0,0,0.70)",
    lineHeight: 1.45,
  },

  calloutActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  footer: {
    maxWidth: 980,
    margin: "38px auto 0",
    paddingTop: 18,
    borderTop: "1px solid rgba(0,0,0,0.08)",
    color: "rgba(0,0,0,0.55)",
  },

  footerText: {
    fontSize: 13,
  },
};
