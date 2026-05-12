"use client";

import { useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Github } from "lucide-react";

function getTurnstileSiteKey(): string {
  if (typeof window !== "undefined") {
    const win = window as unknown as Record<string, string>;
    if (win.__TURNSTILE_SITE_KEY) return win.__TURNSTILE_SITE_KEY;
  }
  return "";
}

export function LoginPage() {
  const siteKey = useMemo(() => getTurnstileSiteKey(), []);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const canLogin = siteKey ? !!turnstileToken : true;

  const handleLogin = () => {
    if (!canLogin) return;
    setVerifying(true);
    if (siteKey && turnstileToken) {
      window.location.href = `/api/auth/login?token=${encodeURIComponent(turnstileToken)}`;
    } else {
      window.location.href = "/api/auth/login";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 mb-4">
                <span className="text-white dark:text-zinc-900 text-lg font-bold">$</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                自选基金助手
              </h1>
              <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                实时追踪你的基金组合
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {siteKey && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={siteKey}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                  />
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={!canLogin || verifying}
                className={`inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                  canLogin && !verifying
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98]"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                }`}
              >
                <Github size={16} />
                {verifying ? "验证中..." : "使用 GitHub 登录"}
              </button>
            </div>
          </div>

          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-600">
              登录即表示同意数据将安全存储于云端
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
