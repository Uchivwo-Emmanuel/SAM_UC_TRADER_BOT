import { createHash, randomUUID } from "node:crypto";
import { and, asc, eq, gte, lt, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db.js";
import { analysisReports, auditEvents, balances, positions, reportReviews } from "./schema.js";

export const ANALYSIS_PROMPT_VERSION = "daily-analysis-v1";
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const sourceReference = z.object({ type: z.enum(["position", "balance", "audit_event", "analysis_report"]), id: z.string().uuid() });

/** The only data contract exposed to the database-free analysis worker. */
export const analysisPackageSchema = z.object({
  contractVersion: z.literal("1"), date: isoDate, timezone: z.literal("Africa/Lagos"),
  trades: z.array(z.object({ sourceId: z.string().uuid(), openedAt: z.string(), closedAt: z.string().nullable(), entryPrice: z.string().nullable(), exitPrice: z.string().nullable() })).max(500),
  balances: z.array(z.object({ sourceId: z.string().uuid(), recordedAt: z.string(), amount: z.string(), currency: z.string() })).max(500),
  riskEvents: z.array(z.object({ sourceId: z.string().uuid(), action: z.string(), occurredAt: z.string() })).max(500),
  dailyReportSummaries: z.array(z.object({ sourceId: z.string().uuid(), date: isoDate, content: z.unknown() })).max(7).default([]),
  strategyVersion: z.string().nullable(), dataGaps: z.array(z.string()).max(20), sourceReferences: z.array(sourceReference).max(1500),
});
export type AnalysisPackage = z.infer<typeof analysisPackageSchema>;

const observation = z.object({ claim: z.string().min(1).max(800), evidence: z.array(sourceReference).min(1).max(20), confidence: z.enum(["low", "medium"]) });
export const analysisOutputSchema = z.object({
  summary: z.string().min(1).max(2000), strengths: z.array(observation).max(20), weaknesses: z.array(observation).max(20),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(20), recommendations: z.array(z.string().min(1).max(500)).max(20),
}).strict();
export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;
export const reportSubmissionSchema = z.object({ reportType: z.enum(["daily", "weekly"]), date: isoDate, output: z.unknown(), model: z.string().min(1).max(200), modelVersion: z.string().max(200).optional(), sourcePackage: analysisPackageSchema });

const forbidden = /\b(buy|sell|long|short|open (a )?position|place (an? )?order|execute|guaranteed|certain profit)\b/i;
export const validateAnalysisOutput = (value: unknown, allowedSources: Set<string>) => {
  const parsed = analysisOutputSchema.safeParse(value);
  if (!parsed.success) return { ok: false as const, reason: "output does not match the report schema" };
  const claims = [...parsed.data.strengths, ...parsed.data.weaknesses];
  if (claims.some((item) => item.confidence !== "low" && item.confidence !== "medium")) return { ok: false as const, reason: "unsupported confidence" };
  if (claims.some((item) => item.evidence.some((ref) => !allowedSources.has(ref.id)))) return { ok: false as const, reason: "unknown evidence reference" };
  if (parsed.data.recommendations.some((item) => forbidden.test(item))) return { ok: false as const, reason: "unsafe execution recommendation" };
  return { ok: true as const, data: parsed.data };
};

const nigeriaRange = (day: string) => {
  const checked = isoDate.parse(day);
  const start = new Date(`${checked}T00:00:00+01:00`);
  const end = new Date(start.getTime() + 86_400_000);
  return { start, end };
};

export const getDailyAnalysisPackage = async (day: string): Promise<AnalysisPackage> => {
  const { start, end } = nigeriaRange(day);
  const [tradeRows, balanceRows, riskRows] = await Promise.all([
    db.select({ id: positions.id, openedAt: positions.openedAt, closedAt: positions.closedAt, entryPrice: positions.entryPrice, exitPrice: positions.exitPrice }).from(positions).where(and(gte(positions.openedAt, start), lt(positions.openedAt, end))).limit(500),
    db.select({ id: balances.id, recordedAt: balances.recordedAt, amount: balances.amount, currency: balances.currency }).from(balances).where(and(gte(balances.recordedAt, start), lt(balances.recordedAt, end))).limit(500),
    db.select({ id: auditEvents.id, action: auditEvents.action, createdAt: auditEvents.createdAt }).from(auditEvents).where(and(gte(auditEvents.createdAt, start), lt(auditEvents.createdAt, end))).limit(500),
  ]);
  const riskEvents = riskRows.filter((row) => row.action.startsWith("risk.")).map((row) => ({ sourceId: row.id, action: row.action, occurredAt: row.createdAt.toISOString() }));
  const sourceReferences = [
    ...tradeRows.map((row) => ({ type: "position" as const, id: row.id })), ...balanceRows.map((row) => ({ type: "balance" as const, id: row.id })), ...riskEvents.map((row) => ({ type: "audit_event" as const, id: row.sourceId })),
  ];
  return analysisPackageSchema.parse({ contractVersion: "1", date: day, timezone: "Africa/Lagos", strategyVersion: null,
    trades: tradeRows.map((row) => ({ sourceId: row.id, openedAt: row.openedAt.toISOString(), closedAt: row.closedAt?.toISOString() ?? null, entryPrice: row.entryPrice, exitPrice: row.exitPrice })),
    balances: balanceRows.map((row) => ({ sourceId: row.id, recordedAt: row.recordedAt.toISOString(), amount: row.amount, currency: row.currency })), riskEvents, dailyReportSummaries: [], sourceReferences,
    dataGaps: ["Strategy version is not joined to positions in the current trading schema.", ...(tradeRows.length === 500 || balanceRows.length === 500 || riskRows.length === 500 ? ["Result limit reached; report is incomplete."] : [])],
  });
};

/** Weekly synthesis sees only approved daily report IDs and their safe structured content. */
export const getWeeklyAnalysisPackage = async (weekEnding: string): Promise<AnalysisPackage> => {
  isoDate.parse(weekEnding);
  const start = new Date(`${weekEnding}T12:00:00Z`); start.setUTCDate(start.getUTCDate() - 6);
  const startDate = start.toISOString().slice(0, 10);
  const rows = await db.select({ id: analysisReports.id, reportDate: analysisReports.reportDate, content: analysisReports.content }).from(analysisReports).where(and(eq(analysisReports.reportType, "daily"), eq(analysisReports.status, "published"), gte(analysisReports.reportDate, startDate), lte(analysisReports.reportDate, weekEnding))).limit(7);
  return analysisPackageSchema.parse({ contractVersion: "1", date: weekEnding, timezone: "Africa/Lagos", trades: [], balances: [], riskEvents: [], dailyReportSummaries: rows.map((row) => ({ sourceId: row.id, date: row.reportDate, content: row.content })), strategyVersion: null, dataGaps: ["Weekly synthesis is limited to approved daily reports and must preserve their stated limitations."], sourceReferences: rows.map((row) => ({ type: "analysis_report", id: row.id })) });
};

export const renderMarkdown = (report: AnalysisOutput) => ["# Daily analysis", "", "## Summary", report.summary, "", "## Strengths", ...report.strengths.map((x) => `- ${x.claim}`), "", "## Weaknesses", ...report.weaknesses.map((x) => `- ${x.claim}`), "", "## Limitations", ...report.limitations.map((x) => `- ${x}`), "", "## Non-executing recommendations", ...report.recommendations.map((x) => `- ${x}`)].join("\n");
const inputHash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export const storeReport = async (input: { reportType: "daily" | "weekly"; date: string; output: unknown; model: string; modelVersion?: string; sourcePackage: AnalysisPackage }) => {
  const packageData = analysisPackageSchema.parse(input.sourcePackage);
  if (packageData.date !== input.date) throw new Error("report date must match its analysis package");
  const verdict = validateAnalysisOutput(input.output, new Set(packageData.sourceReferences.map((ref) => ref.id)));
  const status = verdict.ok ? "published" : "held_for_review";
  const content = verdict.ok ? verdict.data : { limitations: ["Output was withheld for human review."], failureReason: verdict.reason };
  const markdown = verdict.ok ? renderMarkdown(verdict.data) : "# Analysis held for review\n\nThis output failed validation and is not published.";
  const [created] = await db.insert(analysisReports).values({ reportType: input.reportType, reportDate: input.date, status, content, markdown, promptVersion: ANALYSIS_PROMPT_VERSION, model: input.model, modelVersion: input.modelVersion, inputHash: inputHash(packageData), sourceReferences: packageData.sourceReferences, failureReason: verdict.ok ? null : verdict.reason }).onConflictDoNothing().returning();
  if (created) await db.insert(auditEvents).values({ id: randomUUID(), correlationId: randomUUID(), action: `analysis.report.${status}`, metadata: { reportId: created.id, reportType: input.reportType, date: input.date } });
  return { created: Boolean(created), report: created, status };
};

export const storeDailyReport = (input: Omit<Parameters<typeof storeReport>[0], "reportType">) => storeReport({ ...input, reportType: "daily" });

export const reviewReport = async (reportId: string, reviewerId: string, decision: "reviewed" | "accepted" | "rejected" | "needs_discussion", notes?: string) => {
  const [review] = await db.insert(reportReviews).values({ reportId, reviewerId, decision, notes }).returning();
  await db.insert(auditEvents).values({ id: randomUUID(), actorId: reviewerId, correlationId: randomUUID(), action: "analysis.report.reviewed", metadata: { reportId, decision } });
  return review;
};

export const listPublishedReports = () => db.select().from(analysisReports).where(eq(analysisReports.status, "published")).orderBy(asc(analysisReports.reportDate));
