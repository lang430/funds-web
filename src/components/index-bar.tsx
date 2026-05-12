"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useIndicesStore, DEFAULT_INDICES } from "@/stores/indices-store";
import { Plus, X, Star } from "lucide-react";
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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-[0.75rem] sm:text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          市场行情
        </h2>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                className={`relative rounded-lg border p-2.5 sm:p-3 ${
                  isFocused
                    ? "ring-1 ring-primary border-primary/30 bg-primary/[0.02]"
                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                }`}
              >
                {isEdit && (
                  <button
                    onClick={() => removeIndex(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
                    title="移除"
                  >
                    <X size={10} />
                  </button>
                )}
                {isEdit && (
                  <button
                    onClick={() => setFocusedIndex(isFocused ? null : code)}
                    className={`absolute -top-1.5 left-0 w-4 h-4 flex items-center justify-center ${
                      isFocused ? "text-yellow-400" : "text-zinc-300"
                    } hover:text-yellow-400 z-10`}
                    title="关注"
                  >
                    <Star size={10} />
                  </button>
                )}
                <p className="text-[0.6rem] sm:text-[0.65rem] text-zinc-400 dark:text-zinc-500 truncate mb-1">
                  {label}
                </p>
                <p className={`text-xs sm:text-sm font-bold font-mono ${colorClass}`}>
                  {item.f2}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[0.6rem] sm:text-[0.65rem] font-mono ${colorClass}`}>
                    {formatChange(change)}
                  </span>
                  <span className={`text-[0.6rem] sm:text-[0.65rem] font-mono ${colorClass}`}>
                    {formatChangePercent(changePercent)}
                  </span>
                </div>
              </div>
            );
          })}
          {isEdit && selectedCodes.length < 4 && (
            <div className="relative flex items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 min-h-[80px]" ref={selectRef}>
              <button
                onClick={() => setShowSelect(!showSelect)}
                className="flex items-center gap-1 text-[0.65rem] text-zinc-400 hover:text-primary transition-colors"
              >
                <Plus size={14} />
                添加指数
              </button>
              {showSelect && availableIndices.length > 0 && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-44 overflow-y-auto min-w-[140px]">
                  {availableIndices.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        addIndex(item.value);
                        setShowSelect(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-[0.65rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
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
