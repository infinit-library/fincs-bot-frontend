export type Status = {
  running: boolean;
  last_scrape: string | null;
  last_new_segment?: string | null;
  poll_interval: number;
  dry_run: boolean;
  latest_signal?: string | null;
  latency_ms?: number | null;
  last_error?: string | null;
};

export type Signal = {
  detected_at: string;
  pair: string;
  action: 'ENTRY' | 'TP' | 'SL';
  side: 'LONG' | 'SHORT';
  size_ratio: number;
  is_additional: boolean;
  source_text: string;
};

export type ActionRecord = {
  created_at: string;
  action_type: 'NEW' | 'CLOSE';
  broker: 'SIMULATION' | 'OANDA' | string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  error_message?: string | null;
};

export type RawCapture = {
  captured_at: string;
  channel_name: string;
  raw_text: string;
  hash: string;
  processed: boolean;
};

export type Settings = {
  poll_interval: number;
  allowed_pairs: string[];
  max_lot_cap: number;
  dedup_window: number;
  dry_run: boolean;
};
