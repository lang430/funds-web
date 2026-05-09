"use client";

import { create } from "zustand";

interface SettingsState {
  darkMode: boolean;
  showAmount: boolean;
  showGains: boolean;
  showCost: boolean;
  showCostRate: boolean;
  showGSZ: boolean;
  normalFont: boolean;
  grayscale: number;
  opacity: number;

  setDarkMode: (v: boolean) => void;
  setShowAmount: (v: boolean) => void;
  setShowGains: (v: boolean) => void;
  setShowCost: (v: boolean) => void;
  setShowCostRate: (v: boolean) => void;
  setShowGSZ: (v: boolean) => void;
  setNormalFont: (v: boolean) => void;
  setGrayscale: (v: number) => void;
  setOpacity: (v: number) => void;
  loadFromServer: (data: Record<string, number | boolean>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  showAmount: true,
  showGains: true,
  showCost: false,
  showCostRate: false,
  showGSZ: false,
  normalFont: false,
  grayscale: 0,
  opacity: 0,

  setDarkMode: (v) => set({ darkMode: v }),
  setShowAmount: (v) => set({ showAmount: v }),
  setShowGains: (v) => set({ showGains: v }),
  setShowCost: (v) => set({ showCost: v }),
  setShowCostRate: (v) => set({ showCostRate: v }),
  setShowGSZ: (v) => set({ showGSZ: v }),
  setNormalFont: (v) => set({ normalFont: v }),
  setGrayscale: (v) => set({ grayscale: v }),
  setOpacity: (v) => set({ opacity: v }),

  loadFromServer: (data) => {
    set({
      darkMode: Boolean(data.dark_mode),
      showAmount: Boolean(data.show_amount ?? true),
      showGains: Boolean(data.show_gains ?? true),
      showCost: Boolean(data.show_cost ?? false),
      showCostRate: Boolean(data.show_cost_rate ?? false),
      showGSZ: Boolean(data.show_gsz ?? false),
      normalFont: Boolean(data.normal_font),
      grayscale: Number(data.grayscale ?? 0),
      opacity: Number(data.opacity ?? 0),
    });
  },
}));
