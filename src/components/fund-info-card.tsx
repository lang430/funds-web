"use client";

import type { FundInfoRaw } from "@/lib/api/types";

interface Props {
  data: FundInfoRaw;
  darkMode: boolean;
}

const RANK_LABELS = [
  { key: "RANKM" as const, label: "近1月", sylKey: "SYL_Y" as const },
  { key: "RANKQ" as const, label: "近3月", sylKey: "SYL_3Y" as const },
  { key: "RANKHY" as const, label: "近6月", sylKey: "SYL_6Y" as const },
  { key: "RANKY" as const, label: "近1年", sylKey: "SYL_1N" as const },
];

function formatRank(rank: string): string {
  const n = parseInt(rank, 10);
  if (isNaN(n) || n <= 0) return "--";
  return String(n);
}

function formatSyl(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "--";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function sylColor(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return "text-zinc-500";
  return n > 0 ? "text-red-500" : n < 0 ? "text-green-500" : "text-zinc-500";
}

export function FundInfoCard({ data, darkMode: _darkMode }: Props) {
  if (!data?.FCODE) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 text-center text-[0.7rem] sm:text-xs text-zinc-400">
        暂无基金信息
      </div>
    );
  }

  const nav = parseFloat(data.DWJZ);
  const accNav = parseFloat(data.LJJZ);
  const scale = parseFloat(data.ENDNAV);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[0.85rem] sm:text-sm font-semibold truncate">{data.SHORTNAME}</h1>
          <p className="text-[0.7rem] sm:text-xs text-zinc-400 mt-0.5">
            {data.FCODE} · {data.FTYPE}
          </p>
        </div>
        <span
          className={`shrink-0 text-[0.7rem] sm:text-xs px-2 py-0.5 rounded-full border ${
            data.SGZT === "开放申购"
              ? "border-green-300 text-green-600 dark:border-green-700 dark:text-green-400"
              : "border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
          }`}
        >
          {data.SGZT}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[0.7rem] sm:text-xs">
        <div>
          <span className="text-zinc-400">基金公司</span>
          <p className="text-zinc-800 dark:text-zinc-200">{data.JJGS}</p>
        </div>
        <div>
          <span className="text-zinc-400">基金经理</span>
          <p className="text-zinc-800 dark:text-zinc-200 cursor-pointer hover:underline">
            {data.JJJL}
          </p>
        </div>
        <div>
          <span className="text-zinc-400">单位净值</span>
          <p className="text-zinc-800 dark:text-zinc-200 font-mono">
            {isNaN(nav) ? "--" : nav.toFixed(4)}
          </p>
        </div>
        <div>
          <span className="text-zinc-400">累计净值</span>
          <p className="text-zinc-800 dark:text-zinc-200 font-mono">
            {isNaN(accNav) ? "--" : accNav.toFixed(4)}
          </p>
        </div>
        <div>
          <span className="text-zinc-400">基金规模</span>
          <p className="text-zinc-800 dark:text-zinc-200 font-mono">
            {isNaN(scale) || scale <= 0
              ? "--"
              : `${(scale / 100_000_000).toFixed(2)}亿`}
          </p>
        </div>
        <div>
          <span className="text-zinc-400">成立日期</span>
          <p className="text-zinc-800 dark:text-zinc-200">{data.FSRQ || "--"}</p>
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
        <div className="grid grid-cols-4 gap-2">
          {RANK_LABELS.map(({ key, label, sylKey }) => (
            <div key={key} className="text-center">
              <p className="text-[0.7rem] sm:text-xs text-zinc-400">{label}</p>
              <p className={`text-[0.75rem] sm:text-xs font-semibold ${sylColor(data[sylKey])}`}>
                {formatSyl(data[sylKey])}
              </p>
              <p className="text-[0.7rem] sm:text-xs text-zinc-400 mt-0.5">
                {formatRank(data[key])}
                <span className="text-[0.6rem] sm:text-[10px]">名</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
