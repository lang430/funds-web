import { SignJWT, jwtVerify } from "jose";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const JWT_ALG = "HS256";
const TOKEN_EXPIRY = "7d";

function getSecret(): Uint8Array {
  const { env } = getCloudflareContext();
  const secret = (env as Record<string, string>).JWT_SECRET || "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALG],
    });
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

/** 验证 Cloudflare Turnstile token，返回 true 表示通过 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = getEnv("TURNSTILE_SECRET_KEY");
  if (!secretKey) {
    console.error("[auth] verifyTurnstileToken 失败: TURNSTILE_SECRET_KEY 未配置");
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });

    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("[auth] Turnstile 验证失败:", data["error-codes"]);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[auth] Turnstile 验证请求异常:", e);
    return false;
  }
}

export async function getUserIdFromRequest(request: Request): Promise<number | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/funds_token=([^;]+)/);
  if (!match) return null;

  return verifyToken(match[1]);
}

export function getEnv(key: string): string {
  try {
    const { env } = getCloudflareContext();
    const value = ((env as unknown as Record<string, string>)[key]) || "";
    if (!value) {
      console.warn(`[auth] getEnv("${key}") 返回空值，请确认 wrangler secret 已配置`);
    }
    return value;
  } catch (e) {
    console.error(`[auth] getEnv("${key}") 读取失败:`, e);
    return "";
  }
}

export async function exchangeGitHubCode(code: string): Promise<{
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
} | null> {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const clientSecret = getEnv("GITHUB_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("[auth] exchangeGitHubCode 失败: GITHUB_CLIENT_ID 或 GITHUB_CLIENT_SECRET 未配置");
    return null;
  }

  try {
    console.log("[auth] 正在用 code 换取 access_token...");
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      console.error("[auth] 换取 access_token 失败:", JSON.stringify(tokenData));
      return null;
    }

    console.log("[auth] access_token 换取成功，正在获取 GitHub 用户信息...");
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "funds-web",
      },
    });

    if (!userRes.ok) {
      console.error(`[auth] 获取 GitHub 用户信息失败: HTTP ${userRes.status}`);
      return null;
    }

    const userData = (await userRes.json()) as {
      id: number;
      login: string;
      name?: string;
      avatar_url?: string;
    };

    console.log(`[auth] GitHub 用户信息获取成功: login=${userData.login}, id=${userData.id}`);
    return userData;
  } catch (e) {
    console.error("[auth] exchangeGitHubCode 异常:", e);
    return null;
  }
}
