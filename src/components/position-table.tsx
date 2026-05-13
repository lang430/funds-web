"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { FundPositionRaw } from "@/lib/api/types";

interface Props {
  data: FundPositionRaw[];
  darkMode?: boolean;
}

type SortDir = "none" | "asc" | "desc";

function getSortIcon(dir: SortDir) {
  if (dir === "asc") return <ArrowUp className="w-3.5 h-3.5" />;
  if (dir === "desc") return <ArrowDown className="w-3.5 h-3.5" />;
  return <ArrowUpDown className="w-3.5 h-3.5" />;
}

export function PositionTable({ data }: Props) {
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

  if (data.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">暂无持仓数据</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h2>持仓明细</h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="table-base">
          <thead className="sticky top-0 bg-white dark:bg-[#111113] z-10">
            <tr>
              <th className="!w-32">股票代码</th>
              <th>股票名称</th>
              <th className="!text-right cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300" onClick={toggleSort}>
                <span className="inline-flex items-center gap-1.5">
                  占比
                  {getSortIcon(sortDir)}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => {
              const pct = parseFloat(item.JZBL);
              return (
                <tr key={`${item.GPDM}-${i}`} className="table-row-hover">
                  <td className="!font-mono text-slate-500 dark:text-slate-400">
                    {item.GPDM}
                  </td>
                  <td className="text-slate-800 dark:text-slate-200">
                    {item.GPJC}
                  </td>
                  <td className="!text-right font-mono text-slate-700 dark:text-slate-200 font-medium tnum">
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
