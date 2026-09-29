import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";

export const requireSession = async (request: Request, response: Response, next: NextFunction) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session) return response.status(401).json({ error: "authentication required" });
  response.locals.session = session;
  next();
};

/** AI reports are review artifacts; only an owner can record a human decision. */
export const requireOwner = async (request: Request, response: Response, next: NextFunction) => {
  await requireSession(request, response, () => undefined);
  const session = response.locals.session as { user?: { role?: string } } | undefined;
  if (!session) return;
  if (session.user?.role !== "owner") return response.status(403).json({ error: "owner role required" });
  next();
};
