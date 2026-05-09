"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { LoginPage } from "@/components/login-page";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, setUser, setLoading } = useAuthStore();
  const loadFromServer = useSettingsStore((s) => s.loadFromServer);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json() as { success: boolean; data: { user: { id: number; login: string; name?: string; avatar_url?: string }; settings?: Record<string, unknown> } };
          const { data } = json;
          setUser(data.user);
          if (data.settings) {
            loadFromServer(data.settings as Record<string, number | boolean>);
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
    checkAuth();
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
