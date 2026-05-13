"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { FundInfoCard } from "@/components/fund-info-card";
import { FundChart } from "@/components/fund-chart";
import { PositionTable } from "@/components/position-table";
import { useTheme } from "@/components/theme-provider";
import type { FundInfoRaw, FundPositionRaw } from "@/lib/api/types";

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

  async function fetchJson<T extends ApiResponse<unknown>>(res: Response): Promise<T | null> {
    try {
      const j: T = await res.json();
      return j.success ? j : null;
    } catch {
      return null;
    }
  }

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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0b]">
        <NavBar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0b]">
        <NavBar />
        <div className="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn btn-outline text-xs"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0b] text-slate-800 dark:text-slate-200">
      <NavBar />
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 py-6 space-y-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
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
