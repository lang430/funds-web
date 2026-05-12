"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { LoginPage } from "@/components/login-page";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, setUser, setLoading } = useAuthStore();
  const loadFromServer = useSettingsStore((s) => s.loadFromServer);

  useEffect(() => {
    let cancelled = false;
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
            return;
          }
          console.warn("[auth-provider] 响应 data.user 为空");
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error("[auth-provider] 认证检查失败:", err);
        if (!cancelled) setLoading(false);
      }
    }
    checkAuth();
    return () => { cancelled = true; };
  }, [setUser, setLoading, loadFromServer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        加载中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
