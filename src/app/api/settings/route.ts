import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { getUserSettings, upsertUserSettings } from "@/lib/db";


export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  const settings = await getUserSettings(userId);
  return NextResponse.json({ success: true, data: settings || {} });
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "未登录" } }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, number>;
    await upsertUserSettings(userId, body);
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json({ success: false, error: { code: "DB_ERROR", message: "保存设置失败" } }, { status: 500 });
  }
}
