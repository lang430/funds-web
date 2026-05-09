import { getUserIdFromRequest } from "@/lib/auth";
import { updateFundSort } from "@/lib/db";

export const runtime = "edge";

export async function PATCH(request: Request): Promise<Response> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      items?: Array<{ fundCode: string; sortOrder: number }>;
    };
    const items = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        { success: false, error: { message: "items array is required" } },
        { status: 400 }
      );
    }

    await updateFundSort(
      userId,
      items.map((item) => ({ fundCode: item.fundCode, sortOrder: item.sortOrder }))
    );

    return Response.json({ success: true, data: null });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
