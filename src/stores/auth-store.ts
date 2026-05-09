"use client";

import { create } from "zustand";

interface User {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  deviceId: string;

  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  deviceId: generateDeviceId(),

  setUser: (user) => set({ user, isAuthenticated: true, loading: false }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (v) => set({ loading: v }),
}));

function generateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("funds_device_id");
  if (!id) {
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem("funds_device_id", id);
  }
  return id;
}
