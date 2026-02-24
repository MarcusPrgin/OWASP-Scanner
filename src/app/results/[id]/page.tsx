"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Scan = {
  id: number;
  url: string;
  status: string;
  progress: number;
  createdAt?: any;
  updatedAt?: any;
};

type Job = {
  id?: number;
  scanId: number;
  status: string;
  startedAt?: any;
  finishedAt?: any;
  error?: string | null;
};

type Finding = {
  id?: number;
  scanId: number;
  severity: "info" | "low" | "medium" | "high";
  title: string;
  description: string;
  evidence?: string | null;
  createdAt?: any;
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const scanId = useMemo(() => Number(params?.id), [params]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [scan, setScan] = useState<Scan | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);

  async function load() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/scans/${scanId}`, { cache: "no-store" });
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(raw || "Invalid response");
      }
      if (!res.ok) throw new Error(data?.error ?? `Failed (${res.status})`);

      setScan(data.scan ?? null);
      setJob(data.job ?? null);
      setFindings(Array.isArray(data.findings) ? data.findings : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load scan.");
      setScan(null);
      setJob(null);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(scanId)) {
      setErr("Invalid scan id");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  const grouped = useMemo(() => {
    const g: Record<Finding["severity"], Finding[]> = {
      high: [],
      medium: [],
      low: [],
      info: [],
    };
    for (const f of findings) g[f.severity].push(f);
    return g;
  }, [findings]);

  const counts = useMemo(() => {
    return {
      high: grouped.high.length,
      medium: grouped.medium.length,
      low: grouped.low.length,
      info: grouped.info.length,
      total: findings.length,
    };
  }, [grouped, findings.length]);

  // Pull structured “Basic Scanner” details out of evidence text when possible.
  // This works even if evidence is plain text (we’ll parse lines like "X-Frame-Options: missing").
  const basicSummary = useMemo(() => {
    // If your basicScanner already writes evidence with JSON, we’ll read it.
    // Otherwise we fallback to simple string evidence.
    const headersChecks: { ok: number; missing: number; items: Array<{ name: string; ok: boolean; detail?: string }> } =
      { ok: 0, missing: 0, items: [] };

    const signals: Array<{ label: string; value: string; kind: "good" | "warn" | "bad" | "neutral" }> = [];

    // Heuristics: look for findings that reference headers / https / redirects / tls
    const headerRelated = findings.filter((f) =>
      (f.title + " " + f.description).toLowerCase().includes("header")
    );

    // Try to extract header names from those findings
    const headerNames = [
      "Strict-Transport-Security",
      "Content-Security-Policy",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
      "Cross-Origin-Embedder-Policy",
    ];

    const evidenceBlob = findings
      .map((f) => f.evidence)
      .filter(Boolean)
      .join("\n");

    // Try JSON parse if evidence includes JSON somewhere
    let parsedJson: any = null;
    try {
      // If evidence is exactly JSON in some finding:
      const jsonCandidate = findings.find((f) => {
        const t = (f.evidence ?? "").trim();
        return t.startsWith("{") && t.endsWith("}");
      })?.evidence;
      if (jsonCandidate) parsedJson = JSON.parse(jsonCandidate);
    } catch {}

    // If JSON has headers object
    if (parsedJson?.headers && typeof parsedJson.headers === "object") {
      for (const name of headerNames) {
        const v = parsedJson.headers[name];
        const ok = !!v;
        headersChecks.items.push({ name, ok, detail: ok ? String(v) : "missing" });
        if (ok) headersChecks.ok += 1;
        else headersChecks.missing += 1;
      }

      if (parsedJson.finalUrl) {
        signals.push({
          label: "Final URL",
          value: String(parsedJson.finalUrl),
          kind: "neutral",
        });
      }
      if (typeof parsedJson.redirects === "number") {
        signals.push({
          label: "Redirects",
          value: String(parsedJson.redirects),
          kind: parsedJson.redirects > 3 ? "warn" : "good",
        });
      }
      if (parsedJson.https !== undefined) {
        signals.push({
          label: "HTTPS",
          value: parsedJson.https ? "Yes" : "No",
          kind: parsedJson.https ? "good" : "bad",
        });
      }
    } else {
      // String-based fallback: mark headers as “missing” if evidence mentions missing
      for (const name of headerNames) {
        const reMissing = new RegExp(`${escapeRegExp(name)}.*(missing|not set|absent)`, "i");
        const rePresent = new RegExp(`${escapeRegExp(name)}\\s*:\\s*.+`, "i");

        const ok = rePresent.test(evidenceBlob) && !reMissing.test(evidenceBlob);
        headersChecks.items.push({ name, ok, detail: ok ? "present" : "missing" });
        if (ok) headersChecks.ok += 1;
        else headersChecks.missing += 1;
      }
    }

    return { headersChecks, signals };
  }, [findings]);

  return (
    <main style={styles.page}>
      <div style={styles.bgGlow} aria-hidden />
      <div style={styles.shell}>
        <div style={styles.topRow}>
          <div>
            <div style={styles.brand}>OWASP Scanner</div>
            <div style={styles.muted}>Scan details</div>
          </div>

          <div style={styles.actions}>
            <Link href="/dashboard" style={styles.linkBtn}>
              Dashboard
            </Link>
            <button onClick={load} style={styles.btn}>
              Refresh
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.h1}>Results</div>
              <div style={styles.muted}>
                Scan ID: <strong>{Number.isFinite(scanId) ? scanId : "?"}</strong>
              </div>
              {scan?.url && (
                <div style={{ ...styles.muted, marginTop: 6 }}>
                  Target: <span style={{ fontWeight: 900 }}>{scan.url}</span>
                </div>
              )}
            </div>

            <div style={styles.badges}>
              {scan ? <Badge label={scan.status ?? "unknown"} kind={statusKind(scan.status)} /> : null}
              {job ? <Badge label={`job: ${job.status}`} kind={statusKind(job.status)} /> : null}
              {scan ? <Badge label={`${scan.progress ?? 0}%`} kind="neutral" /> : null}
            </div>
          </div>

          {loading && <div style={styles.notice}>Loading scan…</div>}

          {err && (
            <div style={styles.error}>
              {err}
              <div style={{ marginTop: 10 }}>
                <Link href="/" style={styles.metaLink}>
                  Back home
                </Link>
              </div>
            </div>
          )}

          {!loading && !err && scan && (
            <>
              {/* Summary */}
              <div style={styles.summaryRow}>
                <MiniStat label="High" value={counts.high} />
                <MiniStat label="Medium" value={counts.medium} />
                <MiniStat label="Low" value={counts.low} />
                <MiniStat label="Info" value={counts.info} />
              </div>

              {/* Basic Scanner box */}
              <div style={styles.divider} />
              <div style={styles.sectionTitle}>What the Basic Scanner checked</div>

              <div style={styles.basicGrid}>
                <div style={styles.basicCard}>
                  <div style={styles.basicTitle}>Security headers</div>
                  <div style={styles.basicBody}>
                    Found <strong>{basicSummary.headersChecks.ok}</strong> /{" "}
                    <strong>{basicSummary.headersChecks.items.length}</strong> recommended headers
                  </div>

                  <div style={styles.headerList}>
                    {basicSummary.headersChecks.items.map((h) => (
                      <div key={h.name} style={styles.headerRowItem}>
                        <span style={{ fontWeight: 900 }}>{h.name}</span>
                        <Badge label={h.ok ? "present" : "missing"} kind={h.ok ? "good" : "bad"} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.basicCard}>
                  <div style={styles.basicTitle}>Signals</div>
                  <div style={styles.basicBody}>
                    These come from your scan output (or evidence if available).
                  </div>

                  {basicSummary.signals.length === 0 ? (
                    <div style={styles.noticeSmall}>
                      No structured signals detected yet. (Totally fine — findings still show below.)
                    </div>
                  ) : (
                    <div style={styles.signalList}>
                      {basicSummary.signals.map((s) => (
                        <div key={s.label} style={styles.signalItem}>
                          <div style={{ fontWeight: 950 }}>{s.label}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <div style={styles.signalValue}>{s.value}</div>
                            <Badge label={s.kind} kind={s.kind} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Findings */}
              <div style={styles.divider} />
              <div style={styles.sectionTitle}>Findings</div>

              {findings.length === 0 ? (
                <div style={styles.notice}>
                  No findings yet. If the scan is still <strong>queued</strong> or{" "}
                  <strong>running</strong>, hit <strong>Refresh</strong>.
                </div>
              ) : (
                <div style={styles.findingSections}>
                  <FindingSection title="High" items={grouped.high} />
                  <FindingSection title="Medium" items={grouped.medium} />
                  <FindingSection title="Low" items={grouped.low} />
                  <FindingSection title="Info" items={grouped.info} />
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.footer}>
          <span style={{ opacity: 0.7 }}>
            Run scans only on systems you own or have permission to test.
          </span>
        </div>
      </div>
    </main>
  );
}

function FindingSection({ title, items }: { title: string; items: Finding[] }) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={styles.sectionHeader}>
        <div style={{ fontWeight: 950 }}>{title}</div>
        <div style={styles.sectionCount}>{items.length}</div>
      </div>

      <div style={styles.list}>
        {items.map((f, idx) => (
          <div key={f.id ?? `${f.title}-${idx}`} style={styles.finding}>
            <div style={styles.findingTop}>
              <Badge label={f.severity} kind={severityKind(f.severity)} />
              <div style={styles.findingTitle}>{f.title}</div>
            </div>

            <div style={styles.findingBody}>{f.description}</div>

            {f.evidence ? (
              <pre style={styles.evidence}>{String(f.evidence).slice(0, 2500)}</pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function Badge({ label, kind }: { label: string; kind: "good" | "warn" | "bad" | "neutral" }) {
  const bg =
    kind === "good"
      ? "rgba(34,197,94,0.18)"
      : kind === "warn"
      ? "rgba(234,179,8,0.20)"
      : kind === "bad"
      ? "rgba(239,68,68,0.18)"
      : "rgba(15,23,42,0.10)";
  const border =
    kind === "good"
      ? "rgba(34,197,94,0.35)"
      : kind === "warn"
      ? "rgba(234,179,8,0.38)"
      : kind === "bad"
      ? "rgba(239,68,68,0.34)"
      : "rgba(15,23,42,0.14)";

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        border: `1px solid ${border}`,
        background: bg,
        textTransform: "uppercase",
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}

function severityKind(s: any): "good" | "warn" | "bad" | "neutral" {
  if (s === "high") return "bad";
  if (s === "medium") return "warn";
  if (s === "low") return "neutral";
  return "neutral";
}

function statusKind(s: any): "good" | "warn" | "bad" | "neutral" {
  if (s === "done") return "good";
  if (s === "running") return "warn";
  if (s === "failed") return "bad";
  if (s === "queued") return "neutral";
  return "neutral";
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  shell: { width: "100%", maxWidth: 1050, position: "relative" },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    padding: "0 6px",
    flexWrap: "wrap",
  },
  brand: { fontWeight: 950, letterSpacing: -0.3, fontSize: 16 },
  muted: { fontSize: 13, color: "rgba(11,18,32,0.62)", fontWeight: 700 },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  btn: {
    border: "none",
    padding: "10px 12px",
    borderRadius: 14,
    fontWeight: 900,
    background: "linear-gradient(135deg, #111827, #0b1220)",
    color: "#fff",
    cursor: "pointer",
  },
  linkBtn: {
    border: "1px solid rgba(15,23,42,0.14)",
    padding: "9px 12px",
    borderRadius: 14,
    fontWeight: 900,
    textDecoration: "none",
    color: "rgba(11,18,32,0.85)",
    background: "rgba(255,255,255,0.70)",
  },
  card: {
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.70)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 28px 90px rgba(2,6,23,0.14)",
    padding: 22,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  badges: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  h1: { fontSize: 34, fontWeight: 950, letterSpacing: -0.8, margin: "2px 0 2px" },
  divider: { height: 1, margin: "16px 0", background: "rgba(15,23,42,0.10)" },
  notice: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.10)",
    fontWeight: 800,
    color: "rgba(11,18,32,0.74)",
    fontSize: 13,
  },
  noticeSmall: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.10)",
    fontWeight: 800,
    color: "rgba(11,18,32,0.72)",
    fontSize: 12,
  },
  error: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
    fontWeight: 900,
    color: "#991b1b",
    fontSize: 13,
  },
  metaLink: {
    fontSize: 12,
    fontWeight: 900,
    textDecoration: "none",
    color: "rgba(11,18,32,0.85)",
  },
  summaryRow: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  stat: {
    borderRadius: 18,
    padding: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
  },
  statLabel: { fontSize: 12, fontWeight: 950, color: "rgba(11,18,32,0.62)" },
  statValue: { fontSize: 22, fontWeight: 950, marginTop: 6 },

  sectionTitle: { fontWeight: 950, letterSpacing: -0.2, fontSize: 16 },

  basicGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 10,
  },
  basicCard: {
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
  },
  basicTitle: { fontWeight: 950, letterSpacing: -0.2 },
  basicBody: { marginTop: 6, fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.72)" },

  headerList: { marginTop: 10, display: "grid", gap: 8 },
  headerRowItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.70)",
  },

  signalList: { marginTop: 10, display: "grid", gap: 10 },
  signalItem: {
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.70)",
  },
  signalValue: {
    fontSize: 13,
    fontWeight: 900,
    color: "rgba(11,18,32,0.80)",
    wordBreak: "break-word",
  },

  findingSections: { display: "grid", gap: 12 },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionCount: {
    fontWeight: 950,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.06)",
    fontSize: 12,
  },

  list: { display: "grid", gap: 10 },
  finding: {
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.65)",
  },
  findingTop: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  findingTitle: { fontWeight: 950, letterSpacing: -0.2 },
  findingBody: {
    marginTop: 8,
    color: "rgba(11,18,32,0.72)",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.5,
  },
  evidence: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.05)",
    fontSize: 12,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  footer: {
    marginTop: 12,
    padding: "0 6px",
    fontSize: 12,
    color: "rgba(11,18,32,0.60)",
    fontWeight: 600,
  },
};
