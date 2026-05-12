import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "自选基金助手",
  description: "实时查看您关注的基金，助您快速获取实时数据",
};

async function getTurnstileSiteKey(): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    return ((env as Record<string, string>).TURNSTILE_SITE_KEY) || "";
  } catch {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const turnstileSiteKey = await getTurnstileSiteKey();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {turnstileSiteKey && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__TURNSTILE_SITE_KEY = "${turnstileSiteKey}";`,
            }}
          />
        )}
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
