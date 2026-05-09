import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getIndexChart } from "@/lib/api/eastmoney";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  const { code } = await params;
  const range = request.nextUrl.searchParams.get("range") || "1m";

  const prefix = code.startsWith("0") ? "0." : "1.";
  const secid = prefix + code;

  try {
    const res = await getIndexChart(secid, range);
    const klines = res.data?.klines || [];
    return NextResponse.json({ success: true, data: klines });
  } catch {
    return NextResponse.json({ success: false, error: { code: "API_ERROR", message: "获取走势图失败" } }, { status: 502 });
  }
}
