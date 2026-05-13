"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { MarketCenter } from "@/components/market-center";
import { useSettingsStore } from "@/stores/settings-store";
import type { MarketResponse } from "@/lib/api/types";

export default function MarketPage() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const [data, setData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/market");
        if (!res.ok) {
          const body = await res.json().catch(() => null) as { error?: { message?: string } } | null;
          throw new Error(body?.error?.message ?? "请求失败");
        }
        const json = await res.json() as { success: boolean; data: MarketResponse };
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0a0a0b] ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32 gap-2 animate-fade-in">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : data ? (
          <MarketCenter darkMode={darkMode} data={data} />
        ) : null}
      </main>
    </div>
  );
}
