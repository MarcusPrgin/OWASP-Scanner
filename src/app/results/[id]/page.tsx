"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Scan = {
  id: number;
  url: string;
  status: "queued" | "running" | "done" | "error";
  progress: number;
  errorMessage?: string | null;
};

type Finding = {
  id: number;
  severity: "info" | "low" | "medium" | "high";
  category: string;
  title: string;
  description: string;
  evidence: string;
};

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const scanId = Number(params.id);
  const [data, setData] = useState<{ scan: Scan; findings: Finding[] } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/scans/${scanId}`, { cache: "no-store" });
    if (!res.ok) {
      setData(null);
      setLoading(false);
      return;
    }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    if (!Number.isFinite(scanId)) {
      setLoading(false);
      return;
    }

    let timer: any;

    const tick = async () => {
      await load();

      // If still running/queued, poll again
      const status = (data?.scan?.status ?? "queued") as Scan["status"];
      if (status === "queued" || status === "running") {
        timer = setTimeout(tick, 900);
      }
    };

    tick();

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  if (!Number.isFinite(scanId)) {
    return (
      <main style={pageStyle}>
        <h1>Invalid scan id</h1>
        <Link href="/" style={linkStyle}>Back home</Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <h1 style={{ marginBottom: 10 }}>Loading scan…</h1>
        <p style={{ color: "rgba(11,18,32,0.65)" }}>Scan #{scanId}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={pageStyle}>
        <h1>Scan not found</h1>
        <p style={{ color: "rgba(11,18,32,0.65)" }}>
          We couldn’t load scan #{scanId}.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Link href="/" style={btnPrimary}>Home</Link>
          <Link href="/results" style={btn}>All results</Link>
        </div>
      </main>
    );
  }

  const { scan, findings } = data;

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Scan #{scan.id}</h1>
          <div style={{ color: "rgba(11,18,32,0.70)" }}>{scan.url}</div>
          <div style={{ marginTop: 6, color: "rgba(11,18,32,0.60)" }}>
            Status: <strong>{scan.status}</strong> • Progress: <strong>{scan.progress}%</strong>
          </div>
          {scan.status === "error" && scan.errorMessage && (
            <div style={{ marginTop: 10, color: "#b91c1c", fontWeight: 700 }}>
              {scan.errorMessage}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/" style={btn}>Home</Link>
          <Link href="/scan" style={btnPrimary}>New scan</Link>
          <Link href="/results" style={btn}>All results</Link>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 18, border: "1px solid rgba(15,23,42,0.12)", borderRadius: 14, padding: 10 }}>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(0, Math.min(100, scan.progress))}%`,
              background: "linear-gradient(135deg, #22c55e, #86efac)",
            }}
          />
        </div>
      </div>

      <h2 style={{ marginTop: 22 }}>Findings</h2>

      {scan.status !== "done" && (
        <div style={noteCard}>
          Scanning… this page will update automatically.
        </div>
      )}

      {findings.length === 0 ? (
        <div style={noteCard}>No findings yet.</div>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {findings.map((f) => (
            <div key={f.id} style={findingCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>{f.title}</div>
                <span style={sevPill(f.severity)}>{f.severity.toUpperCase()}</span>
              </div>

              {(f.description || f.category) && (
                <div style={{ marginTop: 6, color: "rgba(11,18,32,0.70)" }}>
                  <strong>{f.category}</strong>
                  {f.description ? ` • ${f.description}` : ""}
                </div>
              )}

              {f.evidence && (
                <pre style={evidenceStyle}>{f.evidence}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "40px auto",
  padding: 16,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial',
  color: "#0B1220",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#0B1220",
  fontWeight: 800,
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.7)",
  textDecoration: "none",
  color: "#0B1220",
  fontWeight: 800,
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  border: "none",
  background: "linear-gradient(135deg, #111827, #0b1220)",
  color: "#fff",
};

const noteCard: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(255,255,255,0.65)",
};

const findingCard: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(255,255,255,0.75)",
};

const evidenceStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  background: "rgba(15,23,42,0.06)",
  whiteSpace: "pre-wrap",
  overflowX: "auto",
};

function sevPill(sev: "info" | "low" | "medium" | "high"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
  };

  if (sev === "high") return { ...base, background: "rgba(239,68,68,0.14)" };
  if (sev === "medium") return { ...base, background: "rgba(245,158,11,0.16)" };
  if (sev === "low") return { ...base, background: "rgba(59,130,246,0.14)" };
  return { ...base, background: "rgba(34,197,94,0.14)" };
}
