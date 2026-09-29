export type Role = "owner" | "viewer";
export type Tone = "positive" | "negative" | "neutral" | "warning";
export type View = "overview" | "positions" | "history" | "markets" | "strategy" | "risk" | "events" | "reports";

export interface Position { id: string; instrument: string; side: "Buy" | "Sell"; size: string; entry: number; mark: number; stopLoss: number; takeProfit: number; pnl: number; openedAt: string; }
export interface Order { id: string; instrument: string; strategy: string; outcome: "Win" | "Loss" | "Open"; side: "Buy" | "Sell"; openedAt: string; closedAt?: string; pnl: number; }
export interface Market { symbol: string; name: string; price: number; change: number; updatedAt: string; status: "Live" | "Stale"; }
export interface Point { label: string; value: number; }
export interface DashboardData { balance: number; dailyPnl: number; openPositions: number; winRate: number; activeStrategy: string; accountMode: "DEMO" | "LIVE"; health: "Healthy" | "Attention"; risk: string; lastUpdated: string; }
export interface StrategyStatus { name: string; version: string; state: "Pending specification" | "Paper testing" | "Approved"; provenance: string; lastEvaluation: string; parameters: Array<{ name: string; value: string }>; }
export interface RiskStatus { accountMode: "DEMO" | "PAPER" | "LIVE"; dailyLossUsed: number; dailyLossLimit: number; positionsUsed: number; positionsLimit: number; killSwitch: "Armed" | "Activated"; rejections: Array<{ at: string; reason: string; reference: string }>; }
export interface SystemEvent { id: string; occurredAt: string; category: "Connection" | "Risk" | "Strategy" | "Worker"; severity: "Info" | "Warning" | "Critical"; title: string; details: string; }
export interface FeedbackReport { id: string; date: string; strategyVersion: string; status: "Generated" | "Awaiting data" | "Reviewed"; summary: string; trades: { total: number; wins: number; losses: number }; sections: Array<{ title: string; content: string[] }>; }
export type RealtimeState = "mock" | "connecting" | "connected" | "stale" | "offline";
