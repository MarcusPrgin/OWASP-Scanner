export type FindingInput = {
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
};

export async function runPassiveScan(url: string): Promise<{
  findings: FindingInput[];
  status: "done" | "failed";
}> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    const findings: FindingInput[] = [];
    const headers = res.headers;

    if (!headers.get("content-security-policy")) {
      findings.push({
        title: "Missing Content-Security-Policy",
        severity: "medium",
        description:
          "No CSP header detected. Consider adding one to reduce XSS risk.",
      });
    }

    if (!headers.get("strict-transport-security")) {
      findings.push({
        title: "Missing HSTS",
        severity: "low",
        description:
          "No Strict-Transport-Security header detected.",
      });
    }

    if (!headers.get("x-frame-options")) {
      findings.push({
        title: "Missing X-Frame-Options",
        severity: "low",
        description:
          "No X-Frame-Options header detected.",
      });
    }

    if (!res.ok) {
      findings.push({
        title: `Non-200 response (${res.status})`,
        severity: "low",
        description: `The server responded with HTTP ${res.status}.`,
      });
    }

    return { findings, status: "done" };
  } catch {
    return {
      findings: [
        {
          title: "Request failed",
          severity: "high",
          description:
            "Could not fetch the target URL. It may block bots or be offline.",
        },
      ],
      status: "failed",
    };
  }
}
