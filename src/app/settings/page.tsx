"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SettingsPanel } from "@/components/settings-panel";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          设置
        </h1>
      </header>

      <main className="p-4">
        <SettingsPanel />
      </main>
    </div>
  );
}
