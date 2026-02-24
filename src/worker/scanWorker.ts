import { db } from "../db";
import { scans, scanJobs, findings } from "../db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { runPassiveScan } from "../scanner/runScan";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function claimNextJob() {
  // Find one queued job not locked
  const job = await db
    .select()
    .from(scanJobs)
    .where(and(eq(scanJobs.status, "queued"), isNull(scanJobs.lockedAt)))
    .orderBy(asc(scanJobs.id))
    .limit(1);

  if (job.length === 0) return null;

  const j = job[0];
  const now = new Date();

  // Lock + mark running
  db.update(scanJobs)
    .set({ status: "running", lockedAt: now })
    .where(eq(scanJobs.id, j.id))
    .run();

  db.update(scans)
    .set({ status: "running", startedAt: now, progress: 1 })
    .where(eq(scans.id, j.scanId))
    .run();

  return j;
}

async function runOneJob(job: { id: number; scanId: number }) {
  const scanRow = await db.select().from(scans).where(eq(scans.id, job.scanId)).limit(1);
  if (scanRow.length === 0) throw new Error("Scan not found");

  const targetUrl = scanRow[0].url;

  // Clear old findings (in case of re-run)
  db.delete(findings).where(eq(findings.scanId, job.scanId)).run();

  const found = await runPassiveScan(targetUrl, (p) => {
    db.update(scans).set({ progress: p }).where(eq(scans.id, job.scanId)).run();
  });

  for (const f of found) {
    db.insert(findings)
      .values({
        scanId: job.scanId,
        severity: f.severity,
        category: f.category,
        title: f.title,
        description: f.description ?? "",
        evidence: f.evidence ?? "",
      })
      .run();
  }

  const doneTime = new Date();

  db.update(scans)
    .set({ status: "done", finishedAt: doneTime, progress: 100 })
    .where(eq(scans.id, job.scanId))
    .run();

  db.update(scanJobs)
    .set({ status: "done" })
    .where(eq(scanJobs.id, job.id))
    .run();
}

async function main() {
  // Basic loop
  while (true) {
    const job = await claimNextJob();

    if (!job) {
      await sleep(800);
      continue;
    }

    try {
      await runOneJob(job as any);
    } catch (e: any) {
      const msg = String(e?.message ?? e);

      db.update(scans)
        .set({ status: "error", errorMessage: msg, finishedAt: new Date() })
        .where(eq(scans.id, (job as any).scanId))
        .run();

      db.update(scanJobs)
        .set({ status: "error" })
        .where(eq(scanJobs.id, (job as any).id))
        .run();
    }
  }
}

main();
