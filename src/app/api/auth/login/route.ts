import { NextResponse } from "next/server";
import { getEnv } from "@/lib/auth";

export const runtime = "edge";

export async function GET() {
  const clientId = getEnv("GITHUB_CLIENT_ID");
  const redirectUri = getEnv("GITHUB_REDIRECT_URI") || "https://myskills.dpdns.org/api/auth/callback";
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
  return NextResponse.redirect(url);
}
