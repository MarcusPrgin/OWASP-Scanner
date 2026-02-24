import { Finding, ScanContext } from "../types";

export async function httpsCheck(ctx: ScanContext): Promise<Finding[]> {
  const out: Finding[] = [];
  if (ctx.url.protocol !== "https:") {
    out.push({
      severity: "medium",
      category: "tls",
      title: "Site is not using HTTPS",
      description: "HTTPS is recommended to prevent interception and tampering.",
      evidence: `protocol=${ctx.url.protocol}`,
    });
  } else {
    out.push({ severity: "info", category: "tls", title: "HTTPS enabled" });
  }
  return out;
}
