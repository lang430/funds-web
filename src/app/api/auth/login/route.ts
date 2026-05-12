import { NextResponse } from "next/server";
import { getEnv } from "@/lib/auth";

export async function GET() {
  try {
    console.log("[auth/login] 开始处理登录请求");
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

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
    console.log("[auth/login] 跳转到 GitHub OAuth 授权页");
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("[auth/login] 登录请求处理异常:", e);
    return Response.json(
      { success: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
