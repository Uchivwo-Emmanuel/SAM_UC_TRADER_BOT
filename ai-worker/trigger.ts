import { schedules } from "@trigger.dev/sdk";
import { runDailyAnalysis, runWeeklySynthesis, triggerSchedule, weeklyTriggerSchedule } from "./src/worker.js";

/** Deploy in the isolated worker project. The backend rejects duplicate date submissions. */
export const dailyAnalysis = schedules.task({
  id: "daily-analysis", cron: { pattern: triggerSchedule.cron, timezone: triggerSchedule.timezone },
  retry: { maxAttempts: triggerSchedule.maxAttempts },
  run: async () => runDailyAnalysis(process.env),
});
export const weeklySynthesis = schedules.task({ id: "weekly-analysis-synthesis", cron: { pattern: weeklyTriggerSchedule.cron, timezone: weeklyTriggerSchedule.timezone }, retry: { maxAttempts: weeklyTriggerSchedule.maxAttempts }, run: async () => runWeeklySynthesis(process.env) });
