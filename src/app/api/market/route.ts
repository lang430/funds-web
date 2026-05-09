import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getMarketData } from "@/lib/api/eastmoney";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  try {
    const data = await getMarketData();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: { code: "API_ERROR", message: "获取行情数据失败" } }, { status: 502 });
  }
}
