"use client";

import { useFundStore } from "@/stores/fund-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Star, GripVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isEdit: boolean;
  onRefresh: () => void;
}

const DEBOUNCE_MS = 700;

const SORT_FIELDS = [
  { key: "gszzl", label: "GSZZL" },
  { key: "amount", label: "金额" },
  { key: "gains", label: "收益" },
  { key: "costGains", label: "成本收益" },
  { key: "costGainsRate", label: "成本收益率" },
] as const;

function gainColor(value: number): string {
  if (value > 0) return "color-up";
  if (value < 0) return "color-down";
  return "text-slate-600 dark:text-slate-400";
}

function formatNum(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "--";
  return value.toFixed(decimals);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function SortIcon({ field, currentSort, direction }: { field: string; currentSort: string | null; direction: string }) {
  if (field !== currentSort) return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600" />;
  if (direction === "asc") return <ArrowUp size={12} className="text-blue-500" />;
  return <ArrowDown size={12} className="text-blue-500" />;
}

export function FundTable({ isEdit, onRefresh }: Props) {
  const { fundList, valuations, sortType, sortDirection, setSort, getSortedValuations } =
    useFundStore();
  const { showGSZ, showAmount, showCost, showCostRate, showGains } =
    useSettingsStore();

  const [editingShares, setEditingShares] = useState<Record<string, string>>({});
  const [editingCost, setEditingCost] = useState<Record<string, string>>({});
  const sharesTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const costTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const sorted = (getSortedValuations ? getSortedValuations() : valuations) || [];

  useEffect(() => {
    return () => {
      Object.values(sharesTimers.current).forEach(clearTimeout);
      Object.values(costTimers.current).forEach(clearTimeout);
    };
  }, []);

  const debouncedUpdate = useCallback(
    (code: string, field: "shares" | "cost", value: string) => {
      const timers = field === "shares" ? sharesTimers : costTimers;
      if (timers.current[code]) clearTimeout(timers.current[code]);

      timers.current[code] = setTimeout(async () => {
        const num = parseFloat(value);
        if (isNaN(num)) return;

        try {
          const body: Record<string, number> = {};
          body[field] = num;
          await fetch(`/api/funds/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, ...body }),
          });
          onRefresh();
        } catch {
          // 更新失败
        }
      }, DEBOUNCE_MS);
    },
    [onRefresh]
  );

  const handleDelete = useCallback(
    async (code: string) => {
      try {
        await fetch(`/api/funds/delete?code=${encodeURIComponent(code)}`, {
          method: "DELETE",
        });
        onRefresh();
      } catch {
        // 删除失败
      }
    },
    [onRefresh]
  );

  const handleToggleFocus = useCallback(
    async (code: string) => {
      try {
        const item = fundList.find((f) => f.code === code);
        if (!item) return;
        await fetch(`/api/funds/update`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, isFocused: !(item as unknown as Record<string, unknown>).isFocused }),
        });
        onRefresh();
      } catch {
        // 更新失败
      }
    },
    [fundList, onRefresh]
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-slate-400 dark:text-slate-500">
        暂无基金数据
      </div>
    );
  }

  const thClass = "px-3 py-2.5 text-right font-medium text-[0.72rem] text-slate-400 dark:text-slate-500 uppercase tracking-wider";
  const thSortClass = "px-3 py-2.5 text-right font-medium text-[0.72rem] text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors";
  const tdClass = "px-3 py-2.5 font-mono text-[0.78rem] tnum";
  const tdRightClass = "px-3 py-2.5 font-mono text-[0.78rem] tnum";

  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            {isEdit && <th className="px-2 py-2.5 w-8" />}
            <th className="px-3 py-2.5 text-left font-medium text-[0.72rem] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              基金名称
            </th>
            {isEdit && (
              <th className="px-3 py-2.5 text-left font-medium text-[0.72rem] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                代码
              </th>
            )}
            {showGSZ && (
              <th className={thClass}>
                估算净值
              </th>
            )}
            {showAmount && (
              <th className={thSortClass} onClick={() => setSort("amount")}>
                <span className="inline-flex items-center gap-1">
                  金额
                  <SortIcon field="amount" currentSort={sortType} direction={sortDirection} />
                </span>
              </th>
            )}
            {showCost && (
              <th className={thClass}>
                成本
              </th>
            )}
            {showCostRate && (
              <th className={thClass}>
                成本率
              </th>
            )}
            <th className={thSortClass} onClick={() => setSort("gszzl")}>
              <span className="inline-flex items-center gap-1">
                GSZZL
                <SortIcon field="gszzl" currentSort={sortType} direction={sortDirection} />
              </span>
            </th>
            {showGains && (
              <th className={thSortClass} onClick={() => setSort("gains")}>
                <span className="inline-flex items-center gap-1">
                  收益
                  <SortIcon field="gains" currentSort={sortType} direction={sortDirection} />
                </span>
              </th>
            )}
            <th className={thClass}>
              更新时间
            </th>
            {isEdit && <th className="px-2 py-2.5 w-8" />}
            {isEdit && <th className="px-2 py-2.5 w-8" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => {
            const fundItem = (fundList || []).find((f) => f.code === item.fundcode);
            const code = item.fundcode;
            const gszzlColor = gainColor(item.gszzl);
            const gainsColor = gainColor(item.gains);
            const costGainsColor = gainColor(item.costGains);
            const isFocused = (fundItem as unknown as Record<string, unknown>)?.isFocused as boolean;

            return (
              <tr
                key={code}
                className="table-row-hover group transition-colors"
              >
                {isEdit && (
                  <td className="px-2 py-2.5">
                    <GripVertical size={14} className="text-slate-300 dark:text-slate-600 cursor-grab group-hover:text-slate-400 dark:group-hover:text-slate-500" />
                  </td>
                )}
                <td className="px-3 py-2.5 max-w-[160px] truncate text-[0.82rem]">
                  {isEdit ? (
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={`/fund/${code}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {item.name}
                    </Link>
                  )}
                </td>
                {isEdit && (
                  <td className="px-3 py-2.5 font-mono text-[0.72rem] text-slate-400 dark:text-slate-500">
                    {code}
                  </td>
                )}
                {showGSZ && (
                  <td className={`${tdRightClass} text-slate-600 dark:text-slate-300`}>
                    {formatNum(item.gsz, 4)}
                  </td>
                )}
                {showAmount && (
                  <td className={tdRightClass}>
                    {formatNum(item.amount)}
                  </td>
                )}
                {showCost && (
                  <td className={`${tdRightClass} text-slate-500 dark:text-slate-400`}>
                    {formatNum(item.cost)}
                  </td>
                )}
                {showCostRate && (
                  <td className={`${tdRightClass} text-slate-500 dark:text-slate-400`}>
                    {formatPercent(item.costGainsRate)}
                  </td>
                )}
                <td className={cn("px-3 py-2.5 font-mono text-[0.82rem] font-semibold tnum", gszzlColor)}>
                  {formatPercent(item.gszzl)}
                </td>
                {showGains && (
                  <td className={cn("px-3 py-2.5 font-mono text-[0.82rem] font-semibold tnum", gainsColor)}>
                    {formatNum(item.gains)}
                  </td>
                )}
                <td className="px-3 py-2.5 text-[0.7rem] text-slate-400 dark:text-slate-500 font-mono tnum">
                  {item.gztime || "--"}
                </td>
                {isEdit && (
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => handleToggleFocus(code)}
                      className={cn(
                        "transition-colors",
                        isFocused ? "text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                      )}
                      title="关注"
                    >
                      <Star size={14} />
                    </button>
                  </td>
                )}
                {isEdit && (
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => handleDelete(code)}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isEdit && (
        <div className="mt-4 space-y-2.5 border-t border-slate-100 dark:border-white/5 pt-4">
          <p className="text-[0.72rem] text-slate-400 dark:text-slate-500 mb-3 font-medium">编辑份额与成本</p>
          {sorted.map((item) => {
            const code = item.fundcode;
            const fundItem = fundList.find((f) => f.code === code);
            const shares =
              editingShares[code] ?? fundItem?.shares?.toString() ?? "";
            const cost =
              editingCost[code] ?? fundItem?.cost?.toString() ?? "";

            return (
              <div
                key={code}
                className="flex items-center gap-3 text-[0.78rem]"
              >
                <span className="w-[140px] truncate text-slate-600 dark:text-slate-300">
                  {item.name}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="份额"
                  value={shares}
                  onChange={(e) => {
                    setEditingShares((prev) => ({
                      ...prev,
                      [code]: e.target.value,
                    }));
                    debouncedUpdate(code, "shares", e.target.value);
                  }}
                  className="w-24 px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-[0.78rem] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-shadow"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="成本"
                  value={cost}
                  onChange={(e) => {
                    setEditingCost((prev) => ({
                      ...prev,
                      [code]: e.target.value,
                    }));
                    debouncedUpdate(code, "cost", e.target.value);
                  }}
                  className="w-24 px-3 py-1.5 border border-slate-200 dark:border-white/10 rounded-lg text-[0.78rem] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-shadow"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
