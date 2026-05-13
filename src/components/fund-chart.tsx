"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const RANGE_OPTIONS = [
  { value: "1m", label: "近1月" },
  { value: "3m", label: "近3月" },
  { value: "6m", label: "近6月" },
  { value: "1y", label: "近1年" },
  { value: "3y", label: "近3年" },
] as const;

interface ChartPoint {
  date: string;
  value: number;
}

interface Props {
  data: string[];
  type: "nav" | "gsz";
  range: string;
  onRangeChange: (range: string) => void;
  darkMode: boolean;
}

function parseKlines(klines: string[]): ChartPoint[] {
  if (!klines || !Array.isArray(klines)) return [];
  return klines
    .filter((line) => line && line.includes(","))
    .map((line) => {
      const parts = line.split(",");
      const close = parseFloat(parts[2]);
      return {
        date: parts[0],
        value: isNaN(close) ? 0 : close,
      };
    })
    .filter((p) => p.value > 0);
}

function formatDate(raw: string): string {
  if (raw.length === 8) {
    return `${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  if (raw.length === 10) {
    return raw.slice(5);
  }
  return raw;
}

export function FundChart({ data, type: _type, range, onRangeChange, darkMode }: Props) {
  const chartData = useMemo(() => parseKlines(data), [data]);

  const trendPositive =
    chartData.length >= 2 &&
    chartData[chartData.length - 1].value >= chartData[0].value;

  const lineColor = trendPositive ? "#ef4444" : "#22c55e";
  const axisColor = darkMode ? "#64748b" : "#94a3b8";

  if (chartData.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10">暂无走势数据</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRangeChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all duration-150 ${
                range === opt.value
                  ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: axisColor }}
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: axisColor }}
              tickFormatter={(v: number) => v.toFixed(4)}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1e293b" : "#fff",
                border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                borderRadius: "10px",
                fontSize: "12px",
                color: darkMode ? "#e2e8f0" : "#1e293b",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelFormatter={(label) => formatDate(label as string)}
              formatter={(value) => [Number(value).toFixed(4), "净值"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
