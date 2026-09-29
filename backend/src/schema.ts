import { date, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const id = () => uuid("id").defaultRandom().primaryKey();
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable("user", { id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(), emailVerified: timestamptz("email_verified"), image: text("image"), role: text("role").notNull().default("viewer"), createdAt: createdAt(), updatedAt: timestamptz("updated_at").defaultNow().notNull() });
export const sessions = pgTable("session", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), token: text("token").notNull().unique(), expiresAt: timestamptz("expires_at").notNull(), createdAt: createdAt(), updatedAt: timestamptz("updated_at").defaultNow().notNull() }, t => [index("session_user_idx").on(t.userId)]);
export const accounts = pgTable("account", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id), accountId: text("account_id").notNull(), providerId: text("provider_id").notNull(), password: text("password"), createdAt: createdAt(), updatedAt: timestamptz("updated_at").defaultNow().notNull() }, t => [index("account_user_idx").on(t.userId)]);
/** OAuth bearer tokens are encrypted before persistence and are never returned by API routes. */
export const derivOauthCredentials = pgTable("deriv_oauth_credentials", {
  userId: text("user_id").primaryKey().references(() => users.id),
  accessTokenCiphertext: text("access_token_ciphertext").notNull(),
  tokenExpiresAt: timestamptz("token_expires_at").notNull(),
  scopes: text("scopes").notNull(),
  createdAt: createdAt(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull()
});
export const verifications = pgTable("verification", { id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(), expiresAt: timestamptz("expires_at").notNull(), createdAt: createdAt(), updatedAt: timestamptz("updated_at").defaultNow().notNull() });
export const instruments = pgTable("instruments", { id: id(), symbol: text("symbol").notNull().unique(), name: text("name").notNull(), enabled: text("enabled").notNull().default("true"), createdAt: createdAt() });
export const strategies = pgTable("strategies", { id: id(), name: text("name").notNull(), status: text("status").notNull().default("draft"), createdAt: createdAt() });
export const strategyVersions = pgTable("strategy_versions", { id: id(), strategyId: uuid("strategy_id").notNull().references(() => strategies.id), version: text("version").notNull(), parameters: jsonb("parameters").notNull(), createdAt: createdAt() }, t => [index("strategy_version_strategy_idx").on(t.strategyId)]);
export const signals = pgTable("signals", { id: id(), strategyVersionId: uuid("strategy_version_id").notNull().references(() => strategyVersions.id), instrumentId: uuid("instrument_id").notNull().references(() => instruments.id), direction: text("direction").notNull(), context: jsonb("context").notNull(), createdAt: createdAt() }, t => [index("signal_instrument_created_idx").on(t.instrumentId, t.createdAt)]);
export const orders = pgTable("orders", { id: id(), signalId: uuid("signal_id").references(() => signals.id), brokerOrderId: text("broker_order_id").unique(), status: text("status").notNull(), createdAt: createdAt() }, t => [index("order_status_created_idx").on(t.status, t.createdAt)]);
export const positions = pgTable("positions", { id: id(), orderId: uuid("order_id").notNull().references(() => orders.id), instrumentId: uuid("instrument_id").notNull().references(() => instruments.id), entryPrice: numeric("entry_price", { precision: 20, scale: 8 }), exitPrice: numeric("exit_price", { precision: 20, scale: 8 }), openedAt: timestamptz("opened_at").notNull(), closedAt: timestamptz("closed_at") }, t => [index("position_instrument_opened_idx").on(t.instrumentId, t.openedAt)]);
export const fills = pgTable("fills", { id: id(), orderId: uuid("order_id").notNull().references(() => orders.id), price: numeric("price", { precision: 20, scale: 8 }).notNull(), quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(), createdAt: createdAt() }, t => [index("fill_order_idx").on(t.orderId)]);
export const balances = pgTable("balances", { id: id(), amount: numeric("amount", { precision: 20, scale: 8 }).notNull(), currency: text("currency").notNull(), recordedAt: timestamptz("recorded_at").notNull() }, t => [index("balance_recorded_idx").on(t.recordedAt)]);
export const dailySummaries = pgTable("daily_summaries", { id: id(), strategyVersionId: uuid("strategy_version_id").references(() => strategyVersions.id), instrumentId: uuid("instrument_id").references(() => instruments.id), tradingDate: text("trading_date").notNull(), tradeCount: text("trade_count").notNull().default("0"), realizedPnl: numeric("realized_pnl", { precision: 20, scale: 8 }).notNull().default("0"), winRate: numeric("win_rate", { precision: 8, scale: 4 }), createdAt: createdAt() }, t => [index("daily_summary_date_idx").on(t.tradingDate)]);
export const marketObservations = pgTable("market_observations", { id: id(), instrumentId: uuid("instrument_id").notNull().references(() => instruments.id), price: numeric("price", { precision: 20, scale: 8 }).notNull(), observedAt: timestamptz("observed_at").notNull(), sourceTickId: text("source_tick_id") }, t => [index("market_observation_instrument_time_idx").on(t.instrumentId, t.observedAt)]);
export const auditEvents = pgTable("audit_events", { id: id(), actorId: text("actor_id").references(() => users.id), correlationId: uuid("correlation_id").notNull(), action: text("action").notNull(), metadata: jsonb("metadata").notNull(), createdAt: createdAt() }, t => [index("audit_action_created_idx").on(t.action, t.createdAt)]);
export const analysisReports = pgTable("analysis_reports", {
  id: id(), reportType: text("report_type").notNull(), reportDate: date("report_date").notNull(), status: text("status").notNull(),
  content: jsonb("content").notNull(), markdown: text("markdown").notNull(), promptVersion: text("prompt_version").notNull(),
  model: text("model").notNull(), modelVersion: text("model_version"), inputHash: text("input_hash").notNull(),
  sourceReferences: jsonb("source_references").notNull(), failureReason: text("failure_reason"), createdAt: createdAt(),
}, t => [uniqueIndex("analysis_reports_type_date_unique").on(t.reportType, t.reportDate), index("analysis_reports_status_date_idx").on(t.status, t.reportDate)]);
export const reportReviews = pgTable("report_reviews", {
  id: id(), reportId: uuid("report_id").notNull().references(() => analysisReports.id), reviewerId: text("reviewer_id").notNull().references(() => users.id),
  decision: text("decision").notNull(), notes: text("notes"), createdAt: createdAt(),
}, t => [index("report_reviews_report_created_idx").on(t.reportId, t.createdAt), index("report_reviews_reviewer_idx").on(t.reviewerId)]);
