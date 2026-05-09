"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";

const ThemeContext = createContext({
  darkMode: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{ darkMode, toggle: () => useSettingsStore.getState().setDarkMode(!darkMode) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
