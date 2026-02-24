import { Finding, ScanContext } from "../types";

const required = [
  { name: "strict-transport-security", sev: "medium" as const, title: "Missing HSTS header" },
  { name: "content-security-policy", sev: "medium" as const, title: "Missing Content-Security-Policy" },
  { name: "x-content-type-options", sev: "low" as const, title: "Missing X-Content-Type-Options" },
  { name: "referrer-policy", sev: "low" as const, title: "Missing Referrer-Policy" },
];

export async function securityHeaders(ctx: ScanContext): Promise<Finding[]> {
  const res = ctx.response;
  if (!res) return [{ severity: "high", category: "headers", title: "No HTTP response", description: "Fetch failed." }];

  const h = res.headers;
  const out: Finding[] = [];

  for (const r of required) {
    if (!h.get(r.name)) {
      out.push({
        severity: r.sev,
        category: "headers",
        title: r.title,
        description: `Header "${r.name}" is not present.`,
      });
    } else {
      out.push({
        severity: "info",
        category: "headers",
        title: `Header present: ${r.name}`,
      });
    }
  }

  return out;
}
