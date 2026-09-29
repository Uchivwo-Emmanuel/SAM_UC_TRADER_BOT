export type MarketTick = { instrumentId: string; price: string; observedAt: Date; sourceTickId: string };
export type ObservationStore = { has(sourceTickId: string): Promise<boolean>; save(tick: MarketTick): Promise<void> };

export class MarketIngestion {
  constructor(private readonly store: ObservationStore) {}
  async ingest(tick: MarketTick) {
    if (await this.store.has(tick.sourceTickId)) return false;
    await this.store.save(tick);
    return true;
  }
}
