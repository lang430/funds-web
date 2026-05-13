"use client";

import { useState } from "react";
import type { MarketResponse } from "@/lib/api/types";

const TABS = [
  { key: "flows", label: "大盘资金流向" },
  { key: "sectors", label: "行业板块" },
  { key: "north", label: "北向资金" },
  { key: "south", label: "南向资金" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatFlow(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e8) return (value / 1e8).toFixed(2) + " 亿";
  if (abs >= 1e4) return (value / 1e4).toFixed(2) + " 万";
  return value.toFixed(0);
}

interface FlowRowProps {
  name: string;
  up: number;
  down: number;
}

function FlowRow({ name, up, down }: FlowRowProps) {
  const net = up - down;
  const isPositive = net >= 0;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1 mr-4">
        {name}
      </span>
      <div className="flex items-center gap-4 text-sm shrink-0">
        <span className="text-red-500 w-18 text-right tabular-nums">
          {formatFlow(up)}
        </span>
        <span className="text-green-500 w-18 text-right tabular-nums">
          {formatFlow(down)}
        </span>
        <span
          className={`w-16 text-right tabular-nums font-medium ${
            isPositive ? "text-red-500" : "text-green-500"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatFlow(net)}
        </span>
      </div>
    </div>
  );
}

interface MarketCenterProps {
  darkMode?: boolean;
  data: MarketResponse;
}

export function MarketCenter({ data }: MarketCenterProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("flows");

  const currentData = data[activeTab] ?? [];

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-slate-200 dark:border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-150 relative ${
              activeTab === tab.key
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/3 right-1/3 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
        <span className="text-xs text-slate-400 dark:text-slate-500 w-1/3">
          名称
        </span>
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="w-18 text-right">流入</span>
          <span className="w-18 text-right">流出</span>
          <span className="w-16 text-right">净额</span>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-y-auto">
        {currentData.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
            暂无数据
          </div>
        ) : (
          currentData.map((item, i) => (
            <FlowRow
              key={`${activeTab}-${item.name}-${i}`}
              name={item.name}
              up={item.up}
              down={item.down}
            />
          ))
        )}
      </div>
    </div>
  );
}
