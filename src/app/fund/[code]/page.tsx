"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FundInfoCard } from "@/components/fund-info-card";
import { FundChart } from "@/components/fund-chart";
import { PositionTable } from "@/components/position-table";
import { useTheme } from "@/components/theme-provider";
import type { FundInfoRaw, FundPositionRaw } from "@/lib/api/types";

export const runtime = "edge";

const API_BASE = "/api/funds";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

type InfoResponse = ApiResponse<FundInfoRaw>;
type ChartResponse = ApiResponse<string[]>;
type PositionResponse = ApiResponse<FundPositionRaw[]>;

export default function FundDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { darkMode } = useTheme();

  const [info, setInfo] = useState<FundInfoRaw | null>(null);
  const [klines, setKlines] = useState<string[]>([]);
  const [positions, setPositions] = useState<FundPositionRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState("1m");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [infoRes, chartRes, posRes] = await Promise.all([
        fetch(`${API_BASE}/${code}`),
        fetch(`${API_BASE}/${code}/chart?range=${chartRange}`),
        fetch(`${API_BASE}/${code}/position`),
      ]);

      if (!infoRes.ok) {
        setError("获取基金信息失败");
        setLoading(false);
        return;
      }

      const infoJson: InfoResponse = await infoRes.json();
      if (!infoJson.success) {
        setError(infoJson.error?.message || "获取基金信息失败");
        setLoading(false);
        return;
      }

      const chartJson = chartRes.ok
        ? await fetchJson<ChartResponse>(chartRes)
        : null;
      const posJson = posRes.ok
        ? await fetchJson<PositionResponse>(posRes)
        : null;

      setInfo(infoJson.data);
      setKlines(chartJson?.data || []);
      setPositions(posJson?.data || []);
    } catch {
      setError("网络请求失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, [code, chartRange]);

  async function fetchJson<T extends ApiResponse<unknown>>(res: Response): Promise<T | null> {
    try {
      const j: T = await res.json();
      return j.success ? j : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-1.5 text-xs rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回
        </button>

        {info && <FundInfoCard data={info} darkMode={darkMode} />}
        {klines.length > 0 && (
          <FundChart
            data={klines}
            type="nav"
            range={chartRange}
            onRangeChange={setChartRange}
            darkMode={darkMode}
          />
        )}
        {positions.length > 0 && (
          <PositionTable data={positions} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}
