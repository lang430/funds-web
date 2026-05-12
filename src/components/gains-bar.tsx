"use client";

import { useFundStore } from "@/stores/fund-store";
import { useSettingsStore } from "@/stores/settings-store";

export function GainsBar() {
  const { valuations } = useFundStore();
  const { showGains, showCost } = useSettingsStore();

  let totalGains = 0;
  let totalCostGains = 0;
  let totalAmount = 0;

  for (const item of valuations) {
    totalGains += item.gains ?? 0;
    totalCostGains += item.costGains ?? 0;
    totalAmount += item.amount ?? 0;
  }

  if (valuations.length === 0) return null;

  const gainsRate = totalAmount > 0 ? (totalGains / totalAmount) * 100 : 0;
  const costGainsRate = totalAmount > 0 ? (totalCostGains / totalAmount) * 100 : 0;

  const gainsColor = totalGains > 0 ? "color-up" : totalGains < 0 ? "color-down" : "text-zinc-500";
  const costColor = totalCostGains > 0 ? "color-up" : totalCostGains < 0 ? "color-down" : "text-zinc-500";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-[0.75rem] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          收益情况
        </h2>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {showGains && (
            <div className="min-w-[140px]">
              <p className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 mb-1">今日收益</p>
              <p className={`text-sm sm:text-base font-bold font-mono ${gainsColor}`}>
                {totalGains > 0 ? "+" : ""}{totalGains.toFixed(2)}
              </p>
              <p className={`text-[0.7rem] font-mono mt-0.5 ${gainsColor}`}>
                {totalGains > 0 ? "+" : ""}{gainsRate.toFixed(2)}%
              </p>
            </div>
          )}
          {showCost && (
            <div className="min-w-[140px]">
              <p className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 mb-1">持有收益</p>
              <p className={`text-sm sm:text-base font-bold font-mono ${costColor}`}>
                {totalCostGains > 0 ? "+" : ""}{totalCostGains.toFixed(2)}
              </p>
              <p className={`text-[0.7rem] font-mono mt-0.5 ${costColor}`}>
                {totalCostGains > 0 ? "+" : ""}{costGainsRate.toFixed(2)}%
              </p>
            </div>
          )}
          <div className="min-w-[120px]">
            <p className="text-[0.65rem] text-zinc-400 dark:text-zinc-500 mb-1">持有金额</p>
            <p className="text-sm sm:text-base font-bold font-mono text-zinc-700 dark:text-zinc-300">
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
