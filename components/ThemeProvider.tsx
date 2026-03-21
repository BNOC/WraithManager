"use client";

import { createContext, useContext, useState, useLayoutEffect } from "react";

export const WOW_COLORS: { name: string; color: string }[] = [
  { name: "Warlock", color: "#8788ee" },
  { name: "Evoker", color: "#33937f" },
  { name: "Death Knight", color: "#c41f3b" },
  { name: "Demon Hunter", color: "#a330c9" },
  { name: "Paladin", color: "#f48cba" },
  { name: "Druid", color: "#ff7c0a" },
  { name: "Mage", color: "#3fc7eb" },
  { name: "Shaman", color: "#0070dd" },
  { name: "Hunter", color: "#aad372" },
  { name: "Monk", color: "#00ff98" },
  { name: "Warrior", color: "#c69b3a" },
  { name: "Rogue", color: "#fff468" },
];

const DEFAULT_PRIMARY = "#8788ee";
const STORAGE_KEY = "wraithmanager-theme-primary";

interface ThemeContextValue {
  primary: string;
  setPrimary: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primary: DEFAULT_PRIMARY,
  setPrimary: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primary, setPrimaryState] = useState(DEFAULT_PRIMARY);

  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyColor(stored);
  }, []);

  function applyColor(color: string) {
    document.documentElement.style.setProperty("--theme-primary", color);
    setPrimaryState(color);
    localStorage.setItem(STORAGE_KEY, color);
  }

  return (
    <ThemeContext.Provider value={{ primary, setPrimary: applyColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
