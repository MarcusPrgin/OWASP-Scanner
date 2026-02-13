"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function startScan() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      router.push(`/results/${data.scanId}`);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 34 }}>Run a scan</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button onClick={startScan} disabled={loading} style={btnPrimary}>
          {loading ? "Scanning..." : "Start scan"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <a href="/results" style={btn}>View all results</a>
        <a href="/" style={btn}>Back home</a>
      </div>

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

      <p style={{ marginTop: 18, color: "#555" }}>
        MVP runs passive checks only (headers/HTTPS/robots). No exploitation.
      </p>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  textDecoration: "none",
  color: "black",
  display: "inline-block",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #000",
  background: "#000",
  color: "#fff",
};
