"use client";

import { useFundStore } from "@/stores/fund-store";
import { useSettingsStore } from "@/stores/settings-store";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

  const gainsTrend = totalGains > 0 ? "up" : totalGains < 0 ? "down" : "flat";
  const costTrend = totalCostGains > 0 ? "up" : totalCostGains < 0 ? "down" : "flat";

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp size={14} className="text-red-500" />;
    if (trend === "down") return <TrendingDown size={14} className="text-green-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const gainsColor = totalGains > 0 ? "color-up" : totalGains < 0 ? "color-down" : "text-slate-500 dark:text-slate-400";
  const costColor = totalCostGains > 0 ? "color-up" : totalCostGains < 0 ? "color-down" : "text-slate-500 dark:text-slate-400";

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h2>收益情况</h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-4">
          {showGains && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[0.7rem] text-slate-400 dark:text-slate-500">今日收益</span>
                <TrendIcon trend={gainsTrend} />
              </div>
              <p className={`text-base font-bold font-mono tnum ${gainsColor}`}>
                {totalGains > 0 ? "+" : ""}{totalGains.toFixed(2)}
              </p>
              <p className={`text-[0.75rem] font-mono mt-0.5 tnum ${gainsColor}`}>
                {totalGains > 0 ? "+" : ""}{gainsRate.toFixed(2)}%
              </p>
            </div>
          )}
          {showCost && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[0.7rem] text-slate-400 dark:text-slate-500">持有收益</span>
                <TrendIcon trend={costTrend} />
              </div>
              <p className={`text-base font-bold font-mono tnum ${costColor}`}>
                {totalCostGains > 0 ? "+" : ""}{totalCostGains.toFixed(2)}
              </p>
              <p className={`text-[0.75rem] font-mono mt-0.5 tnum ${costColor}`}>
                {totalCostGains > 0 ? "+" : ""}{costGainsRate.toFixed(2)}%
              </p>
            </div>
          )}
          <div>
            <span className="text-[0.7rem] text-slate-400 dark:text-slate-500 mb-1.5 block">持有金额</span>
            <p className="text-base font-bold font-mono tnum text-slate-700 dark:text-slate-200">
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
