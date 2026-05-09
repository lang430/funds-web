import { searchFunds } from "@/lib/api/eastmoney";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const keyword = url.searchParams.get("k") || "";

    if (!keyword.trim()) {
      return Response.json({ success: true, data: [] });
    }

    const result = await searchFunds(keyword.trim());

    return Response.json({ success: true, data: result });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
