import { getCloudflareContext } from "@opennextjs/cloudflare";

function getKV(): KVNamespace {
  const { env } = getCloudflareContext();
  return (env as Record<string, unknown>).KV as KVNamespace;
}

const DEFAULT_TTL = 60;

export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getKV().get(key, "json");
    return raw as T | null;
  } catch {
    return null;
  }
}

export async function kvSet<T>(key: string, value: T, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await getKV().put(key, JSON.stringify(value), { expirationTtl: ttl });
  } catch {
    // KV 写入失败不影响主流程
  }
}

export async function kvDelete(key: string): Promise<void> {
  try {
    await getKV().delete(key);
  } catch {
    // 忽略
  }
}

export function fundListKey(userId: number) {
  return `fund:list:${userId}`;
}

export function fundSearchKey(keyword: string) {
  return `fund:search:${keyword}`;
}

export function fundInfoKey(code: string) {
  return `fund:info:${code}`;
}

export function indexDataKey(codes: string) {
  return `index:data:${codes}`;
}

export function indexChartKey(code: string, range: string) {
  return `index:chart:${code}:${range}`;
}

export function marketKey(type: string) {
  return `market:${type}`;
}

export function holidayKey() {
  return "holiday:data";
}
