"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, AlertCircle, RefreshCw, BarChart3 } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0b] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="card overflow-hidden">
          <div className="px-8 pt-10 pb-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 mb-5">
                <BarChart3 size={26} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                自选基金助手
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                实时追踪你的基金组合
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              {siteKey && (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="turnstile-container">
                    {turnstileLoading && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-sm">安全验证加载中...</span>
                      </div>
                    )}
                    {turnstileError && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <AlertCircle size={14} />
                          <span className="text-sm">验证组件加载失败</span>
                        </div>
                        <button
                          onClick={handleRetry}
                          className="btn btn-outline text-xs"
                        >
                          <RefreshCw size={12} />
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
                className={`inline-flex items-center justify-center gap-2.5 w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  canLogin && !verifying
                    ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 active:scale-[0.98] shadow-sm"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                }`}
              >
                {verifying ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
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

          <div className="px-8 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              登录即表示同意数据将安全存储于云端
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
