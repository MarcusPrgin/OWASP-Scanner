import { Finding, ScanContext } from "./types";
import { httpsCheck } from "./checks/https";
import { securityHeaders } from "./checks/securityHeaders";
import { robotsCheck } from "./checks/robots";

export async function runPassiveScan(rawUrl: string, onProgress?: (p: number) => void): Promise<Finding[]> {
  const url = new URL(rawUrl);
  const ctx: ScanContext = { url };

  onProgress?.(10);

  // Fetch HTML (basic)
  const res = await fetch(url.toString(), { redirect: "follow" });
  ctx.response = res;

  onProgress?.(35);

  // Optional: sample html (cap size)
  try {
    const txt = await res.text();
    ctx.html = txt.slice(0, 200_000);
  } catch {
    // ignore
  }

  onProgress?.(55);

  const findings: Finding[] = [];
  findings.push(...(await httpsCheck(ctx)));
  onProgress?.(70);

  findings.push(...(await securityHeaders(ctx)));
  onProgress?.(85);

  findings.push(...(await robotsCheck(ctx)));
  onProgress?.(95);

  findings.push({
    severity: "info",
    category: "mvp",
    title: "MVP note",
    description: "This scan runs passive checks only (no exploitation).",
  });

  onProgress?.(100);
  return findings;
}
