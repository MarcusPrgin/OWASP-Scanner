"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailOk = useMemo(() => {
    const v = email.trim().toLowerCase();
    return v.includes("@") && v.includes(".") && v.length >= 6;
  }, [email]);

  const passwordOk = useMemo(() => password.length >= 4, [password]);

  const formOk = emailOk && passwordOk;

  async function submit() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const raw = await res.text().catch(() => "");
      console.log("SIGNIN RESPONSE:", res.status, raw);

      if (!res.ok) {
        let msg: any = null;
        try { msg = JSON.parse(raw); } catch {}
        throw new Error(msg?.error ?? raw ?? `Sign in failed (${res.status})`);
      }

      console.log("REDIRECTING TO /dashboard");
      window.location.href = "/dashboard";
      return;
    } catch (e: any) {
      console.log("SIGNIN ERROR:", e);
      setErr(e?.message ?? "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main style={styles.page}>
      <div style={styles.bgGlow} aria-hidden />
      <div style={styles.shell}>
        {/* Brand header */}
        <div style={styles.brandRow}>
          <div style={styles.logoMark} aria-hidden />
          <div>
            <div style={styles.brandName}>OWASP Scanner</div>
            <div style={styles.brandTag}>Secure scans. Clean results.</div>
          </div>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <h1 style={styles.h1}>Sign in</h1>
          <p style={styles.sub}>
            Use your email and password to access <strong>My Results</strong> and keep your scan
            history.
          </p>

          <label style={styles.label}>Email</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon} aria-hidden>
              ✉️
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && formOk && !loading) submit();
              }}
              placeholder="you@domain.com"
              style={styles.input}
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
            />
          </div>

          <label style={{ ...styles.label, marginTop: 12, display: "block" }}>Password</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon} aria-hidden>
              🔒
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && formOk && !loading) submit();
              }}
              placeholder="At least 4 characters"
              style={styles.input}
              type="password"
              autoComplete="current-password"
            />
          </div>

          {err && <div style={styles.error}>{err}</div>}

          <button
            onClick={submit}
            disabled={!formOk || loading}
            style={{
              ...styles.btn,
              opacity: !formOk || loading ? 0.55 : 1,
              cursor: !formOk || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Continue"}
            <span aria-hidden style={{ marginLeft: 8 }}>
              →
            </span>
          </button>

          <div style={styles.metaRow}>
            <span style={styles.metaText}>MVP auth: email + password.</span>
            <Link href="/" style={styles.metaLink}>
              Back home
            </Link>
          </div>

          <div style={styles.divider} />

          <div style={styles.miniCards}>
            <MiniCard title="Private history" body="Only you can see your scans." />
            <MiniCard title="Fast scans" body="Passive checks — no exploitation." />
            <MiniCard title="SQLite storage" body="Local DB for an easy MVP." />
          </div>
        </div>

        <div style={styles.footer}>
          <span style={{ opacity: 0.7 }}>
            By signing in, you agree to run scans only on systems you own or have permission to test.
          </span>
        </div>
      </div>
    </main>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.miniCard}>
      <div style={styles.miniTitle}>{title}</div>
      <div style={styles.miniBody}>{body}</div>
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

  shell: {
    width: "100%",
    maxWidth: 860,
    position: "relative",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    padding: "0 6px",
  },
  logoMark: {
    width: 14,
    height: 14,
    borderRadius: 5,
    background: "linear-gradient(135deg, #111827, #6366f1)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  },
  brandName: { fontWeight: 900, letterSpacing: -0.2 },
  brandTag: { marginTop: 2, fontSize: 13, color: "rgba(11,18,32,0.62)", fontWeight: 600 },

  card: {
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 28px 90px rgba(2,6,23,0.14)",
    padding: 22,
  },

  h1: {
    fontSize: 36,
    letterSpacing: -0.8,
    margin: "4px 0 8px",
  },
  sub: {
    margin: "0 0 18px",
    color: "rgba(11,18,32,0.72)",
    lineHeight: 1.55,
    maxWidth: 560,
  },

  label: { fontSize: 13, fontWeight: 800, color: "rgba(11,18,32,0.70)" },

  inputWrap: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 16,
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

  error: {
    marginTop: 10,
    color: "#b91c1c",
    fontWeight: 800,
    fontSize: 13,
  },

  btn: {
    width: "100%",
    marginTop: 14,
    border: "none",
    padding: "12px 14px",
    borderRadius: 16,
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(135deg, #111827, #0b1220)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.16)",
  },

  metaRow: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metaText: { fontSize: 12, color: "rgba(11,18,32,0.60)", fontWeight: 700 },
  metaLink: {
    fontSize: 12,
    fontWeight: 900,
    textDecoration: "none",
    color: "rgba(11,18,32,0.85)",
  },

  divider: {
    height: 1,
    margin: "18px 0 14px",
    background: "rgba(15,23,42,0.10)",
  },

  miniCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  miniCard: {
    borderRadius: 18,
    padding: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
  },
  miniTitle: { fontWeight: 950, letterSpacing: -0.2, marginBottom: 4 },
  miniBody: { fontSize: 13, color: "rgba(11,18,32,0.68)", lineHeight: 1.45 },

  footer: {
    marginTop: 12,
    padding: "0 6px",
    fontSize: 12,
    color: "rgba(11,18,32,0.60)",
    fontWeight: 600,
  },
};
