"use client";

import { useFundStore } from "@/stores/fund-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Trash2, Star, GripVertical, ArrowUpDown } from "lucide-react";

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
  return "";
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
      <div className="text-center py-8 text-[0.75rem] sm:text-xs text-gray-400 dark:text-text-dark">
        暂无基金数据
      </div>
    );
  }

  return (
    <div className="responsive-table">
      <table className="w-full border-collapse text-[0.7rem] sm:text-xs">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border-dark sticky top-0 bg-white dark:bg-bg-dark z-10">
            {isEdit && <th className="px-1 py-2 w-6" />}
            <th className="px-1 py-2 text-left font-medium text-gray-500 dark:text-text-dark">
              基金名称
            </th>
            {isEdit && (
              <th className="px-1 py-2 text-left font-medium text-gray-500 dark:text-text-dark">
                代码
              </th>
            )}
            {showGSZ && (
              <th className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark">
                估算净值
              </th>
            )}
            {showAmount && (
              <th
                className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark cursor-pointer select-none"
                onClick={() => setSort("amount")}
              >
                <span className="inline-flex items-center gap-0.5">
                  金额
                  <ArrowUpDown size={10} />
                </span>
              </th>
            )}
            {showCost && (
              <th className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark">
                成本
              </th>
            )}
            {showCostRate && (
              <th className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark">
                成本率
              </th>
            )}
            <th
              className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark cursor-pointer select-none"
              onClick={() => setSort("gszzl")}
            >
              <span className="inline-flex items-center gap-0.5">
                GSZZL
                <ArrowUpDown size={10} />
              </span>
            </th>
            {showGains && (
              <th
                className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark cursor-pointer select-none"
                onClick={() => setSort("gains")}
              >
                <span className="inline-flex items-center gap-0.5">
                  收益
                  <ArrowUpDown size={10} />
                </span>
              </th>
            )}
            <th className="px-1 py-2 text-right font-medium text-gray-500 dark:text-text-dark">
              更新时间
            </th>
            {isEdit && <th className="px-1 py-2 w-6" />}
            {isEdit && <th className="px-1 py-2 w-6" />}
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
                className="table-row-hover border-b border-gray-100 dark:border-white/5"
              >
                {isEdit && (
                  <td className="px-1 py-1.5">
                    <GripVertical size={12} className="text-gray-300 dark:text-text-dark cursor-grab" />
                  </td>
                )}
                <td className="px-1 py-1.5 max-w-[140px] truncate">
                  {isEdit ? (
                    <span className="text-gray-700 dark:text-text-dark">
                      {item.name}
                    </span>
                  ) : (
                    <Link
                      href={`/fund/${code}`}
                      className="text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  )}
                </td>
                {isEdit && (
                  <td className="px-1 py-1.5 text-gray-500 dark:text-text-dark font-mono">
                    {code}
                  </td>
                )}
                {showGSZ && (
                  <td className="px-1 py-1.5 text-right font-mono text-gray-700 dark:text-text-dark">
                    {formatNum(item.gsz, 4)}
                  </td>
                )}
                {showAmount && (
                  <td className="px-1 py-1.5 text-right font-mono whitespace-nowrap">
                    {formatNum(item.amount)}
                  </td>
                )}
                {showCost && (
                  <td className="px-1 py-1.5 text-right font-mono text-gray-500 dark:text-text-dark">
                    {formatNum(item.cost)}
                  </td>
                )}
                {showCostRate && (
                  <td className="px-1 py-1.5 text-right font-mono text-gray-500 dark:text-text-dark">
                    {formatPercent(item.costGainsRate)}
                  </td>
                )}
                <td
                  className={`px-1 py-1.5 text-right font-mono whitespace-nowrap ${gszzlColor}`}
                >
                  {formatPercent(item.gszzl)}
                </td>
                {showGains && (
                  <td
                    className={`px-1 py-1.5 text-right font-mono whitespace-nowrap ${gainsColor}`}
                  >
                    {formatNum(item.gains)}
                  </td>
                )}
                <td className="px-1 py-1.5 text-right text-gray-400 dark:text-text-dark font-mono text-[10px] whitespace-nowrap">
                  {item.gztime || "--"}
                </td>
                {isEdit && (
                  <td className="px-1 py-1.5">
                    <button
                      onClick={() => handleToggleFocus(code)}
                      className={`hover:text-yellow-400 ${
                        isFocused ? "text-yellow-400" : "text-gray-300 dark:text-text-dark"
                      }`}
                      title="关注"
                    >
                      <Star size={12} />
                    </button>
                  </td>
                )}
                {isEdit && (
                  <td className="px-1 py-1.5">
                    <button
                      onClick={() => handleDelete(code)}
                      className="text-gray-300 dark:text-text-dark hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isEdit && (
        <div className="mt-3 space-y-2 border-t border-gray-200 dark:border-border-dark pt-3">
          <p className="text-[0.7rem] sm:text-xs text-gray-500 dark:text-text-dark mb-2">编辑份额与成本</p>
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
                className="flex items-center gap-2 text-[0.7rem] sm:text-xs"
              >
                <span className="w-[120px] truncate text-gray-700 dark:text-text-dark">
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
                  className="w-20 px-2 py-1 border border-gray-200 dark:border-border-dark rounded text-[0.7rem] sm:text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-text-dark"
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
                  className="w-20 px-2 py-1 border border-gray-200 dark:border-border-dark rounded text-[0.7rem] sm:text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-text-dark"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
