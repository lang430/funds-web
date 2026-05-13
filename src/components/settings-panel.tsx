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
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {desc && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
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
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div>
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        {desc && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {desc}
          </p>
        )}
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          "data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
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
    <div className="py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm text-slate-500 tabular-nums">
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
        <Slider.Track className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full bg-white border border-slate-300 dark:border-slate-600 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" />
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
    <div className="space-y-4 animate-fade-in">
      {/* 显示设置 */}
      <div className="card p-5">
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
      <div className="card p-5">
        <SectionTitle title="主题" desc="切换外观主题与字体" />
        <ToggleRow
          label={
            <span className="inline-flex items-center gap-2">
              {store.darkMode ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
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
      <div className="card p-5">
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
      <div className="card p-5">
        <SectionTitle title="导入/导出" desc="备份或恢复您的基金数据" />
        <div className="grid grid-cols-2 gap-3">
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleJsonImport}
          />
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            导入 JSON
          </button>
          <button
            onClick={handleJsonExport}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
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
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            导入 Excel
          </button>
          <button
            onClick={handleExcelExport}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            导出 Excel
          </button>
        </div>
      </div>

      {/* 节假日更新 */}
      <div className="card p-5">
        <SectionTitle
          title="节假日数据"
          desc="手动拉取最新节假日数据以更新交易日历"
        />
        <button
          onClick={handleUpdateHoliday}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20"
        >
          <RotateCw className="w-3.5 h-3.5" />
          更新节假日数据
        </button>
      </div>

      {/* 关于 */}
      <div className="card p-5">
        <SectionTitle title="关于" />
        <div className="space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            版本：v{VERSION}
          </p>
          <p className="text-sm">
            <a
              href="https://github.com/x2rr/funds/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              更新日志
            </a>
          </p>
          <p className="text-sm">
            <a
              href="https://github.com/x2rr/funds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
