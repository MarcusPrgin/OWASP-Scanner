import Link from "next/link";

type ScanRow = {
  id: number;
  url: string;
  status: "queued" | "running" | "done" | "error";
  createdAt: string | number;
};

export default async function Results() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/scans`, { cache: "no-store" });
  const scans = (await res.json()) as ScanRow[];

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 34 }}>Results</h1>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link href="/scan" style={btnPrimary}>New scan</Link>
        <Link href="/" style={btn}>Home</Link>
      </div>

      <div style={{ marginTop: 20 }}>
        {scans.length === 0 ? (
          <p>No scans yet.</p>
        ) : (
          scans.map((s) => (
            <Link
              key={s.id}
              href={`/results/${s.id}`}
              style={{
                display: "block",
                padding: 14,
                border: "1px solid #ddd",
                borderRadius: 12,
                marginBottom: 10,
                textDecoration: "none",
                color: "black",
              }}
            >
              <div style={{ fontWeight: 700 }}>{s.url}</div>
              <div style={{ color: "#555" }}>status: {s.status} • id: {s.id}</div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  textDecoration: "none",
  color: "black",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  border: "1px solid #000",
  background: "#000",
  color: "#fff",
};
