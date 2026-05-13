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
import { GainsBar } from "@/components/gains-bar";
import type { IndexDiff, FundValuation } from "@/lib/api/types";

const INDEX_POLL_INTERVAL = 5000;
const FUNDS_POLL_INTERVAL = 60000;

export default function HomePage() {
  const { valuations, loading, setValuations, setLoading,
    isEdit, setIsEdit, isLiveUpdate, setIsLiveUpdate,
    isDuringDate, setIsDuringDate } = useFundStore();
  const { selectedCodes, setIndexData } = useIndicesStore();
  const { darkMode, normalFont } = useSettingsStore();
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
    Promise.all([fetchIndices(), fetchFunds(), fetchHoliday()]).finally(() => {});
  }, [fetchIndices, fetchFunds, fetchHoliday, setLoading]);

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    startPolling();
    return () => {
      if (indicesTimerRef.current) clearInterval(indicesTimerRef.current);
      if (fundsTimerRef.current) clearInterval(fundsTimerRef.current);
    };
  }, [startPolling]);

  const handleToggleEdit = useCallback(() => setIsEdit(!isEdit), [isEdit, setIsEdit]);
  const handleToggleLiveUpdate = useCallback(() => setIsLiveUpdate(!isLiveUpdate), [isLiveUpdate, setIsLiveUpdate]);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0a0a0b] ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 ${normalFont ? "normal-font" : ""}`}>
        {loading && valuations.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              </div>
              <span className="text-sm text-slate-400 dark:text-slate-500">加载中...</span>
            </div>
          </div>
        ) : valuations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
              <span className="text-blue-400 dark:text-blue-500 text-2xl font-light">¥</span>
            </div>
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">暂无基金数据</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                点击编辑按钮添加基金
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-[400px] shrink-0 space-y-5">
              <IndexBar isEdit={isEdit} />
              <GainsBar />
            </div>
            <div className="flex-1 min-w-0">
              <div className="card overflow-hidden">
                <div className="card-header flex items-center justify-between flex-wrap gap-3">
                  <h2>
                    基金持仓
                    <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal text-xs">
                      {valuations.length}
                    </span>
                  </h2>
                  <ControlBar
                    isEdit={isEdit}
                    isLiveUpdate={isLiveUpdate}
                    isDuringDate={isDuringDate}
                    onToggleEdit={handleToggleEdit}
                    onToggleLiveUpdate={handleToggleLiveUpdate}
                    onRefresh={refresh}
                  />
                </div>
                <div className="p-0 sm:p-4">
                  <FundTable isEdit={isEdit} onRefresh={refresh} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
