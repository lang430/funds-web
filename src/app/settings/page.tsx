"use client";

import { NavBar } from "@/components/nav-bar";
import { SettingsPanel } from "@/components/settings-panel";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className="w-full px-3 sm:px-5 py-3 sm:py-4 max-w-[800px] mx-auto">
        <SettingsPanel />
      </main>
    </div>
  );
}
