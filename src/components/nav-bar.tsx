"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, Settings, TrendingUp } from "lucide-react";

export function NavBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/api/auth/logout";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-[0.85rem] sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            自选基金
          </h1>
          <button
            onClick={() => router.push("/market")}
            className="inline-flex items-center gap-1 text-[0.7rem] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <TrendingUp size={12} />
            <span className="hidden sm:inline">行情</span>
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-1 text-[0.7rem] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <Settings size={12} />
            <span className="hidden sm:inline">设置</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {user.avatar_url && (
                <Image
                  src={user.avatar_url}
                  alt={user.login}
                  width={20}
                  height={20}
                  className="rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700"
                />
              )}
              <span className="hidden sm:inline text-[0.7rem] text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">
                {user.name || user.login}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-[0.7rem] px-2 py-1 rounded-md text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>
    </header>
  );
}
