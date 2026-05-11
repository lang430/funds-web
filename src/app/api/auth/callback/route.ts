import { exchangeGitHubCode, createToken } from "@/lib/auth";
import { upsertUser, runMigrations } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    console.log("[auth/callback] 收到 GitHub 回调");
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("[auth/callback] 缺少 authorization code");
      return Response.json(
        { success: false, error: { message: "Missing authorization code" } },
        { status: 400 }
      );
    }

    console.log("[auth/callback] 正在通过 code 换取 GitHub 用户信息...");
    const githubUser = await exchangeGitHubCode(code);
    if (!githubUser) {
      console.error("[auth/callback] GitHub OAuth 换取用户信息失败");
      return Response.json(
        { success: false, error: { message: "GitHub OAuth failed" } },
        { status: 401 }
      );
    }

    console.log(`[auth/callback] 用户信息获取成功: login=${githubUser.login}, id=${githubUser.id}`);
    console.log("[auth/callback] 运行数据库迁移...");
    await runMigrations();
    console.log("[auth/callback] 写入用户数据...");
    await upsertUser(githubUser.id, githubUser.login, githubUser.name, githubUser.avatar_url);

    console.log("[auth/callback] 创建 JWT token...");
    const token = await createToken(githubUser.id);
    console.log("[auth/callback] 登录完成，跳转到首页");

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `funds_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
      },
    });
  } catch (e) {
    console.error("[auth/callback] 回调处理异常:", e);
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
