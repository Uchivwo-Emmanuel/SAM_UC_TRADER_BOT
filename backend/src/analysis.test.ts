import { describe, expect, it } from "vitest";

const source = "11111111-1111-4111-8111-111111111111";
const base = { summary: "No material conclusion can be drawn from the limited data.", strengths: [{ claim: "Recorded balance data is available.", evidence: [{ type: "balance", id: source }], confidence: "low" }], weaknesses: [], limitations: ["The sample is incomplete."], recommendations: ["Collect more reviewed evidence before changing anything."] };

describe("analysis quality guardrails", () => {
  it("accepts evidence-bound descriptive output", async () => { process.env.CORS_ORIGIN ??= "http://localhost:5173"; process.env.DATABASE_URL ??= "postgres://test"; process.env.BETTER_AUTH_SECRET ??= "a".repeat(32); process.env.BETTER_AUTH_URL ??= "http://localhost:3000"; process.env.ANALYSIS_SERVICE_TOKEN ??= "b".repeat(32); const { validateAnalysisOutput } = await import("./analysis.js"); expect(validateAnalysisOutput(base, new Set([source]))).toMatchObject({ ok: true }); });
  it("holds output that gives an execution instruction", async () => { const { validateAnalysisOutput } = await import("./analysis.js"); expect(validateAnalysisOutput({ ...base, recommendations: ["Buy immediately."] }, new Set([source]))).toMatchObject({ ok: false, reason: "unsafe execution recommendation" }); });
  it("holds output that cites unavailable evidence", async () => { const { validateAnalysisOutput } = await import("./analysis.js"); expect(validateAnalysisOutput({ ...base, strengths: [{ ...base.strengths[0], evidence: [{ type: "balance", id: "22222222-2222-4222-8222-222222222222" }] }] }, new Set([source]))).toMatchObject({ ok: false, reason: "unknown evidence reference" }); });
});
