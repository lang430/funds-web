import { exchangeGitHubCode, createToken } from "@/lib/auth";
import { upsertUser } from "@/lib/db";

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

    await upsertUser(githubUser.id, githubUser.login, githubUser.name, githubUser.avatar_url);

    const token = await createToken(githubUser.id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `funds_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch {
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
