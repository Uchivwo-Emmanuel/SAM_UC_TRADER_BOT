import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
export const requireAnalysisService = (req: Request, res: Response, next: NextFunction) => {
  const value = req.header("x-analysis-service-token");
  const expected = config.ANALYSIS_SERVICE_TOKEN;
  if (!value || value.length !== expected.length || !timingSafeEqual(Buffer.from(value), Buffer.from(expected))) return res.sendStatus(401);
  next();
};
