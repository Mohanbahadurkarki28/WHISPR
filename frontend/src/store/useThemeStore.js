import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Whispr-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("Whispr-theme", theme);
    set({ theme });
  },
}));
