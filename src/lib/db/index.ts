import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB(): D1Database {
  const { env } = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (env as any).DB;
}

export async function runMigrations(): Promise<void> {
  const { MIGRATIONS } = await import("./schema");
  const db = getDB();

  await db.exec(`CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY)`);

  const { results } = await db.prepare("SELECT MAX(version) as v FROM _migrations").all<{ v: number }>();
  const current = results[0]?.v ?? 0;

  for (const m of MIGRATIONS) {
    if (m.version > current) {
      await db.exec(m.sql);
      await db.prepare("INSERT OR REPLACE INTO _migrations (version) VALUES (?)").bind(m.version).run();
    }
  }
}

export async function getUserById(id: number) {
  const db = getDB();
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
}

export async function upsertUser(id: number, login: string, name?: string, avatar_url?: string) {
  const db = getDB();
  await db
    .prepare(
      `INSERT INTO users (id, login, name, avatar_url, updated_at)
       VALUES (?, ?, ?, ?, unixepoch())
       ON CONFLICT(id) DO UPDATE SET login=?, name=?, avatar_url=?, updated_at=unixepoch()`
    )
    .bind(id, login, name ?? null, avatar_url ?? null, login, name ?? null, avatar_url ?? null)
    .run();
}

export async function getUserFunds(userId: number) {
  const db = getDB();
  return db
    .prepare("SELECT * FROM fund_holdings WHERE user_id = ? ORDER BY sort_order ASC")
    .bind(userId)
    .all();
}

export async function addFund(userId: number, fundCode: string) {
  const db = getDB();
  const { results } = await db
    .prepare("SELECT MAX(sort_order) as max_sort FROM fund_holdings WHERE user_id = ?")
    .bind(userId)
    .all<{ max_sort: number }>();
  const nextSort = (results[0]?.max_sort ?? -1) + 1;

  await db
    .prepare(
      `INSERT OR IGNORE INTO fund_holdings (user_id, fund_code, sort_order) VALUES (?, ?, ?)`
    )
    .bind(userId, fundCode, nextSort)
    .run();
}

export async function deleteFund(userId: number, fundCode: string) {
  const db = getDB();
  await db
    .prepare("DELETE FROM fund_holdings WHERE user_id = ? AND fund_code = ?")
    .bind(userId, fundCode)
    .run();
}

export async function updateFund(
  userId: number,
  fundCode: string,
  data: { shares?: number; cost_price?: number; is_focused?: number }
) {
  const db = getDB();
  const sets: string[] = ["updated_at = unixepoch()"];
  const vals: (number | string)[] = [];

  if (data.shares !== undefined) { sets.push("shares = ?"); vals.push(data.shares); }
  if (data.cost_price !== undefined) { sets.push("cost_price = ?"); vals.push(data.cost_price); }
  if (data.is_focused !== undefined) { sets.push("is_focused = ?"); vals.push(data.is_focused); }

  vals.push(userId, fundCode);
  await db
    .prepare(`UPDATE fund_holdings SET ${sets.join(", ")} WHERE user_id = ? AND fund_code = ?`)
    .bind(...vals)
    .run();
}

export async function updateFundSort(userId: number, items: { fundCode: string; sortOrder: number }[]) {
  const db = getDB();
  const stmts = items.map((item) =>
    db
      .prepare("UPDATE fund_holdings SET sort_order = ? WHERE user_id = ? AND fund_code = ?")
      .bind(item.sortOrder, userId, item.fundCode)
  );
  await db.batch(stmts);
}

export async function getUserSettings(userId: number) {
  const db = getDB();
  const row = await db
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .bind(userId)
    .first();
  return row;
}

export async function upsertUserSettings(userId: number, data: Record<string, number>) {
  const db = getDB();
  const keys = Object.keys(data);
  const sets = keys.map((k) => `${k} = ?`).join(", ");

  await db
    .prepare(
      `INSERT INTO user_settings (user_id, ${keys.join(", ")}, updated_at)
       VALUES (?, ${keys.map(() => "?").join(", ")}, unixepoch())
       ON CONFLICT(user_id) DO UPDATE SET ${sets}, updated_at = unixepoch()`
    )
    .bind(userId, ...Object.values(data), ...Object.values(data))
    .run();
}

export async function getUserIndices(userId: number) {
  const db = getDB();
  return db
    .prepare("SELECT * FROM index_config WHERE user_id = ? ORDER BY sort_order ASC")
    .bind(userId)
    .all();
}

export async function saveIndexConfig(userId: number, indexCode: string, sortOrder: number) {
  const db = getDB();
  await db
    .prepare(
      `INSERT INTO index_config (user_id, index_code, sort_order)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, index_code) DO UPDATE SET sort_order = ?`
    )
    .bind(userId, indexCode, sortOrder, sortOrder)
    .run();
}

export async function deleteIndexConfig(userId: number, indexCode: string) {
  const db = getDB();
  await db
    .prepare("DELETE FROM index_config WHERE user_id = ? AND index_code = ?")
    .bind(userId, indexCode)
    .run();
}

export async function updateIndexSort(userId: number, items: { indexCode: string; sortOrder: number }[]) {
  const db = getDB();
  const stmts = items.map((item) =>
    db
      .prepare("UPDATE index_config SET sort_order = ? WHERE user_id = ? AND index_code = ?")
      .bind(item.sortOrder, userId, item.indexCode)
  );
  await db.batch(stmts);
}
