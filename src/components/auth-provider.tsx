"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { LoginPage } from "@/components/login-page";

const LOADING_TIMEOUT = 5000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, setUser, setLoading } = useAuthStore();
  const loadFromServer = useSettingsStore((s) => s.loadFromServer);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          if (mountedRef.current) setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        const json = await res.json() as { success: boolean; data?: { user?: { id: number; login: string; name?: string; avatar_url?: string }; settings?: Record<string, unknown> } };
        const data = json.data;
        if (data?.user) {
          if (mountedRef.current) {
            setUser(data.user);
            if (data.settings) {
              loadFromServer(data.settings as Record<string, number | boolean>);
            }
          }
          clearTimeout(timeoutId);
          return;
        }
        if (mountedRef.current) setLoading(false);
        clearTimeout(timeoutId);
      } catch {
        if (mountedRef.current) setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    checkAuth();

    timeoutId = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, LOADING_TIMEOUT);

    return () => {
      mountedRef.current = false;
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
