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
    <div className="flex flex-wrap gap-2 mb-3">
      {indexData && indexData.length > 0 && indexData.map((item, i) => {
        const code = selectedCodes[i];
        if (!code) return null;
        const label =
          DEFAULT_INDICES.find((d) => d.value === code)?.label ?? code;
        const isFocused = focusedIndex === code;
        const change = item.f3 ?? 0;
        const changePercent = item.f13 ?? 0;
        const isUp = change >= 0;
        const colorClass = isUp ? "text-up" : "text-down";

        return (
          <div
            key={code}
            className={`relative flex flex-col items-center min-w-[80px] px-2 py-1 rounded border border-gray-200 dark:border-border-dark ${
              isFocused ? "ring-1 ring-primary" : ""
            }`}
          >
            {isEdit && (
              <button
                onClick={() => removeIndex(i)}
                className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                title="移除"
              >
                <X size={10} />
              </button>
            )}
            {isEdit && (
              <button
                onClick={() => setFocusedIndex(isFocused ? null : code)}
                className={`absolute -top-1 left-0 w-4 h-4 flex items-center justify-center ${
                  isFocused ? "text-yellow-400" : "text-gray-400"
                } hover:text-yellow-400`}
                title="关注"
              >
                <Star size={10} />
              </button>
            )}
            <h5 className="text-xs text-gray-500 dark:text-text-dark truncate max-w-[80px]">
              {label}
            </h5>
            <span className={`text-xs font-bold ${colorClass}`}>
              {item.f2}
            </span>
            <span className={`text-[10px] ${colorClass}`}>
              {formatChange(change)}
            </span>
            <span className={`text-[10px] ${colorClass}`}>
              {formatChangePercent(changePercent)}
            </span>
          </div>
        );
      })}
      {isEdit && selectedCodes.length < 4 && (
        <div className="relative" ref={selectRef}>
          <button
            onClick={() => setShowSelect(!showSelect)}
            className="flex items-center justify-center w-8 h-8 rounded border border-dashed border-gray-300 dark:border-border-dark hover:border-primary text-gray-400 hover:text-primary"
            title="添加指数"
          >
            <Plus size={14} />
          </button>
          {showSelect && availableIndices.length > 0 && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-border-dark rounded shadow-lg max-h-48 overflow-y-auto min-w-[120px]">
              {availableIndices.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    addIndex(item.value);
                    setShowSelect(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-text-dark"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
