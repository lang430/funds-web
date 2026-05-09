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
  const axisColor = darkMode ? "#71717a" : "#a1a1aa";

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <p className="text-xs text-zinc-400 text-center py-8">暂无走势数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-1 mb-3">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRangeChange(opt.value)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              range === opt.value
                ? "bg-red-500 text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#27272a" : "#e4e4e7"} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: axisColor }}
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: axisColor }}
            tickFormatter={(v: number) => v.toFixed(4)}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#18181b" : "#fff",
              border: `1px solid ${darkMode ? "#3f3f46" : "#e4e4e7"}`,
              borderRadius: "8px",
              fontSize: "12px",
              color: darkMode ? "#e4e4e7" : "#18181b",
            }}
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value) => [Number(value).toFixed(4), "净值"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
