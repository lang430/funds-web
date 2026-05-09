import { getUserIdFromRequest } from "@/lib/auth";
import { getUserFunds } from "@/lib/db";
import { getFundValuations, parseFundValuation } from "@/lib/api/eastmoney";
import {
  calculateMoney,
  calculateGains,
  calculateCostGains,
  calculateCostGainsRate,
} from "@/lib/calc";
import type { FundValuation } from "@/lib/api/types";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const holdings = await getUserFunds(userId);
    const results = holdings.results as Array<{
      fund_code: string;
      shares: number;
      cost_price: number;
      sort_order: number;
      is_focused: number;
    }>;

    if (!results || results.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const codes = results.map((r) => r.fund_code);
    const deviceId = "funds-web";

    const valuationRes = await getFundValuations(codes, userId, deviceId);
    const rawList = valuationRes?.Datas ?? [];

    const rawMap = new Map(rawList.map((r) => [r.FCODE, r]));

    const data: FundValuation[] = results.map((holding) => {
      const raw = rawMap.get(holding.fund_code);
      if (!raw) {
        return {
          fundcode: holding.fund_code,
          name: "",
          jzrq: "",
          dwjz: null,
          gsz: null,
          gszzl: 0,
          gztime: "",
          hasReplace: false,
          num: holding.shares ?? 0,
          cost: holding.cost_price ?? 0,
          amount: 0,
          gains: 0,
          costGains: 0,
          costGainsRate: 0,
        };
      }

      const parsed = parseFundValuation(raw, holding.shares ?? 0, holding.cost_price ?? 0);
      const amount = calculateMoney(parsed.dwjz, parsed.num);
      const gains = calculateGains(parsed.dwjz, parsed.gsz, parsed.gszzl, parsed.num, parsed.hasReplace);
      const costGains = calculateCostGains(parsed.dwjz, parsed.cost, parsed.num);
      const costGainsRate = calculateCostGainsRate(parsed.dwjz, parsed.cost);

      return {
        ...parsed,
        amount,
        gains,
        costGains,
        costGainsRate,
      };
    });

    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
