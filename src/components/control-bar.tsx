"use client";

import { RefreshCw, Edit3, Pause, Play } from "lucide-react";

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
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {isDuringDate && (
        <button
          onClick={onToggleLiveUpdate}
          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${
            isLiveUpdate
              ? "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          {isLiveUpdate ? <Pause size={12} /> : <Play size={12} />}
          {isLiveUpdate ? "暂停" : "实时更新"}
        </button>
      )}

      <button
        onClick={onToggleEdit}
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border transition-colors ${
          isEdit
            ? "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
            : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        }`}
      >
        <Edit3 size={12} />
        {isEdit ? "完成" : "编辑"}
      </button>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <RefreshCw size={12} />
        刷新
      </button>
    </div>
  );
}
