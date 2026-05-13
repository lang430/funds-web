"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, Settings, TrendingUp, BarChart3 } from "lucide-react";

export function NavBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/api/auth/logout";
  };

  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-slate-200/60 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 sm:px-8 py-0 h-12">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
              自选基金助手
            </span>
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => router.push("/market")}
              className="btn btn-ghost text-xs"
            >
              <TrendingUp size={14} />
              <span className="hidden sm:inline">行情中心</span>
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="btn btn-ghost text-xs"
            >
              <Settings size={14} />
              <span className="hidden sm:inline">设置</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {user.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={24}
                  height={24}
                  className="rounded-full ring-1 ring-slate-200/80 dark:ring-white/10"
                />
              )}
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                {user.name || user.login}
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-ghost text-xs hover:text-red-500 dark:hover:text-red-400">
            <LogOut size={14} />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>
    </header>
  );
}
