"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { LoginPage } from "@/components/login-page";

const LOADING_TIMEOUT = 8000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, setUser, setLoading } = useAuthStore();
  const loadFromServer = useSettingsStore((s) => s.loadFromServer);
  const mountedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkAuth() {
      try {
        console.log("[auth-provider] 检查认证状态...");
        const res = await fetch("/api/auth/me", { credentials: "include" });
        console.log(`[auth-provider] /api/auth/me 响应状态: ${res.status}`);
        if (res.ok) {
          const json = await res.json() as { success: boolean; data?: { user?: { id: number; login: string; name?: string; avatar_url?: string }; settings?: Record<string, unknown> } };
          console.log(`[auth-provider] /api/auth/me 响应数据: success=${json.success}, hasData=${!!json.data}`);
          const data = json.data;
          if (data?.user) {
            console.log(`[auth-provider] 用户已认证: login=${data.user.login}`);
            if (!cancelled) {
              setUser(data.user);
              if (data.settings) {
                loadFromServer(data.settings as Record<string, number | boolean>);
              }
            }
            clearTimeout(timeoutId);
            return;
          }
          console.warn("[auth-provider] 响应 data.user 为空");
        }
        if (!cancelled) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      } catch (err) {
        console.error("[auth-provider] 认证检查失败:", err);
        if (!cancelled) {
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    }

    checkAuth();

    timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn(`[auth-provider] 认证检查超时 (${LOADING_TIMEOUT}ms)，强制结束加载`);
        setLoading(false);
      }
    }, LOADING_TIMEOUT);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [setUser, setLoading, loadFromServer]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
