import { NextResponse } from "next/server";
import { getEnv, verifyTurnstileToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    console.log("[auth/login] 开始处理登录请求");
    const url = new URL(request.url);
    const turnstileToken = url.searchParams.get("token");
    const turnstileConfigured = !!getEnv("TURNSTILE_SECRET_KEY");

    if (turnstileConfigured) {
      if (!turnstileToken) {
        console.warn("[auth/login] 缺少 Turnstile token");
        return Response.json(
          { success: false, error: { message: "请完成人机验证" } },
          { status: 400 }
        );
      }

      console.log("[auth/login] 验证 Turnstile token...");
      const isValid = await verifyTurnstileToken(turnstileToken);
      if (!isValid) {
        console.warn("[auth/login] Turnstile 验证未通过");
        return Response.json(
          { success: false, error: { message: "人机验证失败，请重试" } },
          { status: 403 }
        );
      }
    }

    const clientId = getEnv("GITHUB_CLIENT_ID");
    console.log(`[auth/login] GITHUB_CLIENT_ID 长度: ${clientId.length}`);

    if (!clientId) {
      console.error("[auth/login] GITHUB_CLIENT_ID 未配置");
      return Response.json(
        { success: false, error: { message: "GitHub OAuth 未配置，请设置 GITHUB_CLIENT_ID" } },
        { status: 500 }
      );
    }

    const redirectUri = getEnv("GITHUB_REDIRECT_URI") || "https://myskills.dpdns.org/api/auth/callback";
    console.log(`[auth/login] redirect_uri: ${redirectUri}`);

    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    console.log("[auth/login] 跳转到 GitHub OAuth 授权页");
    return NextResponse.redirect(oauthUrl);
  } catch (e) {
    console.error("[auth/login] 登录请求处理异常:", e);
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
