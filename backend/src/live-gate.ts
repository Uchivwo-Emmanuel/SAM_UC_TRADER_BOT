export const canEnableLiveTrading = (input: { envEnabled: boolean; ownerApprovals: number; riskEngineHealthy: boolean }) => input.envEnabled && input.ownerApprovals >= 2 && input.riskEngineHealthy;
