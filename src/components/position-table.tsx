"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { FundPositionRaw } from "@/lib/api/types";

interface Props {
  data: FundPositionRaw[];
  darkMode: boolean;
}

type SortDir = "none" | "asc" | "desc";

export function PositionTable({ data, darkMode: _darkMode }: Props) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    if (sortDir === "none") return data;
    return [...data].sort((a, b) => {
      const va = parseFloat(a.JZBL) || 0;
      const vb = parseFloat(b.JZBL) || 0;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [data, sortDir]);

  const toggleSort = () => {
    setSortDir((prev) => (prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc"));
  };

  const SortIcon = () => {
    if (sortDir === "asc") return <ArrowUp className="w-3 h-3" />;
    if (sortDir === "desc") return <ArrowDown className="w-3 h-3" />;
    return <ArrowUpDown className="w-3 h-3" />;
  };

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <p className="text-[0.7rem] sm:text-xs text-zinc-400 text-center py-4">暂无持仓数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-[0.75rem] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          持仓明细
        </h2>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full text-[0.7rem] sm:text-xs">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/50">
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-2 text-left font-medium w-24">股票代码</th>
              <th className="px-4 py-2 text-left font-medium">股票名称</th>
              <th
                className="px-4 py-2 text-right font-medium cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200"
                onClick={toggleSort}
              >
                <span className="inline-flex items-center gap-1">
                  占比
                  <SortIcon />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => {
              const pct = parseFloat(item.JZBL);
              return (
                <tr
                  key={`${item.GPDM}-${i}`}
                  className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-4 py-2 font-mono text-zinc-600 dark:text-zinc-400">
                    {item.GPDM}
                  </td>
                  <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                    {item.GPJC}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-zinc-800 dark:text-zinc-200">
                    {isNaN(pct) ? "--" : `${pct.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
