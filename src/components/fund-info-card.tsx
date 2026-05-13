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
  if (isNaN(n)) return "text-slate-400 dark:text-slate-500";
  return n > 0 ? "text-red-500" : n < 0 ? "text-green-500" : "text-slate-400 dark:text-slate-500";
}

export function FundInfoCard({ data, darkMode: _darkMode }: Props) {
  if (!data?.FCODE) {
    return (
      <div className="card p-6 text-center text-sm text-slate-400 dark:text-slate-500">
        暂无基金信息
      </div>
    );
  }

  const nav = parseFloat(data.DWJZ);
  const accNav = parseFloat(data.LJJZ);
  const scale = parseFloat(data.ENDNAV);

  return (
    <div className="card p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">{data.SHORTNAME}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {data.FCODE} · {data.FTYPE}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${
            data.SGZT === "开放申购"
              ? "border-green-200 text-green-600 dark:border-green-800 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50"
          }`}
        >
          {data.SGZT}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">基金公司</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">{data.JJGS}</p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">基金经理</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium hover:underline cursor-pointer">
            {data.JJJL}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">单位净值</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-mono font-medium">
            {isNaN(nav) ? "--" : nav.toFixed(4)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">累计净值</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-mono font-medium">
            {isNaN(accNav) ? "--" : accNav.toFixed(4)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">基金规模</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-mono font-medium">
            {isNaN(scale) || scale <= 0
              ? "--"
              : `${(scale / 100_000_000).toFixed(2)}亿`}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 text-xs">成立日期</span>
          <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">{data.FSRQ || "--"}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/5 pt-4">
        <div className="grid grid-cols-4 gap-3">
          {RANK_LABELS.map(({ key, label, sylKey }) => (
            <div key={key} className="text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
              <p className={`text-sm font-semibold ${sylColor(data[sylKey])}`}>
                {formatSyl(data[sylKey])}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {formatRank(data[key])}
                <span className="text-[0.65rem]">名</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
