export const allowedInstruments = ["XAUUSD", "VOLATILITY_100", "JUMP_50"] as const;
export type AllowedInstrument = (typeof allowedInstruments)[number];
export const isAllowedInstrument = (value: string): value is AllowedInstrument =>
  allowedInstruments.includes(value as AllowedInstrument);
