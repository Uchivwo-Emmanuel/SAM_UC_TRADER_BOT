import assert from "node:assert/strict";
import { runDailyAnalysis } from "../src/worker.js";

const environment = { ANALYSIS_ENABLED: "false", ANALYSIS_BACKEND_URL: "https://backend.example.test", ANALYSIS_SERVICE_TOKEN: "x".repeat(32), ANALYSIS_MODEL_API_URL: "https://model.example.test", ANALYSIS_MODEL_API_KEY: "y".repeat(20), ANALYSIS_MODEL: "test-model" };
const noFetch = (() => { throw new Error("must not fetch"); }) as typeof fetch;
assert.deepEqual(await runDailyAnalysis(environment, "2026-09-20", noFetch), { skipped: true, reason: "analysis feature is disabled" });
const calls: string[] = [];
const fetcher = async (url: string | URL, init?: RequestInit) => { calls.push(String(url)); if (String(url).includes("/daily")) return new Response(JSON.stringify({ contractVersion: "1", date: "2026-09-20", timezone: "Africa/Lagos", trades: [], balances: [], riskEvents: [], strategyVersion: null, dataGaps: ["No data"], sourceReferences: [] })); if (String(url).includes("model")) return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ summary: "No conclusion.", strengths: [], weaknesses: [], limitations: ["No data"], recommendations: [] }) } }] })); assert.deepEqual(init?.headers, { "content-type": "application/json", "x-analysis-service-token": environment.ANALYSIS_SERVICE_TOKEN }); return new Response(JSON.stringify({ created: true })); };
await runDailyAnalysis({ ...environment, ANALYSIS_ENABLED: "true" }, "2026-09-20", fetcher as typeof fetch);
assert.deepEqual(calls, ["https://backend.example.test/internal/analysis/daily?date=2026-09-20", "https://model.example.test", "https://backend.example.test/internal/analysis/reports"]);
console.log("AI worker verification passed");
