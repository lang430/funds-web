"use client";

import { create } from "zustand";
import type { FundValuation } from "@/lib/api/types";

interface FundState {
  fundList: { code: string; shares: number; cost: number }[];
  valuations: FundValuation[];
  isEdit: boolean;
  isLiveUpdate: boolean;
  isDuringDate: boolean;
  loading: boolean;
  sortType: string | null;
  sortDirection: "asc" | "desc" | "none";

  setFundList: (list: { code: string; shares: number; cost: number }[]) => void;
  setValuations: (data: FundValuation[]) => void;
  setIsEdit: (v: boolean) => void;
  setIsLiveUpdate: (v: boolean) => void;
  setIsDuringDate: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setSort: (type: string) => void;
  getSortedValuations: () => FundValuation[];
}

function compare(property: string, direction: "asc" | "desc") {
  return function (a: FundValuation, b: FundValuation) {
    const va = (a as unknown as Record<string, number>)[property];
    const vb = (b as unknown as Record<string, number>)[property];
    return direction === "asc" ? va - vb : vb - va;
  };
}

export const useFundStore = create<FundState>((set, get) => ({
  fundList: [],
  valuations: [],
  isEdit: false,
  isLiveUpdate: true,
  isDuringDate: false,
  loading: true,
  sortType: null,
  sortDirection: "none",

  setFundList: (list) => set({ fundList: list }),
  setValuations: (data) => set({ valuations: data, loading: false }),
  setIsEdit: (v) => set({ isEdit: v }),
  setIsLiveUpdate: (v) => set({ isLiveUpdate: v }),
  setIsDuringDate: (v) => set({ isDuringDate: v }),
  setLoading: (v) => set({ loading: v }),

  setSort: (type) => {
    const { sortType, sortDirection } = get();
    if (sortType !== type) {
      set({ sortType: type, sortDirection: "desc" });
    } else {
      const next =
        sortDirection === "desc" ? "asc" : sortDirection === "asc" ? "none" : "desc";
      set({ sortDirection: next });
    }
  },

  getSortedValuations: () => {
    const { valuations, sortType, sortDirection } = get();
    if (!sortType || sortDirection === "none") return [...valuations];
    return [...valuations].sort(compare(sortType, sortDirection));
  },
}));
