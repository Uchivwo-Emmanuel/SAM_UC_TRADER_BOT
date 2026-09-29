import { randomUUID } from "node:crypto";
import { db } from "./db.js";
import { auditEvents } from "./schema.js";

export const writeAuditEvent = async (input: { actorId?: string; correlationId?: string; action: string; metadata: Record<string, unknown> }) =>
  db.insert(auditEvents).values({ id: randomUUID(), actorId: input.actorId, correlationId: input.correlationId ?? randomUUID(), action: input.action, metadata: input.metadata });
