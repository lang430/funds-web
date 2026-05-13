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
    <div className="flex items-center gap-1.5">
      {isDuringDate && (
        <button onClick={onToggleLiveUpdate} className={`btn ${isLiveUpdate ? "btn-active" : "btn-outline"} text-xs`}>
          {isLiveUpdate ? <Pause size={13} /> : <Play size={13} />}
          {isLiveUpdate ? "暂停" : "实时更新"}
        </button>
      )}

      <button onClick={onToggleEdit} className={`btn ${isEdit ? "btn-active" : "btn-outline"} text-xs`}>
        <Edit3 size={13} />
        {isEdit ? "完成" : "编辑"}
      </button>

      <button onClick={onRefresh} className="btn btn-outline text-xs">
        <RefreshCw size={13} />
        刷新
      </button>
    </div>
  );
}
