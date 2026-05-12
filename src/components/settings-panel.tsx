"use client";

import { useCallback, useRef } from "react";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { Download, Upload, Sun, Moon, RotateCw } from "lucide-react";

const VERSION = "0.1.0";

function patchSetting(key: string, value: number | boolean) {
  fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: Number(value) }),
  }).catch(() => {});
}

function SectionTitle({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-3">
      <h3 className="text-[0.75rem] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
      {desc && (
        <p className="text-[0.6rem] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {desc}
        </p>
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: React.ReactNode;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div>
        <span className="text-[0.7rem] sm:text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
        {desc && (
          <p className="text-[0.6rem] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {desc}
          </p>
        )}
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-zinc-300 dark:data-[state=unchecked]:bg-zinc-600"
        )}
      >
        <Switch.Thumb
          className={cn(
            "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            "translate-x-0.5 data-[state=checked]:translate-x-[18px]"
          )}
        />
      </Switch.Root>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
}: SliderRowProps) {
  return (
    <div className="py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.7rem] sm:text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-[0.7rem] sm:text-xs text-zinc-500 tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="relative flex items-center h-5 w-full"
      >
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <Slider.Range className="absolute h-full rounded-full bg-red-500" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full bg-white border border-zinc-300 dark:border-zinc-600 shadow-sm hover:border-red-400 focus:outline-none transition-colors" />
      </Slider.Root>
    </div>
  );
}

export function SettingsPanel() {
  const store = useSettingsStore();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const toggle = useCallback(
    (key: string, value: boolean) => {
      const setterMap: Record<string, (v: boolean) => void> = {
        dark_mode: store.setDarkMode,
        show_amount: store.setShowAmount,
        show_gains: store.setShowGains,
        show_cost: store.setShowCost,
        show_cost_rate: store.setShowCostRate,
        show_gsz: store.setShowGSZ,
        normal_font: store.setNormalFont,
      };
      setterMap[key]?.(value);
      patchSetting(key, value);
    },
    [store]
  );

  const setSlider = useCallback(
    (key: string, value: number) => {
      const setterMap: Record<string, (v: number) => void> = {
        grayscale: store.setGrayscale,
        opacity: store.setOpacity,
      };
      setterMap[key]?.(value);
      patchSetting(key, value);
    },
    [store]
  );

  const handleJsonExport = useCallback(async () => {
    try {
      const res = await fetch("/api/funds");
      const json = await res.json() as { success: boolean; data: unknown };
      const blob = new Blob([JSON.stringify(json.data ?? json, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funds_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败");
    }
  }, []);

  const handleExcelExport = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");
      const res = await fetch("/api/funds");
      const json = await res.json() as { success: boolean; data: unknown };
      const data = json.data ?? json;
      const rows = Array.isArray(data) ? data : [];
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "funds");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funds_backup_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("导出失败");
    }
  }, []);

  const handleJsonImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : [data];
        let count = 0;
        for (const item of items) {
          const code = item.fundcode ?? item.fund_code ?? item.code;
          if (!code) continue;
          try {
            const res = await fetch("/api/funds/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fundCode: String(code) }),
            });
            if (res.ok) count++;
          } catch {
            // skip failed
          }
        }
        alert(`导入完成：成功 ${count} 条`);
      } catch {
        alert("JSON 文件格式错误");
      }
      if (jsonInputRef.current) jsonInputRef.current.value = "";
    },
    []
  );

  const handleExcelImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        let count = 0;
        for (const row of rows) {
          const code = row.fundcode ?? row.fund_code ?? row.code ?? row.FCODE;
          if (!code) continue;
          try {
            const res = await fetch("/api/funds/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fundCode: String(code) }),
            });
            if (res.ok) count++;
          } catch {
            // skip failed
          }
        }
        alert(`导入完成：成功 ${count} 条`);
      } catch {
        alert("Excel 文件解析失败");
      }
      if (excelInputRef.current) excelInputRef.current.value = "";
    },
    []
  );

  const handleUpdateHoliday = useCallback(async () => {
    try {
      const res = await fetch("/api/holiday");
      if (res.ok) {
        alert("节假日数据更新成功");
      } else {
        alert("更新失败，请稍后重试");
      }
    } catch {
      alert("更新失败，请检查网络");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* 显示设置 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle title="显示设置" desc="控制列表中的数据展示项" />
        <ToggleRow
          label="持仓金额"
          checked={store.showAmount}
          onChange={(v) => toggle("show_amount", v)}
        />
        <ToggleRow
          label="估算收益"
          checked={store.showGains}
          onChange={(v) => toggle("show_gains", v)}
        />
        <ToggleRow
          label="成本金额"
          checked={store.showCost}
          onChange={(v) => toggle("show_cost", v)}
        />
        <ToggleRow
          label="成本收益率"
          checked={store.showCostRate}
          onChange={(v) => toggle("show_cost_rate", v)}
        />
        <ToggleRow
          label="估算净值"
          checked={store.showGSZ}
          onChange={(v) => toggle("show_gsz", v)}
        />
      </div>

      {/* 主题设置 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle title="主题" desc="切换外观主题与字体" />
        <ToggleRow
          label={
            <span className="inline-flex items-center gap-1.5">
              {store.darkMode ? (
                <Moon className="w-3 h-3" />
              ) : (
                <Sun className="w-3 h-3" />
              )}
              深色模式
            </span>
          }
          checked={store.darkMode}
          onChange={(v) => toggle("dark_mode", v)}
        />
        <ToggleRow
          label="常规字体"
          desc="使用系统默认字体大小"
          checked={store.normalFont}
          onChange={(v) => toggle("normal_font", v)}
        />
      </div>

      {/* 外观设置 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle title="外观" desc="调整灰度与透明度" />
        <SliderRow
          label="灰度"
          value={store.grayscale}
          min={0}
          max={100}
          formatValue={(v) => `${v}%`}
          onChange={(v) => setSlider("grayscale", v)}
        />
        <SliderRow
          label="透明度"
          value={store.opacity}
          min={0}
          max={90}
          formatValue={(v) => `${v}%`}
          onChange={(v) => setSlider("opacity", v)}
        />
      </div>

      {/* 导入导出 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle title="导入/导出" desc="备份或恢复您的基金数据" />
        <div className="grid grid-cols-2 gap-2">
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJsonImport}
          />
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[0.7rem] sm:text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Upload className="w-3 h-3" />
            导入 JSON
          </button>
          <button
            onClick={handleJsonExport}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[0.7rem] sm:text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-3 h-3" />
            导出 JSON
          </button>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleExcelImport}
          />
          <button
            onClick={() => excelInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[0.7rem] sm:text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Upload className="w-3 h-3" />
            导入 Excel
          </button>
          <button
            onClick={handleExcelExport}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[0.7rem] sm:text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-3 h-3" />
            导出 Excel
          </button>
        </div>
      </div>

      {/* 节假日更新 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle
          title="节假日数据"
          desc="手动拉取最新节假日数据以更新交易日历"
        />
        <button
          onClick={handleUpdateHoliday}
          className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-red-500 text-white text-[0.7rem] sm:text-xs font-medium hover:bg-red-600 transition-colors"
        >
          <RotateCw className="w-3 h-3" />
          更新节假日数据
        </button>
      </div>

      {/* 关于 */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <SectionTitle title="关于" />
        <div className="space-y-1.5">
          <p className="text-[0.7rem] sm:text-xs text-zinc-500 dark:text-zinc-400">
            版本：v{VERSION}
          </p>
          <p className="text-[0.7rem] sm:text-xs">
            <a
              href="https://github.com/x2rr/funds/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              更新日志
            </a>
          </p>
          <p className="text-xs">
            <a
              href="https://github.com/x2rr/funds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
