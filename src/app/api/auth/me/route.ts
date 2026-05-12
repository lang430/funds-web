import { verifyToken } from "@/lib/auth";
import { getUserById, getUserSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/funds_token=([^;]+)/);
    if (!match) {
      return Response.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const userId = await verifyToken(match[1]);
    if (!userId) {
      return Response.json(
        { success: false, error: { message: "Invalid or expired token" } },
        { status: 401 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return Response.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    const settings = await getUserSettings(userId);

    return Response.json({ success: true, data: { user, settings } });
  } catch (e) {
    console.error("Auth me error:", e);
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
