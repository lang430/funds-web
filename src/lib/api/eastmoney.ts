import { kvGet, kvSet, fundSearchKey, fundListKey, fundInfoKey, indexDataKey, indexChartKey, marketKey, holidayKey } from "../kv";
import type {
  FundSearchResponse,
  FundValuationRaw,
  FundValuationResponse,
  FundInfoResponse,
  FundPositionResponse,
  IndexResponse,
  HolidayData,
  MarketResponse,
} from "./types";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Android; Mobile) AppleWebKit/537.36",
  Referer: "https://fundmobapi.eastmoney.com/",
};

async function fetchJSON<T>(url: string, ttl = 60, cacheKey?: string): Promise<T> {
  if (cacheKey) {
    const cached = await kvGet<T>(cacheKey);
    if (cached) return cached;
  }

  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = (await res.json()) as T;

  if (cacheKey) {
    await kvSet(cacheKey, data, ttl);
  }

  return data;
}

export async function searchFunds(keyword: string) {
  const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${encodeURIComponent(keyword)}&_=${Date.now()}`;
  return fetchJSON<FundSearchResponse>(url, 3600, fundSearchKey(keyword));
}

export async function getFundValuations(codes: string[], userId: number, deviceId: string) {
  const codeStr = codes.join(",");
  const url = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=200&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=${deviceId}&Fcodes=${codeStr}`;
  return fetchJSON<FundValuationResponse>(url, 60, fundListKey(userId));
}

export async function getFundInfo(code: string) {
  const url = `https://fundmobapi.eastmoney.com/FundMApi/FundBaseTypeInformation.ashx?FCODE=${code}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&Uid=&_=${Date.now()}`;
  return fetchJSON<FundInfoResponse>(url, 3600, fundInfoKey(code));
}

export async function getFundPosition(code: string) {
  const url = `https://fundmobapi.eastmoney.com/FundMApi/FundMPositionDetail.ashx?FCODE=${code}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&Uid=&_=${Date.now()}`;
  return fetchJSON<FundPositionResponse>(url, 3600);
}

export async function getIndexData(codes: string[]) {
  const codeStr = codes.join(",");
  const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f13,f14&secids=${codeStr}&_=${Date.now()}`;
  return fetchJSON<IndexResponse>(url, 5, indexDataKey(codeStr));
}

export async function getIndexChart(code: string, range: string) {
  const klt = range === "1m" ? "5" : range === "1y" ? "101" : "5";
  const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${code}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=${klt}&fqt=1&end=20500101&lmt=120&_=${Date.now()}`;
  return fetchJSON<{ data: { klines: string[] } }>(url, 300, indexChartKey(code, range));
}

export async function getHoliday(): Promise<HolidayData> {
  const url = "https://x2rr.github.io/funds/holiday.json";
  return fetchJSON<HolidayData>(url, 86400, holidayKey());
}

export async function getMarketData(): Promise<MarketResponse> {
  const url = `https://push2.eastmoney.com/api/qt/clist/get?fid=f62&po=1&pz=50&pn=1&np=1&fltt=2&invt=2&fs=m:90+t:2&fields=f12,f14,f2,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87,f204,f205,f124&_=${Date.now()}`;

  const cacheKey = marketKey("all");
  const cached = await kvGet<MarketResponse>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(url, { headers: HEADERS });
    const raw = await res.json() as { data?: { diff?: Array<Record<string, unknown>> } };
    const diffs = raw?.data?.diff ?? [];

    const flows = diffs.map((d) => ({
      name: String(d.f14 ?? ""),
      up: Number(d.f62 ?? 0),
      down: Number(d.f184 ?? 0),
    }));

    const data: MarketResponse = { flows, sectors: [], north: [], south: [] };
    await kvSet(cacheKey, data, 30);
    return data;
  } catch {
    return { flows: [], sectors: [], north: [], south: [] };
  }
}

export function parseFundValuation(
  raw: FundValuationRaw,
  shares: number,
  costPrice: number
): {
  fundcode: string;
  name: string;
  jzrq: string;
  dwjz: number | null;
  gsz: number | null;
  gszzl: number;
  gztime: string;
  hasReplace: boolean;
  num: number;
  cost: number;
} {
  const nav = isNaN(Number(raw.NAV)) ? null : Number(raw.NAV);
  let gsz = isNaN(Number(raw.GSZ)) ? null : Number(raw.GSZ);
  let gszzl = isNaN(Number(raw.GSZZL)) ? 0 : Number(raw.GSZZL);
  let hasReplace = false;

  if (raw.PDATE !== "--" && raw.PDATE === raw.GZTIME.substring(0, 10)) {
    gsz = nav;
    gszzl = isNaN(Number(raw.NAVCHGRT)) ? 0 : Number(raw.NAVCHGRT);
    hasReplace = true;
  }

  return {
    fundcode: raw.FCODE,
    name: raw.SHORTNAME,
    jzrq: raw.PDATE,
    dwjz: nav,
    gsz,
    gszzl,
    gztime: raw.GZTIME,
    hasReplace,
    num: shares,
    cost: costPrice,
  };
}
