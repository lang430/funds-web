import { getUserIdFromRequest } from "@/lib/auth";
import { addFund } from "@/lib/db";

export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { fundCode?: string };
    const fundCode = body.fundCode;

    if (!fundCode) {
      return Response.json(
        { success: false, error: { message: "fundCode is required" } },
        { status: 400 }
      );
    }

    await addFund(userId, fundCode);

    return Response.json({ success: true, data: null });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
