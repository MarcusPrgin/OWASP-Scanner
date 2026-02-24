import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import bcrypt from "bcryptjs";
// USERS
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  passwordHash: text("password_hash").notNull(),
});

// SESSIONS
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const scans = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  userId: integer("user_id").notNull(),

  // ✅ allow these exact statuses
  status: text("status", { enum: ["queued", "running", "done", "failed"] })
    .notNull()
    .default("queued"),

  progress: integer("progress").notNull().default(0),
  createdAt: integer("created_at").notNull().default(Date.now()),
});

// FINDINGS
export const findings = sqliteTable("findings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: integer("scan_id").notNull(),
  severity: text("severity", { enum: ["info", "low", "medium", "high"] })
    .notNull()
    .default("info"),
  category: text("category").notNull().default("general"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  evidence: text("evidence").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// JOBS
export const scanJobs = sqliteTable("scan_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scanId: integer("scan_id").notNull(),
  status: text("status", { enum: ["queued", "running", "done", "error"] })
    .notNull()
    .default("queued"),
  lockedAt: integer("locked_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
