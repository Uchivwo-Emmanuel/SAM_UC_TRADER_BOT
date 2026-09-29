-- Run outside a transaction: this keeps the index build non-blocking.
create unique index concurrently if not exists market_observations_source_tick_unique
  on market_observations (source_tick_id)
  where source_tick_id is not null;
