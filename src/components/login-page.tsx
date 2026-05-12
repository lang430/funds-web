"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

const TURNSTILE_LOAD_TIMEOUT = 10000;

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
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileLoading, setTurnstileLoading] = useState(!!siteKey);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    const timer = setTimeout(() => {
      if (!turnstileToken && !turnstileError) {
        setTurnstileError(true);
        setTurnstileLoading(false);
      }
    }, TURNSTILE_LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, [siteKey, turnstileToken, turnstileError]);

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileLoading(false);
    setTurnstileError(false);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError(true);
    setTurnstileLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError(false);
    setTurnstileLoading(true);
  }, []);

  const handleLogin = () => {
    if (!canLogin) return;
    setVerifying(true);
    if (siteKey && turnstileToken) {
      window.location.href = `/api/auth/login?token=${encodeURIComponent(turnstileToken)}`;
    } else {
      window.location.href = "/api/auth/login";
    }
  };

  const canLogin = siteKey ? !!turnstileToken : true;

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 mb-4">
                <span className="text-white dark:text-zinc-900 text-lg font-bold">$</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                自选基金助手
              </h1>
              <p className="mt-1.5 text-[0.8rem] text-zinc-400 dark:text-zinc-500">
                实时追踪你的基金组合
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {siteKey && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="turnstile-container">
                    {turnstileLoading && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[0.75rem]">安全验证加载中...</span>
                      </div>
                    )}
                    {turnstileError && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <AlertCircle size={14} />
                          <span className="text-[0.75rem]">验证组件加载失败</span>
                        </div>
                        <button
                          onClick={handleRetry}
                          className="inline-flex items-center gap-1 text-[0.7rem] px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <RefreshCw size={11} />
                          重试
                        </button>
                      </div>
                    )}
                    <div className={turnstileLoading || turnstileError ? "hidden" : ""}>
                      <Turnstile
                        key={siteKey}
                        siteKey={siteKey}
                        onSuccess={handleTurnstileSuccess}
                        onError={handleTurnstileError}
                        onExpire={() => setTurnstileToken(null)}
                        options={{ size: "normal", theme: "auto" }}
                      />
                    </div>
                  </div>
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
                {verifying ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    使用 GitHub 登录
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[0.7rem] text-center text-zinc-400 dark:text-zinc-600">
              登录即表示同意数据将安全存储于云端
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
