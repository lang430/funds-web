"use client";

import { useFundStore } from "@/stores/fund-store";
import { useSettingsStore } from "@/stores/settings-store";

export function SummaryBar() {
  const { valuations } = useFundStore();
  const { showGains, showCost, darkMode } = useSettingsStore();

  if (valuations.length === 0) return null;

  let totalGains = 0;
  let totalCostGains = 0;
  let totalAmount = 0;

  for (const item of valuations) {
    totalGains += item.gains ?? 0;
    totalCostGains += item.costGains ?? 0;
    totalAmount += item.amount ?? 0;
  }

  const gainsRate = totalAmount > 0 ? (totalGains / totalAmount) * 100 : 0;
  const costGainsRate = totalAmount > 0 ? (totalCostGains / totalAmount) * 100 : 0;

  const totalGainsColor = totalGains > 0 ? "color-up" : totalGains < 0 ? "color-down" : "";
  const totalCostGainsColor = totalCostGains > 0 ? "color-up" : totalCostGains < 0 ? "color-down" : "";

  return (
    <div
      className={`mt-3 pt-3 border-t border-gray-200 dark:border-border-dark text-xs ${
        darkMode ? "dark:text-text-dark" : ""
      }`}
    >
      <div className="flex flex-wrap gap-4">
        {showGains && (
          <span>
            今日收益：
            <span className={`font-mono font-bold ${totalGainsColor}`}>
              {totalGains > 0 ? "+" : ""}
              {totalGains.toFixed(2)}
            </span>
            <span className={`ml-1 font-mono ${totalGainsColor}`}>
              ({totalGains > 0 ? "+" : ""}{gainsRate.toFixed(2)}%)
            </span>
          </span>
        )}
        {showCost && (
          <span>
            成本收益：
            <span className={`font-mono font-bold ${totalCostGainsColor}`}>
              {totalCostGains > 0 ? "+" : ""}
              {totalCostGains.toFixed(2)}
            </span>
            <span className={`ml-1 font-mono ${totalCostGainsColor}`}>
              ({totalCostGains > 0 ? "+" : ""}{costGainsRate.toFixed(2)}%)
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
