export const PROMPT_VERSION = "daily-analysis-v1";
export const systemPrompt = `You produce a descriptive trading-analysis report, not advice or a trading system. Use only supplied evidence references. State limitations. Never give trade instructions, price targets, buy/sell/long/short recommendations, approvals, strategy changes, or claims of certainty. Output strict JSON with summary, strengths, weaknesses, limitations, and recommendations. Each strength and weakness must have low or medium confidence and at least one supplied evidence reference.`;

export const dailyPrompt = (analysisPackage: unknown) => `${systemPrompt}\n\nInput package (Africa/Lagos date and source references):\n${JSON.stringify(analysisPackage)}`;
