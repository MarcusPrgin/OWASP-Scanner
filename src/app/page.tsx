"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AuthButtons from "@/app/components/AuthButtons";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("https://");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canScan = useMemo(() => {
    const u = url.trim();
    return u.length > "https://".length && u.startsWith("https://");
  }, [url]);

  async function startScan() {
    setError(null);
    const trimmed = url.trim();

    if (!trimmed.startsWith("https://")) {
      setError("Please enter an https:// URL");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (res.status === 401) {
        setLoading(false);
        router.push("/results");
        router.refresh();
        return;
      }

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error ?? "Scan failed");
      }

      const data = await res.json();
      router.push(`/results/${data.scanId}`);
    } catch (e: any) {
      setError(e?.message ?? "Couldn’t start the scan. Try again.");
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      {/* Top nav */}
      <header style={styles.nav}>
        <div style={styles.brand}>
          <div style={styles.logoMark} aria-hidden />
          <span style={styles.brandText}>OWASP Scanner</span>
          <span style={styles.badge}>MVP</span>
        </div>

        <AuthButtons />
      </header>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGrid}>
          <div>
            <h1 style={styles.h1}>
              Trusted security scans
              <br />
              <span style={styles.h1Muted}>without the hassle</span>
            </h1>

            <p style={styles.subhead}>
              Fast, passive checks for modern web apps — save findings to SQLite and review
              results in a clean dashboard.
            </p>

            {/* Scan box */}
            <div style={styles.scanCard}>
              <div style={styles.scanLabelRow}>
                <span style={styles.scanLabel}>Run a free scan</span>
                <span style={styles.scanHint}>HTTPS-only • passive checks</span>
              </div>

              <div style={styles.scanRow}>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon} aria-hidden>🔒</span>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    style={styles.input}
                    spellCheck={false}
                    inputMode="url"
                  />
                </div>

                <button
                  onClick={startScan}
                  disabled={loading || !canScan}
                  style={{
                    ...styles.scanButton,
                    opacity: loading || !canScan ? 0.55 : 1,
                    cursor: loading || !canScan ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Scanning…" : "Scan now"}
                  <span aria-hidden style={{ marginLeft: 8 }}>→</span>
                </button>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.microcopy}>
                Checks: HTTPS, HSTS, CSP, X-Content-Type-Options, Referrer-Policy, robots.txt
              </div>
            </div>

          </div>

          {/* Right side “product” panel */}
          <div style={styles.heroPanel}>
            <div style={styles.panelCard}>
              <div style={styles.panelTop}>
                <div style={styles.pill}>Live preview</div>
                <div style={styles.pillSoft}>Audit-ready</div>
              </div>

              <div style={styles.panelTitle}>Scan summary</div>

              <div style={styles.kpis}>
                <Kpi label="Checks" value="6" />
                <Kpi label="Avg. time" value="~1s" />
                <Kpi label="Storage" value="SQLite" />
              </div>

              <div style={styles.findingsMock}>
                <Finding severity="info" title="HTTPS enabled" />
                <Finding severity="medium" title="Missing Content-Security-Policy" />
                <Finding severity="low" title="Missing Referrer-Policy" />
              </div>

              <div style={styles.panelFooter}>
                <span style={styles.footerDot} />
                <span style={styles.panelFooterText}>
                  MVP runs passive checks only (no exploitation).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* What it does (your original box, upgraded) */}
        <div style={styles.infoGrid}>
          <InfoCard
            title="Simple scans"
            body="Enter a URL and generate a quick, passive security snapshot."
          />
          <InfoCard
            title="Stored results"
            body="Every scan + finding is saved to SQLite for easy review."
          />
          <InfoCard
            title="Buildable MVP"
            body="Perfect base to add OWASP Top 10 checks, auth, exports, and scheduling."
          />
        </div>
      </section>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  );
}

function Finding({
  severity,
  title,
}: {
  severity: "info" | "low" | "medium" | "high";
  title: string;
}) {
  const dot =
    severity === "high" ? "●" : severity === "medium" ? "●" : severity === "low" ? "●" : "●";

  return (
    <div style={styles.findingRow}>
      <span style={styles.findingDot} aria-hidden>{dot}</span>
      <div style={{ flex: 1 }}>
        <div style={styles.findingTitle}>{title}</div>
        <div style={styles.findingMeta}>{severity.toUpperCase()}</div>
      </div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoTitle}>{title}</div>
      <div style={styles.infoBody}>{body}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
    color: "#0B1220",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,0.16), transparent 55%), radial-gradient(900px 500px at 80% 20%, rgba(34,197,94,0.14), transparent 60%), linear-gradient(#ffffff, #f7f8fb)",
  },

  nav: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 14,
    height: 14,
    borderRadius: 5,
    background: "linear-gradient(135deg, #111827, #6366f1)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
  },
  brandText: { fontWeight: 700, letterSpacing: -0.2 },
  badge: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.7)",
  },

  navLinks: { display: "flex", alignItems: "center", gap: 14 },
  navLink: {
    textDecoration: "none",
    color: "rgba(11,18,32,0.72)",
    fontWeight: 600,
    fontSize: 14,
  },
  navCta: {
    textDecoration: "none",
    color: "#fff",
    background: "linear-gradient(135deg, #111827, #0b1220)",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
  },

  hero: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 28,
    alignItems: "start",
  },

  h1: {
    fontSize: 54,
    lineHeight: 1.05,
    letterSpacing: -1.2,
    margin: "32px 0 14px",
  },
  h1Muted: { color: "rgba(11,18,32,0.64)" },
  subhead: { fontSize: 18, lineHeight: 1.55, color: "rgba(11,18,32,0.72)", maxWidth: 620 },

  scanCard: {
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 60px rgba(2,6,23,0.10)",
  },
  scanLabelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  scanLabel: { fontWeight: 800, letterSpacing: -0.2 },
  scanHint: { fontSize: 12, color: "rgba(11,18,32,0.55)" },

  scanRow: { display: "flex", gap: 12, marginTop: 12, alignItems: "center" },
  inputWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.85)",
  },
  inputIcon: { opacity: 0.7 },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 16,
    background: "transparent",
  },

  scanButton: {
    border: "none",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 800,
    color: "#0B1220",
    background: "linear-gradient(135deg, #22c55e, #86efac)",
    boxShadow: "0 16px 40px rgba(34,197,94,0.25)",
  },

  error: {
    marginTop: 10,
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: 13,
  },
  microcopy: { marginTop: 10, fontSize: 12, color: "rgba(11,18,32,0.55)" },

  actions: { display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" },
  primaryBtn: {
    textDecoration: "none",
    color: "#fff",
    background: "linear-gradient(135deg, #111827, #0b1220)",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
  },
  secondaryBtn: {
    textDecoration: "none",
    color: "#0B1220",
    background: "rgba(255,255,255,0.7)",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
    border: "1px solid rgba(15,23,42,0.12)",
  },

  heroPanel: {
    position: "relative",
    paddingTop: 18,
  },
  panelCard: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(12px)",
    padding: 18,
    boxShadow: "0 24px 70px rgba(2,6,23,0.12)",
  },
  panelTop: { display: "flex", gap: 10, marginBottom: 12 },
  pill: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.18)",
    fontWeight: 800,
  },
  pillSoft: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.18)",
    fontWeight: 800,
  },
  panelTitle: { fontWeight: 900, letterSpacing: -0.3, fontSize: 16, marginBottom: 12 },

  kpis: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 },
  kpi: {
    borderRadius: 16,
    padding: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
  },
  kpiValue: { fontWeight: 950, fontSize: 18 },
  kpiLabel: { marginTop: 4, fontSize: 12, color: "rgba(11,18,32,0.6)", fontWeight: 700 },

  findingsMock: { marginTop: 8, display: "flex", flexDirection: "column", gap: 10 },
  findingRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.78)",
  },
  findingDot: { fontSize: 10, opacity: 0.65 },
  findingTitle: { fontWeight: 900, letterSpacing: -0.2 },
  findingMeta: { marginTop: 2, fontSize: 11, color: "rgba(11,18,32,0.55)", fontWeight: 800 },

  panelFooter: { display: "flex", alignItems: "center", gap: 10, marginTop: 14 },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(34,197,94,0.9)",
    boxShadow: "0 8px 16px rgba(34,197,94,0.25)",
  },
  panelFooterText: { fontSize: 12, color: "rgba(11,18,32,0.6)", fontWeight: 700 },

  infoGrid: {
    marginTop: 34,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },
  infoCard: {
    borderRadius: 20,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px)",
    padding: 16,
    boxShadow: "0 18px 60px rgba(2,6,23,0.06)",
  },
  infoTitle: { fontWeight: 950, letterSpacing: -0.3, marginBottom: 6 },
  infoBody: { color: "rgba(11,18,32,0.68)", lineHeight: 1.5 },
};
