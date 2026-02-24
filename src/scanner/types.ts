export type Severity = "info" | "low" | "medium" | "high";

export type Finding = {
  severity: Severity;
  category: string;
  title: string;
  description?: string;
  evidence?: string;
};

export type ScanContext = {
  url: URL;
  response?: Response;
  html?: string;
};
