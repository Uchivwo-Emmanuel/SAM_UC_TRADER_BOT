import { createHash } from "node:crypto";
import { workerConfigSchema, type WorkerConfig } from "./config.js";
import { dailyPrompt, PROMPT_VERSION } from "./prompts.js";

type FetchLike = typeof fetch;
const watToday = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
const headers = (config: WorkerConfig) => ({ "content-type": "application/json", "x-analysis-service-token": config.ANALYSIS_SERVICE_TOKEN });
const responseJson = async (response: Response) => { if (!response.ok) throw new Error(`restricted API request failed: ${response.status}`); return response.json() as Promise<unknown>; };

/** Trigger.dev task body: no Drizzle import, DB configuration, browser/session data, or broker client. */
const runAnalysis = async (environment: NodeJS.ProcessEnv, reportType: "daily" | "weekly", date: string, fetchImpl: FetchLike = fetch) => {
  const config = workerConfigSchema.parse(environment);
  if (!config.ANALYSIS_ENABLED) return { skipped: true, reason: "analysis feature is disabled" };
  const query = reportType === "daily" ? `daily?date=${encodeURIComponent(date)}` : `weekly?weekEnding=${encodeURIComponent(date)}`;
  const input = await responseJson(await fetchImpl(`${config.ANALYSIS_BACKEND_URL}/internal/analysis/${query}`, { headers: { "x-analysis-service-token": config.ANALYSIS_SERVICE_TOKEN } }));
  const modelResponse = await responseJson(await fetchImpl(config.ANALYSIS_MODEL_API_URL, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${config.ANALYSIS_MODEL_API_KEY}` }, body: JSON.stringify({ model: config.ANALYSIS_MODEL, response_format: { type: "json_object" }, messages: [{ role: "system", content: dailyPrompt(input) }] }) }));
  const raw = modelResponse as { choices?: Array<{ message?: { content?: string } }> };
  const content = raw.choices?.[0]?.message?.content;
  if (!content) throw new Error("model response did not contain JSON content");
  const output = JSON.parse(content) as unknown;
  const result = await responseJson(await fetchImpl(`${config.ANALYSIS_BACKEND_URL}/internal/analysis/reports`, { method: "POST", headers: headers(config), body: JSON.stringify({ reportType, date, output, model: config.ANALYSIS_MODEL, modelVersion: PROMPT_VERSION, sourcePackage: input }) }));
  return { skipped: false, inputHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"), result };
};

export const runDailyAnalysis = (environment: NodeJS.ProcessEnv, date = watToday(), fetchImpl: FetchLike = fetch) => runAnalysis(environment, "daily", date, fetchImpl);
export const runWeeklySynthesis = (environment: NodeJS.ProcessEnv, weekEnding = watToday(), fetchImpl: FetchLike = fetch) => runAnalysis(environment, "weekly", weekEnding, fetchImpl);

/** Register this exported handler as a Trigger.dev cron task: `0 1 * * *` in Africa/Lagos. Trigger retries are safe because backend persistence has a unique (type, date) constraint. */
export const triggerSchedule = { cron: "0 1 * * *", timezone: "Africa/Lagos", maxAttempts: 3 };
export const weeklyTriggerSchedule = { cron: "0 2 * * 1", timezone: "Africa/Lagos", maxAttempts: 3 };
