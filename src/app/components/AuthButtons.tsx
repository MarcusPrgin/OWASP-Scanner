"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { user: null | { id: number; email: string } };

export default function AuthButtons() {
  const [me, setMe] = useState<Me["user"]>(null);
  const router = useRouter();

  async function refreshMe() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await res.json()) as Me;
    setMe(data.user);
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  }

  if (!me) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/signin" style={navBtn}>Sign in</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Link href="/dashboard" style={navLink}>My Results</Link>
      <button onClick={signOut} style={navBtnDark}>Sign out</button>
    </div>
  );
}

const navLink: React.CSSProperties = {
  textDecoration: "none",
  color: "rgba(11,18,32,0.72)",
  fontWeight: 700,
  fontSize: 14,
};

const navBtn: React.CSSProperties = {
  textDecoration: "none",
  color: "#0B1220",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(15,23,42,0.12)",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 800,
  fontSize: 14,
};

const navBtnDark: React.CSSProperties = {
  border: "none",
  color: "#fff",
  background: "linear-gradient(135deg, #111827, #0b1220)",
  padding: "10px 12px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 14,
  cursor: "pointer",
};
