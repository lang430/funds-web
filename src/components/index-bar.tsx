"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useIndicesStore, DEFAULT_INDICES } from "@/stores/indices-store";
import { Plus, X, Star, TrendingUp, TrendingDown } from "lucide-react";
import type { IndexDiff } from "@/lib/api/types";

interface Props {
  isEdit: boolean;
}

const POLL_INTERVAL = 5000;

function formatChange(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

function formatChangePercent(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}%`;
  return `${value.toFixed(2)}%`;
}

export function IndexBar({ isEdit }: Props) {
  const {
    selectedCodes,
    indexData,
    focusedIndex,
    setIndexData,
    addIndex,
    removeIndex,
    setFocusedIndex,
  } = useIndicesStore();

  const [showSelect, setShowSelect] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  const fetchIndices = useCallback(async () => {
    if (selectedCodes.length === 0) return;
    try {
      const res = await fetch(`/api/index?codes=${selectedCodes.join(",")}`);
      if (!res.ok) return;
      const json = await res.json() as { success: boolean; data: IndexDiff[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setIndexData(json.data);
      }
    } catch {
      // 指数数据获取失败
    }
  }, [selectedCodes, setIndexData]);

  useEffect(() => {
    fetchIndices();
    timerRef.current = setInterval(fetchIndices, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchIndices]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setShowSelect(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableIndices = (DEFAULT_INDICES || []).filter(
    (idx) => !selectedCodes.includes(idx.value)
  );

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h2>市场行情</h2>
      </div>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {indexData && indexData.length > 0 && indexData.map((item, i) => {
            const code = selectedCodes[i];
            if (!code) return null;
            const label = DEFAULT_INDICES.find((d) => d.value === code)?.label ?? code;
            const isFocused = focusedIndex === code;
            const change = item.f3 ?? 0;
            const changePercent = item.f13 ?? 0;
            const isUp = change >= 0;
            const colorClass = isUp ? "color-up" : "color-down";

            return (
              <div
                key={code}
                className={`relative rounded-lg border p-3 transition-all duration-200 ${
                  isFocused
                    ? "ring-1 ring-blue-400/50 border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-sm"
                }`}
              >
                {isEdit && (
                  <button
                    onClick={() => removeIndex(i)}
                    className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 z-10 shadow-sm"
                    title="移除"
                  >
                    <X size={10} />
                  </button>
                )}
                {isEdit && (
                  <button
                    onClick={() => setFocusedIndex(isFocused ? null : code)}
                    className={`absolute -top-2 left-1 w-4 h-4 flex items-center justify-center ${
                      isFocused ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                    } hover:text-amber-400 z-10`}
                    title="关注"
                  >
                    <Star size={10} />
                  </button>
                )}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 truncate">
                    {label}
                  </span>
                  {isUp ? (
                    <TrendingUp size={12} className="text-red-400 shrink-0" />
                  ) : (
                    <TrendingDown size={12} className="text-green-400 shrink-0" />
                  )}
                </div>
                <p className={`text-sm font-bold font-mono mb-1 ${colorClass}`}>
                  {item.f2}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-[0.7rem] font-mono font-medium ${colorClass}`}>
                    {formatChange(change)}
                  </span>
                  <span className={`text-[0.7rem] font-mono font-medium ${colorClass}`}>
                    {formatChangePercent(changePercent)}
                  </span>
                </div>
              </div>
            );
          })}
          {isEdit && selectedCodes.length < 4 && (
            <div className="relative flex items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-700 min-h-[96px] bg-slate-50/50 dark:bg-transparent" ref={selectRef}>
              <button
                onClick={() => setShowSelect(!showSelect)}
                className="flex items-center gap-1.5 text-[0.7rem] text-slate-400 hover:text-blue-500 transition-colors"
              >
                <Plus size={14} />
                添加指数
              </button>
              {showSelect && availableIndices.length > 0 && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg shadow-slate-200/50 dark:shadow-black/20 max-h-48 overflow-y-auto min-w-[150px] py-1">
                  {availableIndices.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        addIndex(item.value);
                        setShowSelect(false);
                      }}
                      className="block w-full text-left px-3.5 py-2 text-[0.75rem] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
