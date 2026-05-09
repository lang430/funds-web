"use client";

import { useEffect, useCallback, useRef } from "react";
import { useFundStore } from "@/stores/fund-store";
import { useIndicesStore } from "@/stores/indices-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { IndexBar } from "@/components/index-bar";
import { FundTable } from "@/components/fund-table";
import { ControlBar } from "@/components/control-bar";
import { SummaryBar } from "@/components/summary-bar";
import type { IndexResponse, FundValuation } from "@/lib/api/types";

const INDEX_POLL_INTERVAL = 5000;
const FUNDS_POLL_INTERVAL = 60000;

interface FundResponse {
  valuations: FundValuation[];
  fundList: { code: string; shares: number; cost: number }[];
}

interface HolidayResponse {
  isDuringDate: boolean;
}

export default function HomePage() {
  const { fundList, valuations, setFundList, setValuations, setLoading,
    isEdit, setIsEdit, isLiveUpdate, setIsLiveUpdate,
    isDuringDate, setIsDuringDate } = useFundStore();
  const { selectedCodes, setIndexData, setLoading: setIndexLoading } = useIndicesStore();
  const { darkMode, normalFont, showGains, showCost, showCostRate, showAmount, showGSZ } = useSettingsStore();
  const { deviceId } = useAuthStore();

  const indicesTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fundsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIndices = useCallback(async () => {
    if (selectedCodes.length === 0) return;
    try {
      const res = await fetch(`/api/index?codes=${selectedCodes.join(",")}`);
      if (!res.ok) return;
      const data: IndexResponse = await res.json();
      if (data.data?.diff) {
        setIndexData(data.data.diff);
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
  }, [deviceId, setValuations, setFundList, setLoading]);

  const fetchHoliday = useCallback(async () => {
    try {
      const res = await fetch("/api/holiday");
      if (!res.ok) return;
      const data: HolidayResponse = await res.json();
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
    <div className={`max-w-4xl mx-auto p-3 font-sans text-xs ${normalFont ? "normal-font" : ""} ${darkMode ? "dark:bg-bg-dark" : ""}`}>
      <IndexBar isEdit={isEdit} />
      {valuations.length === 0 ? (
        <div className="flex items-center flex-col gap-3 p-12 text-zinc-400">
          <div className="animate-spin-slow w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          <span>加载中…</span>
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
    </div>
  );
}
