"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          行情中心
        </h1>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            <span className="ml-2 text-xs text-zinc-400">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : data ? (
          <MarketCenter darkMode={darkMode} data={data} />
        ) : null}
      </main>
    </div>
  );
}
