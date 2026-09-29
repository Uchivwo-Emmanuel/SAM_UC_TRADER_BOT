# Deferred — MSNR / CRT rule specification

## Status

The backend now recognises the requested strategy families as `msnr` and `crt`, but both are deliberately non-trading placeholders. Their `evaluate` method always returns `action: "none"` until two owners approve a written, testable strategy version.

`CRT` commonly refers to **Candle Range Theory**: an anchor candle defines a range; a later candle may sweep a boundary and reclaim it. It is not one universal algorithm. `MSNR` is even more ambiguous: sources use it for at least “Market Structure & Reversal” and “Market Structure + News Reaction.” “MSR” and “CROT” were also mentioned verbally and must be confirmed as either separate strategies or spelling variants.

## What the backend is ready to receive

- Named, versioned strategy entries: `msnr` and `crt`.
- Backend-generated OHLC candle history at M1, M5, M15, M30, H1, H4, or D1; a single tick cannot form a CRT or market-structure signal.
- A structured result containing action, stop-loss, take-profit, reason, and evidence.
- The existing signal → risk → paper-execution path. A strategy must never submit an order itself.

## Required answer from the trader for each strategy

Copy this table into a PDF, message, or document and answer every row. Exact numbers, candle-close rules, and timezone are required; screenshots alone are not enough.

| Rule | MSNR | CRT |
| --- | --- | --- |
| Confirm the full strategy name |  | Candle Range Theory? |
| Instruments allowed |  |  |
| Higher-timeframe(s) |  |  |
| Entry-timeframe(s) |  |  |
| Nigerian-time trading window, if any |  |  |
| How is trend / market structure defined? |  |  |
| What exact candle pattern creates a setup? |  | Anchor candle and sweep/reclaim definition |
| What confirms entry: wick touch, intrabar, or candle close? |  |  |
| Long rules |  |  |
| Short rules |  |  |
| Stop-loss location and buffer |  |  |
| Take-profit formula / partial exits |  |  |
| Position size / risk per trade |  |  |
| Maximum concurrent positions |  |  |
| Setup expiry / invalidation |  |  |
| News filter and data source, if applicable |  |  |
| Examples: 10 winning and 10 losing historical trades |  |  |

## Implementation sequence after receipt

1. Write a human-readable versioned rule checklist.
2. Convert every rule to deterministic code and unit-test fixtures.
3. Backtest using broker-compatible OHLC data, with spread/slippage assumptions recorded.
4. Run paper execution for the agreed minimum period and thresholds.
5. Record two owner approvals. The live gate remains disabled unless all independent safeguards pass.
