import { SignJWT, jwtVerify } from "jose";
import { getRequestContext } from "@cloudflare/next-on-pages";

const JWT_ALG = "HS256";
const TOKEN_EXPIRY = "7d";

function getSecret(): Uint8Array {
  const ctx = getRequestContext();
  const env = ctx.env as unknown as Record<string, string>;
  const secret = env.JWT_SECRET || "dev-secret-change-in-production";
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

export async function getUserIdFromRequest(request: Request): Promise<number | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/funds_token=([^;]+)/);
  if (!match) return null;

  return verifyToken(match[1]);
}

export function getEnv(key: string): string {
  const ctx = getRequestContext();
  const env = ctx.env as unknown as Record<string, string>;
  return env[key] || "";
}

export async function exchangeGitHubCode(code: string): Promise<{
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
} | null> {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const clientSecret = getEnv("GITHUB_CLIENT_SECRET");

  if (!clientId || !clientSecret) return null;

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) return null;

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "funds-web",
      },
    });

    const userData = (await userRes.json()) as {
      id: number;
      login: string;
      name?: string;
      avatar_url?: string;
    };

    return userData;
  } catch {
    return null;
  }
}
