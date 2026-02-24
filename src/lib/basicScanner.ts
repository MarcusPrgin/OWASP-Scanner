// src/lib/basicScanner.ts
import { db } from "@/db";
import { scans, scanJobs, findings } from "@/db/schema";
import { eq } from "drizzle-orm";

type Severity = "info" | "low" | "medium" | "high";

async function setScan(scanId: number, patch: any) {
  await db.update(scans).set(patch).where(eq(scans.id, scanId));
}

async function setJob(scanId: number, patch: any) {
  await db.update(scanJobs).set(patch).where(eq(scanJobs.scanId, scanId));
}

async function addFinding(args: {
  scanId: number;
  severity: Severity;
  title: string;
  description: string;
  evidence?: string | null;
}) {
  // Adjust these keys if your findings schema differs
  await db.insert(findings).values({
    scanId: args.scanId,
    severity: args.severity,
    title: args.title,
    description: args.description,
    evidence: args.evidence ?? null,
    createdAt: new Date(), // if your schema uses timestamp mode
  } as any);
}

function h(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

export async function runBasicScan(scanId: number, url: string) {
  // mark running
  await setScan(scanId, { status: "running", progress: 10 });
  await setJob(scanId, { status: "running" });

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });

    await setScan(scanId, { progress: 40 });

    const headers = res.headers;

    const checks = [
      {
        header: "strict-transport-security",
        sev: "medium" as Severity,
        title: "Missing HSTS (Strict-Transport-Security)",
        why: "HSTS helps enforce HTTPS and reduces downgrade/SSL stripping risk.",
      },
      {
        header: "content-security-policy",
        sev: "medium" as Severity,
        title: "Missing Content-Security-Policy (CSP)",
        why: "CSP helps reduce XSS impact by restricting what the page can load/execute.",
      },
      {
        header: "x-content-type-options",
        sev: "low" as Severity,
        title: "Missing X-Content-Type-Options",
        why: "Prevents some MIME-sniffing behaviors.",
      },
      {
        header: "x-frame-options",
        sev: "low" as Severity,
        title: "Missing X-Frame-Options",
        why: "Helps reduce clickjacking risk (CSP frame-ancestors is better).",
      },
      {
        header: "referrer-policy",
        sev: "info" as Severity,
        title: "Missing Referrer-Policy",
        why: "Controls how much referrer info is sent to other sites.",
      },
      {
        header: "permissions-policy",
        sev: "info" as Severity,
        title: "Missing Permissions-Policy",
        why: "Lets you restrict browser features (camera, mic, etc.).",
      },
    ];

    for (const c of checks) {
      const v = h(headers, c.header);
      if (!v) {
        await addFinding({
          scanId,
          severity: c.sev,
          title: c.title,
          description: c.why,
          evidence: `Header not present: ${c.header}`,
        });
      }
    }

    // fingerprinting headers
    const server = h(headers, "server");
    if (server) {
      await addFinding({
        scanId,
        severity: "info",
        title: "Server header is exposed",
        description: "Exposing server details can aid fingerprinting.",
        evidence: server,
      });
    }

    const poweredBy = h(headers, "x-powered-by");
    if (poweredBy) {
      await addFinding({
        scanId,
        severity: "low",
        title: "X-Powered-By header is exposed",
        description: "Exposing framework/runtime details can aid fingerprinting.",
        evidence: poweredBy,
      });
    }

    await setScan(scanId, { progress: 90 });

    // done
    await setScan(scanId, { status: "done", progress: 100 });
    await setJob(scanId, { status: "done" });
  } catch (e: any) {
    await addFinding({
      scanId,
      severity: "high",
      title: "Scan failed",
      description: "The scanner could not complete the request.",
      evidence: String(e?.message ?? e),
    });

    await setScan(scanId, { status: "failed", progress: 100 });
    await setJob(scanId, { status: "failed" });
  }
}
