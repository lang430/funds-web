import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getIndexData } from "@/lib/api/eastmoney";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  const codes = request.nextUrl.searchParams.get("codes");
  if (!codes) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const res = await getIndexData(codes.split(","));
    return NextResponse.json({ success: true, data: res.data?.diff || [] });
  } catch {
    return NextResponse.json({ success: false, error: { code: "API_ERROR", message: "获取指数数据失败" } }, { status: 502 });
  }
}
