export type OrderState = "requested" | "risk_rejected" | "submitted" | "filled" | "cancelled" | "failed" | "closed";
const allowed: Record<OrderState, OrderState[]> = { requested:["risk_rejected","submitted","failed"], risk_rejected:[], submitted:["filled","cancelled","failed"], filled:["closed"], cancelled:[], failed:[], closed:[] };
export const transitionOrder = (from: OrderState, to: OrderState) => { if (!allowed[from].includes(to)) throw new Error(`invalid order transition: ${from} -> ${to}`); return to; };
