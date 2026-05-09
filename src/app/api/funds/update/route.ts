import { getUserIdFromRequest } from "@/lib/auth";
import { updateFund } from "@/lib/db";

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
      fundCode?: string;
      shares?: number;
      costPrice?: number;
      isFocused?: boolean;
    };
    const { fundCode, shares, costPrice, isFocused } = body;

    if (!fundCode) {
      return Response.json(
        { success: false, error: { message: "fundCode is required" } },
        { status: 400 }
      );
    }

    const updateData: { shares?: number; cost_price?: number; is_focused?: number } = {};
    if (shares !== undefined) updateData.shares = shares;
    if (costPrice !== undefined) updateData.cost_price = costPrice;
    if (isFocused !== undefined) updateData.is_focused = isFocused ? 1 : 0;

    await updateFund(userId, fundCode, updateData);

    return Response.json({ success: true, data: null });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
