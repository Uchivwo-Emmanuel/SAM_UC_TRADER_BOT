import cors from "cors";
import express from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { requireOwner, requireSession } from "./auth-middleware.js";
import { checkDatabase } from "./db.js";
import { config } from "./config.js";
import { getDailyAnalysisPackage, getWeeklyAnalysisPackage, listPublishedReports, reportSubmissionSchema, reviewReport, storeReport } from "./analysis.js";
import { analysisReports } from "./schema.js";
import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { requireAnalysisService } from "./analysis-auth.js";
import { beginDerivOAuth, completeDerivOAuth, getDerivOAuthStatus } from "./deriv-oauth.js";
import { z } from "zod";

const app = express();
const logger = pino({ level: config.LOG_LEVEL });
const allowedOrigins = [...new Set([config.CORS_ORIGIN, config.BETTER_AUTH_TRUSTED_ORIGINS].filter(Boolean).flatMap((value) => value!.split(",")).map((origin) => origin.trim()).filter(Boolean))];
app.use(pinoHttp({ logger }));
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), credentials: true }));
app.get("/health", (_req, res) => res.json({ status: "ok", environment: config.NODE_ENV, version: "0.1.0", trading: "disabled" }));
app.get("/ready", async (_req, res) => {
  try { await checkDatabase(); return res.json({ status: "ready", trading: "disabled" }); }
  catch { return res.status(503).json({ status: "unavailable", trading: "disabled" }); }
});
// This callback is owned by the Deriv OAuth integration, not Better Auth.
// It must be registered first so the catch-all Better Auth handler cannot
// consume it and return a 404.
app.get("/api/auth/deriv/callback", completeDerivOAuth);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "128kb" }));
app.get("/api/me", requireSession, (_request, response) => response.json(response.locals.session));
app.get("/api/integrations/deriv/oauth/authorize", requireOwner, beginDerivOAuth);
app.get("/api/integrations/deriv/oauth/status", requireOwner, async (_request, response, next) => {
  try { response.json(await getDerivOAuthStatus(response.locals.session.user.id)); } catch (error) { next(error); }
});
app.get("/api/system/status", requireSession, (_request, response) => response.json({ trading: "disabled", derivMode: "unconfigured", marketData: "unconfigured" }));
app.get("/internal/analysis/daily", requireAnalysisService, async (request, response, next) => {
  try { response.json(await getDailyAnalysisPackage(String(request.query.date ?? ""))); } catch (error) { next(error); }
});
app.get("/internal/analysis/weekly", requireAnalysisService, async (request, response, next) => {
  try { response.json(await getWeeklyAnalysisPackage(String(request.query.weekEnding ?? ""))); } catch (error) { next(error); }
});
app.post("/internal/analysis/reports", requireAnalysisService, async (request, response, next) => {
  try { const input = reportSubmissionSchema.parse(request.body); const result = await storeReport(input); response.status(result.created ? 201 : 200).json({ status: result.status, created: result.created, reportId: result.report?.id }); } catch (error) { next(error); }
});
app.get("/api/analysis/reports", requireSession, async (_request, response, next) => { try { response.json(await listPublishedReports()); } catch (error) { next(error); } });
app.get("/api/analysis/reports/:id/download", requireSession, async (request, response, next) => {
  try { const reportId = z.string().uuid().parse(request.params.id); const format = request.query.format === "txt" ? "txt" : "md"; const [report] = await db.select().from(analysisReports).where(eq(analysisReports.id, reportId)).limit(1); if (!report || report.status !== "published") return response.sendStatus(404); response.setHeader("Content-Type", format === "txt" ? "text/plain; charset=utf-8" : "text/markdown; charset=utf-8"); response.setHeader("Content-Disposition", `attachment; filename="${report.reportType}-analysis-${report.reportDate}.${format}"`); response.send(report.markdown); } catch (error) { next(error); }
});
app.post("/api/analysis/reports/:id/reviews", requireOwner, async (request, response, next) => {
  try { const reportId = z.string().uuid().parse(request.params.id); const body = z.object({ decision: z.enum(["reviewed", "accepted", "rejected", "needs_discussion"]), notes: z.string().max(2000).optional() }).parse(request.body); const review = await reviewReport(reportId, response.locals.session.user.id, body.decision, body.notes); response.status(201).json(review); } catch (error) { next(error); }
});
app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => { void next; logger.warn({ error: error instanceof Error ? error.message : "request rejected" }, "safe request failure"); response.status(400).json({ error: "request could not be processed" }); });
app.listen(config.PORT, config.BIND_HOST, () => logger.info({ host: config.BIND_HOST, port: config.PORT }, "backend listening"));
