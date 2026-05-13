"use client";

import { NavBar } from "@/components/nav-bar";
import { SettingsPanel } from "@/components/settings-panel";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0a0a0b] ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <SettingsPanel />
      </main>
    </div>
  );
}
