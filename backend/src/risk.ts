export type RiskInput = { killSwitch: boolean; openPositions: number; dailyLossPercent: number; tradesToday: number; maxOpenPositions: number; maxDailyLossPercent: number; maxTradesPerDay: number };
export const checkRisk = (input: RiskInput) => {
  if (input.killSwitch) return { ok: false, reason: "kill_switch" };
  if (input.openPositions >= input.maxOpenPositions) return { ok: false, reason: "max_open_positions" };
  if (input.dailyLossPercent >= input.maxDailyLossPercent) return { ok: false, reason: "max_daily_loss" };
  if (input.tradesToday >= input.maxTradesPerDay) return { ok: false, reason: "max_trades_per_day" };
  return { ok: true as const };
};
