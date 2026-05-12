import { NextResponse } from "next/server";
import { getHoliday as fetchHoliday } from "@/lib/api/eastmoney";
import { isDuringDate, isHoliday } from "@/lib/calc";

export async function GET() {
  try {
    const holiday = await fetchHoliday();
    const now = new Date();
    const tradeTime = isDuringDate(now);
    const holidayCheck = isHoliday(now, holiday.data);
    const isTradeDay = !holidayCheck && now.getDay() !== 0 && now.getDay() !== 6;

    return NextResponse.json({
      success: true,
      data: {
        holiday,
        isTradeDay,
        isTradeTime: tradeTime,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "API_ERROR", message: "获取节假日数据失败" } }, { status: 502 });
  }
}
