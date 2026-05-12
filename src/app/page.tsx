"use client";

import { useEffect, useCallback, useRef } from "react";
import { useFundStore } from "@/stores/fund-store";
import { useIndicesStore } from "@/stores/indices-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { NavBar } from "@/components/nav-bar";
import { IndexBar } from "@/components/index-bar";
import { FundTable } from "@/components/fund-table";
import { ControlBar } from "@/components/control-bar";
import { SummaryBar } from "@/components/summary-bar";
import type { IndexDiff, FundValuation } from "@/lib/api/types";

const INDEX_POLL_INTERVAL = 5000;
const FUNDS_POLL_INTERVAL = 60000;

export default function HomePage() {
  const { valuations, loading, setValuations, setLoading,
    isEdit, setIsEdit, isLiveUpdate, setIsLiveUpdate,
    isDuringDate, setIsDuringDate } = useFundStore();
  const { selectedCodes, setIndexData, setLoading: setIndexLoading } = useIndicesStore();
  const { darkMode, normalFont, showGains, showCost } = useSettingsStore();
  const { deviceId } = useAuthStore();

  const indicesTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fundsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchIndices = useCallback(async () => {
    if (selectedCodes.length === 0) return;
    try {
      const res = await fetch(`/api/index?codes=${selectedCodes.join(",")}`);
      if (!res.ok) return;
      const json = await res.json() as { success: boolean; data: IndexDiff[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setIndexData(json.data);
      }
    } catch {
      // 指数数据获取失败，跳过
    }
  }, [selectedCodes, setIndexData]);

  const fetchFunds = useCallback(async () => {
    try {
      const res = await fetch(`/api/funds?deviceId=${encodeURIComponent(deviceId)}`);
      if (!res.ok) return;
      const json = await res.json() as { success: boolean; data: FundValuation[] };
      if (json.success && Array.isArray(json.data)) {
        setValuations(json.data);
      }
    } catch {
      // 基金数据获取失败，跳过
    } finally {
      setLoading(false);
    }
  }, [deviceId, setValuations, setLoading]);

  const fetchHoliday = useCallback(async () => {
    try {
      const res = await fetch("/api/holiday");
      if (!res.ok) return;
      const data = await res.json() as { isDuringDate: boolean };
      if (data.isDuringDate !== undefined) {
        setIsDuringDate(data.isDuringDate);
      }
    } catch {
      // 节假日查询失败，跳过
    }
  }, [setIsDuringDate]);

  const startPolling = useCallback(() => {
    if (indicesTimerRef.current) clearInterval(indicesTimerRef.current);
    if (fundsTimerRef.current) clearInterval(fundsTimerRef.current);

    indicesTimerRef.current = setInterval(fetchIndices, INDEX_POLL_INTERVAL);

    if (isLiveUpdate && isDuringDate) {
      fundsTimerRef.current = setInterval(fetchFunds, FUNDS_POLL_INTERVAL);
    }
  }, [fetchIndices, fetchFunds, isLiveUpdate, isDuringDate]);

  const refresh = useCallback(() => {
    setLoading(true);
    setIndexLoading(true);
    Promise.all([fetchIndices(), fetchFunds(), fetchHoliday()]).finally(() => {
      setIndexLoading(false);
    });
  }, [fetchIndices, fetchFunds, fetchHoliday, setLoading, setIndexLoading]);

  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    startPolling();
    return () => {
      if (indicesTimerRef.current) clearInterval(indicesTimerRef.current);
      if (fundsTimerRef.current) clearInterval(fundsTimerRef.current);
    };
  }, [startPolling]);

  const handleToggleEdit = useCallback(() => {
    setIsEdit(!isEdit);
  }, [isEdit, setIsEdit]);

  const handleToggleLiveUpdate = useCallback(() => {
    setIsLiveUpdate(!isLiveUpdate);
  }, [isLiveUpdate, setIsLiveUpdate]);

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className={`max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-[0.75rem] ${normalFont ? "text-[0.9rem]" : ""}`}>
        <IndexBar isEdit={isEdit} />
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-300 rounded-full animate-spin" />
              <span className="text-zinc-400 dark:text-zinc-500">加载中...</span>
            </div>
          </div>
        ) : valuations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-300 dark:text-zinc-600 text-lg">$</span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-500">暂无基金数据</span>
            <p className="text-[11px] text-zinc-300 dark:text-zinc-600">
              点击编辑按钮添加基金
            </p>
          </div>
        ) : (
          <>
            <ControlBar
              isEdit={isEdit}
              isLiveUpdate={isLiveUpdate}
              isDuringDate={isDuringDate}
              onToggleEdit={handleToggleEdit}
              onToggleLiveUpdate={handleToggleLiveUpdate}
              onRefresh={refresh}
            />
            <FundTable isEdit={isEdit} onRefresh={refresh} />
            {(showGains || showCost) && <SummaryBar />}
          </>
        )}
      </main>
    </div>
  );
}
