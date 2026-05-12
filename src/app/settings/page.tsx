"use client";

import { NavBar } from "@/components/nav-bar";
import { SettingsPanel } from "@/components/settings-panel";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 ${darkMode ? "dark" : ""}`}>
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-3">
        <SettingsPanel />
      </main>
    </div>
  );
}
