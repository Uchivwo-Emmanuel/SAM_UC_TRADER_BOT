import { z } from "zod";
export const strategyResult = z.object({
  action: z.enum(["buy", "sell", "none"]),
  reason: z.string(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  evidence: z.record(z.string(), z.unknown()).default({}),
});
export type StrategyResult = z.infer<typeof strategyResult>;
export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1";
export type Candle = {
  timeframe: Timeframe;
  openedAt: Date;
  closedAt: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};
/**
 * Only backend-produced observations are accepted. Candle history is required
 * for price-action strategies such as CRT and MSNR; a one-price tick is not
 * sufficient to create a signal.
 */
export type MarketObservation = {
  instrument: string;
  price: number;
  observedAt: Date;
  indicators: Record<string, number>;
  candles?: Partial<Record<Timeframe, Candle[]>>;
};
export interface Strategy { id: string; version: string; evaluate(observation: MarketObservation): StrategyResult; }
export class StrategyRegistry { #items = new Map<string, Strategy>(); register(strategy: Strategy) { this.#items.set(strategy.id, strategy); } get(id: string) { const value = this.#items.get(id); if (!value) throw new Error("strategy not registered"); return value; } }
export const noTradeStrategy: Strategy = { id: "no-trade", version: "1.0.0", evaluate: () => ({ action: "none", reason: "no-trade strategy", evidence: {} }) };

const pendingStrategy = (id: "msnr" | "crt", name: string): Strategy => ({
  id,
  version: "0.0.0-pending-specification",
  evaluate: () => ({
    action: "none",
    reason: `${name} is pending the trader-approved rule specification`,
    evidence: { strategyId: id, state: "pending_specification" },
  }),
});

/**
 * These entries make the requested strategy families visible to the registry
 * without guessing any entry, exit, or risk rule. They can never emit a trade.
 */
export const msnrStrategy = pendingStrategy("msnr", "MSNR");
export const crtStrategy = pendingStrategy("crt", "CRT (Candle Range Theory)");

export const registerBuiltInStrategies = (registry: StrategyRegistry) => {
  registry.register(noTradeStrategy);
  registry.register(msnrStrategy);
  registry.register(crtStrategy);
};
