"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-[0.7rem] sm:text-xs text-zinc-700 dark:text-zinc-300 truncate flex-1 mr-2">
        {name}
      </span>
      <div className="flex items-center gap-3 text-[0.7rem] sm:text-xs shrink-0">
        <span className="text-red-500 w-16 text-right tabular-nums">
          {formatFlow(up)}
        </span>
        <span className="text-green-500 w-16 text-right tabular-nums">
          {formatFlow(down)}
        </span>
        <span
          className={cn(
            "w-14 text-right tabular-nums font-medium",
            isPositive ? "text-red-500" : "text-green-500"
          )}
        >
          {isPositive ? "+" : ""}
          {formatFlow(net)}
        </span>
      </div>
    </div>
  );
}

interface MarketCenterProps {
  darkMode: boolean;
  data: MarketResponse;
}

export function MarketCenter({ data }: MarketCenterProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("flows");

  const currentData = data[activeTab] ?? [];

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2.5 text-[0.7rem] sm:text-xs font-medium transition-colors relative",
              activeTab === tab.key
                ? "text-red-500"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-[0.6rem] sm:text-[10px] text-zinc-400 dark:text-zinc-500 w-1/3">
          名称
        </span>
        <div className="flex items-center gap-3 text-[0.6rem] sm:text-[10px] text-zinc-400 dark:text-zinc-500">
          <span className="w-16 text-right">流入</span>
          <span className="w-16 text-right">流出</span>
          <span className="w-14 text-right">净额</span>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {currentData.length === 0 ? (
          <div className="py-12 text-center text-[0.7rem] sm:text-xs text-zinc-400">
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
