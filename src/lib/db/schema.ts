export const MIGRATIONS = [
  {
    version: 1,
    name: "initial_schema",
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  login TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS fund_holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  fund_code TEXT NOT NULL,
  shares REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_focused INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(user_id, fund_code)
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  show_amount INTEGER DEFAULT 1,
  show_gains INTEGER DEFAULT 1,
  show_cost INTEGER DEFAULT 0,
  show_cost_rate INTEGER DEFAULT 0,
  show_gsz INTEGER DEFAULT 0,
  dark_mode INTEGER DEFAULT 0,
  normal_font INTEGER DEFAULT 0,
  grayscale INTEGER DEFAULT 0,
  opacity INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS index_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  index_code TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(user_id, index_code)
);

CREATE INDEX IF NOT EXISTS idx_fund_holdings_user ON fund_holdings(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_fund_holdings_focused ON fund_holdings(user_id, is_focused);
CREATE INDEX IF NOT EXISTS idx_index_config_user ON index_config(user_id, sort_order);
`,
  },
] as const;

export const DEFAULT_INDEX_LIST = [
  "1.000001",
  "1.000300",
  "0.399001",
  "0.399006",
];
