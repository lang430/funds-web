import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", "https://myskills.dpdns.org"));
  res.headers.set(
    "Set-Cookie",
    "funds_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
  return res;
}
