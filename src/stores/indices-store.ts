"use client";

import { create } from "zustand";
import type { IndexDiff } from "@/lib/api/types";

export const DEFAULT_INDICES = [
  { value: "1.000001", label: "上证指数" },
  { value: "1.000300", label: "沪深300" },
  { value: "0.399001", label: "深证成指" },
  { value: "1.000688", label: "科创50" },
  { value: "0.399006", label: "创业板指" },
  { value: "0.399005", label: "中小板指" },
  { value: "100.HSI", label: "恒生指数" },
  { value: "100.DJIA", label: "道琼斯" },
  { value: "100.NDX", label: "纳斯达克" },
  { value: "100.SPX", label: "标普500" },
];

interface IndicesState {
  selectedCodes: string[];
  indexData: IndexDiff[];
  focusedIndex: string | null;
  loading: boolean;

  setSelectedCodes: (codes: string[]) => void;
  setIndexData: (data: IndexDiff[]) => void;
  setFocusedIndex: (code: string | null) => void;
  setLoading: (v: boolean) => void;
  addIndex: (code: string) => void;
  removeIndex: (index: number) => void;
  reorderIndices: (from: number, to: number) => void;
}

export const useIndicesStore = create<IndicesState>((set) => ({
  selectedCodes: ["1.000001", "1.000300", "0.399001", "0.399006"],
  indexData: [],
  focusedIndex: null,
  loading: false,

  setSelectedCodes: (codes) => set({ selectedCodes: codes }),
  setIndexData: (data) => set({ indexData: data, loading: false }),
  setFocusedIndex: (code) => set({ focusedIndex: code }),
  setLoading: (v) => set({ loading: v }),
  addIndex: (code) =>
    set((state) => ({
      selectedCodes: state.selectedCodes.length < 4
        ? [...state.selectedCodes, code]
        : state.selectedCodes,
    })),
  removeIndex: (index) =>
    set((state) => ({
      selectedCodes: state.selectedCodes.filter((_, i) => i !== index),
    })),
  reorderIndices: (from, to) =>
    set((state) => {
      const codes = [...state.selectedCodes];
      codes.splice(to, 0, ...codes.splice(from, 1));
      return { selectedCodes: codes };
    }),
}));
