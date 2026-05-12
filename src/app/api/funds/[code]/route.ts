import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getFundInfo } from "@/lib/api/eastmoney";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  const { code } = await params;
  try {
    const res = await getFundInfo(code);
    return NextResponse.json({ success: true, data: res.Datas });
  } catch {
    return NextResponse.json({ success: false, error: { code: "API_ERROR", message: "获取基金信息失败" } }, { status: 502 });
  }
}
