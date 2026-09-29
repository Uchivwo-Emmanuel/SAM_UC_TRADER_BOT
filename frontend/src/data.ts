import type { DashboardData, FeedbackReport, Market, Order, Point, Position, RiskStatus, StrategyStatus, SystemEvent } from "./types";

const now = new Date().toISOString();
export const dashboard: DashboardData = { balance: 1024.8, dailyPnl: 18.42, openPositions: 2, winRate: 58.3, activeStrategy: "Awaiting approved strategy", accountMode: "DEMO", health: "Healthy", risk: "New entries guarded", lastUpdated: now };
export const positions: Position[] = [
  { id: "POS-1042", instrument: "XAUUSD", side: "Buy", size: "0.01", entry: 3008.42, mark: 3014.8, stopLoss: 3001.2, takeProfit: 3024.5, pnl: 6.38, openedAt: "Today, 10:12" },
  { id: "POS-1041", instrument: "VOLATILITY_100", side: "Sell", size: "0.20", entry: 842.15, mark: 840.7, stopLoss: 849.5, takeProfit: 831.2, pnl: 2.9, openedAt: "Today, 08:49" },
];
export const orders: Order[] = [
  { id: "ORD-7721", instrument: "XAUUSD", strategy: "Breakout confirmation", outcome: "Win", side: "Buy", openedAt: "19 Sep, 10:12", closedAt: "19 Sep, 13:44", pnl: 6.38 },
  { id: "ORD-7719", instrument: "JUMP_50", strategy: "Range response", outcome: "Loss", side: "Sell", openedAt: "18 Sep, 14:26", closedAt: "18 Sep, 15:09", pnl: -2.18 },
  { id: "ORD-7717", instrument: "VOLATILITY_100", strategy: "Breakout confirmation", outcome: "Win", side: "Buy", openedAt: "18 Sep, 09:20", closedAt: "18 Sep, 12:02", pnl: 5.06 },
  { id: "ORD-7716", instrument: "XAUUSD", strategy: "Range response", outcome: "Loss", side: "Sell", openedAt: "17 Sep, 16:41", closedAt: "17 Sep, 17:12", pnl: -1.75 },
];
export const markets: Market[] = [
  { symbol: "XAUUSD", name: "Gold / US Dollar", price: 3014.8, change: 0.42, updatedAt: "Just now", status: "Live" },
  { symbol: "VOLATILITY_100", name: "Volatility 100 Index", price: 840.7, change: -0.17, updatedAt: "4 sec ago", status: "Live" },
  { symbol: "JUMP_50", name: "Jump 50 Index", price: 245.62, change: 0.08, updatedAt: "7 min ago", status: "Stale" },
];
export const pricePoints: Point[] = [3001, 3004, 3003, 3009, 3007, 3012, 3010, 3014, 3015].map((value, index) => ({ label: `${8 + index}:00`, value }));
export const performancePoints: Point[] = [0, 2.4, 1.2, 4.1, 3.4, 7.1, 8.6, 7.9, 11.3].map((value, index) => ({ label: `D${index + 1}`, value }));
export const strategyStatus: StrategyStatus = { name: "MSNR / CRT", version: "0.0.0-pending-specification", state: "Pending specification", provenance: "Partner rules not yet supplied", lastEvaluation: "No evaluation; strategy cannot emit trades", parameters: [{ name: "Allowed instruments", value: "Not approved" }, { name: "Entry timeframe", value: "Not supplied" }, { name: "Stop loss", value: "Not supplied" }, { name: "Take profit", value: "Not supplied" }] };
export const riskStatus: RiskStatus = { accountMode: "DEMO", dailyLossUsed: 0, dailyLossLimit: 50, positionsUsed: 2, positionsLimit: 3, killSwitch: "Armed", rejections: [{ at: "Today, 09:32 WAT", reason: "Strategy version is not approved", reference: "RSK-0118" }, { at: "Yesterday, 17:06 WAT", reason: "Market data stale", reference: "RSK-0117" }] };
export const systemEvents: SystemEvent[] = [
  { id: "EVT-0104", occurredAt: "Today, 10:14 WAT", category: "Worker", severity: "Info", title: "Market monitor awaiting broker stream", details: "No Deriv demo credentials have been configured." },
  { id: "EVT-0103", occurredAt: "Today, 09:32 WAT", category: "Risk", severity: "Warning", title: "Signal rejected", details: "Unapproved strategy version cannot progress to paper execution." },
  { id: "EVT-0102", occurredAt: "Yesterday, 17:06 WAT", category: "Connection", severity: "Warning", title: "Market observation marked stale", details: "Safe mode paused new signal evaluation." },
  { id: "EVT-0101", occurredAt: "Yesterday, 16:55 WAT", category: "Strategy", severity: "Info", title: "CRT placeholder registered", details: "No entry or exit rules are present in the version." },
];
export const feedbackReports: FeedbackReport[] = [
  { id: "RPT-2026-09-27", date: "27 Sep 2026", strategyVersion: "No approved strategy", status: "Awaiting data", summary: "No broker-backed trade log was available for analysis.", trades: { total: 0, wins: 0, losses: 0 }, sections: [{ title: "Evidence", content: ["No authenticated market or trade records were supplied to the analysis boundary."] }, { title: "Limitations", content: ["This is a mock display. It is not AI-generated advice or a strategy proposal."] }] },
  { id: "RPT-2026-09-26", date: "26 Sep 2026", strategyVersion: "No approved strategy", status: "Awaiting data", summary: "Report generation is waiting for the internal analysis endpoint.", trades: { total: 0, wins: 0, losses: 0 }, sections: [{ title: "Observations", content: ["No observations can be made before a strategy and demo market feed are available."] }, { title: "Recommendations", content: ["Supply the strategy specification; do not treat this report as a recommendation to trade."] }] },
];

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => dashboard,
  getPositions: async (): Promise<Position[]> => positions,
  getOrders: async (): Promise<Order[]> => orders,
  getMarkets: async (): Promise<Market[]> => markets,
  getStrategy: async (): Promise<StrategyStatus> => strategyStatus,
  getRisk: async (): Promise<RiskStatus> => riskStatus,
  getEvents: async (): Promise<SystemEvent[]> => systemEvents,
  getFeedback: async (): Promise<FeedbackReport[]> => feedbackReports,
};
