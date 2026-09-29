import { transitionOrder, type OrderState } from "./order-state.js";
export const executePaperOrder = (state: OrderState) => ({ state: transitionOrder(state, "submitted"), execution: "paper" as const, brokerCalled: false });
export const evaluateProtection = (side: "buy"|"sell", price: number, stopLoss: number, takeProfit: number) => side === "buy" ? (price <= stopLoss ? "stop_loss" : price >= takeProfit ? "take_profit" : null) : (price >= stopLoss ? "stop_loss" : price <= takeProfit ? "take_profit" : null);
