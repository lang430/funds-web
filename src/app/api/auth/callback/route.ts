import { exchangeGitHubCode, createToken } from "@/lib/auth";
import { upsertUser, runMigrations } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return Response.json(
        { success: false, error: { message: "Missing authorization code" } },
        { status: 400 }
      );
    }

    const githubUser = await exchangeGitHubCode(code);
    if (!githubUser) {
      return Response.json(
        { success: false, error: { message: "GitHub OAuth failed" } },
        { status: 401 }
      );
    }

    await runMigrations();
    await upsertUser(githubUser.id, githubUser.login, githubUser.name, githubUser.avatar_url);

    const token = await createToken(githubUser.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `funds_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch (e) {
    console.error("GitHub callback error:", e);
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
