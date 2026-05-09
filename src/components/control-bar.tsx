"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, Edit3, Settings, TrendingUp, Pause, Play } from "lucide-react";

interface Props {
  isEdit: boolean;
  isLiveUpdate: boolean;
  isDuringDate: boolean;
  onToggleEdit: () => void;
  onToggleLiveUpdate: () => void;
  onRefresh: () => void;
}

export function ControlBar({
  isEdit,
  isLiveUpdate,
  isDuringDate,
  onToggleEdit,
  onToggleLiveUpdate,
  onRefresh,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <button
        onClick={() => router.push("/market")}
        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-text-dark"
      >
        <TrendingUp size={12} />
        行情中心
      </button>

      {isDuringDate && (
        <button
          onClick={onToggleLiveUpdate}
          className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded border ${
            isLiveUpdate
              ? "border-primary text-primary hover:bg-primary/10"
              : "border-gray-200 dark:border-border-dark text-gray-700 dark:text-text-dark hover:bg-gray-50 dark:hover:bg-white/10"
          }`}
        >
          {isLiveUpdate ? <Pause size={12} /> : <Play size={12} />}
          {isLiveUpdate ? "暂停" : "实时更新"}
        </button>
      )}

      <button
        onClick={onToggleEdit}
        className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded border ${
          isEdit
            ? "border-primary text-primary bg-primary/5 hover:bg-primary/10"
            : "border-gray-200 dark:border-border-dark text-gray-700 dark:text-text-dark hover:bg-gray-50 dark:hover:bg-white/10"
        }`}
      >
        <Edit3 size={12} />
        {isEdit ? "完成编辑" : "编辑"}
      </button>

      <button
        onClick={() => router.push("/settings")}
        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-text-dark"
      >
        <Settings size={12} />
        设置
      </button>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded border border-gray-200 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-text-dark"
      >
        <RefreshCw size={12} className="animate-spin-slow" />
        刷新
      </button>
    </div>
  );
}
