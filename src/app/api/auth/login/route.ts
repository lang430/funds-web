import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID || "";
  const redirectUri = process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/api/auth/callback";
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
  return NextResponse.redirect(url);
}
