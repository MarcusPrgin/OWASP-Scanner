import { Finding, ScanContext } from "../types";

export async function robotsCheck(ctx: ScanContext): Promise<Finding[]> {
  try {
    const robotsUrl = new URL("/robots.txt", ctx.url);
    const res = await fetch(robotsUrl.toString(), { redirect: "follow" });

    if (res.ok) {
      return [{ severity: "info", category: "discovery", title: "robots.txt found" }];
    }
    return [
      {
        severity: "info",
        category: "discovery",
        title: "robots.txt not found",
        evidence: `status=${res.status}`,
      },
    ];
  } catch (e: any) {
    return [
      {
        severity: "info",
        category: "discovery",
        title: "robots.txt check failed",
        evidence: String(e?.message ?? e),
      },
    ];
  }
}
