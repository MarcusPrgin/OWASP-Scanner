import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const scans = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  status: text("status", { enum: ["queued", "running", "done", "error"] })
    .notNull()
    .default("queued"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const findings = sqliteTable("findings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: integer("scan_id").notNull(),
  severity: text("severity", { enum: ["info", "low", "medium", "high"] })
    .notNull()
    .default("info"),
  title: text("title").notNull(),
  evidence: text("evidence").notNull().default(""),
});
