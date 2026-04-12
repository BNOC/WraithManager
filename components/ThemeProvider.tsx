"use client";

import { createContext, useContext, useState, useLayoutEffect } from "react";

export const WOW_COLORS: { name: string; color: string }[] = [
  { name: "Warlock", color: "#8788ee" },
  { name: "Evoker", color: "#33937f" },
  { name: "DK", color: "#c41e3a" },
  { name: "DH", color: "#a330c9" },
  { name: "Paladin", color: "#f48cba" },
  { name: "Druid", color: "#ff7c0a" },
  { name: "Mage", color: "#3fc7eb" },
  { name: "Shaman", color: "#0070dd" },
  { name: "Hunter", color: "#aad372" },
  { name: "Monk", color: "#00ff98" },
  { name: "Warrior", color: "#c69b6d" },
  { name: "Rogue", color: "#fff468" },
];

export interface BgTheme {
  name: string;
  canvas: string;
  surface: string;
  surfaceHi: string;
  rim: string;
  inkFaint: string;
  inkDim: string;
  ink: string;
}

export const BG_THEMES: BgTheme[] = [
  {
    name: "Void",
    canvas: "#09090f",
    surface: "#111119",
    surfaceHi: "#18181f",
    rim: "#252530",
    inkFaint: "#3a3a55",
    inkDim: "#7878a0",
    ink: "#e8e8f0",
  },
  {
    name: "Slate",
    canvas: "#090d12",
    surface: "#111720",
    surfaceHi: "#181f28",
    rim: "#222d38",
    inkFaint: "#2a3d52",
    inkDim: "#6080a0",
    ink: "#dce8f4",
  },
  {
    name: "Ash",
    canvas: "#0d0c0b",
    surface: "#161513",
    surfaceHi: "#1e1c1a",
    rim: "#2a2826",
    inkFaint: "#403c38",
    inkDim: "#807870",
    ink: "#f0ede8",
  },
  {
    name: "Ember",
    canvas: "#100a08",
    surface: "#1a100c",
    surfaceHi: "#221610",
    rim: "#301e18",
    inkFaint: "#4a2e24",
    inkDim: "#906858",
    ink: "#f0e0d8",
  },
  {
    name: "Forest",
    canvas: "#080e09",
    surface: "#0f1810",
    surfaceHi: "#151f16",
    rim: "#1e2e20",
    inkFaint: "#2a422c",
    inkDim: "#588060",
    ink: "#d8f0da",
  },
  {
    name: "Abyss",
    canvas: "#080808",
    surface: "#101010",
    surfaceHi: "#181818",
    rim: "#232323",
    inkFaint: "#383838",
    inkDim: "#707070",
    ink: "#e8e8e8",
  },
];

const DEFAULT_PRIMARY = "#8788ee";
const DEFAULT_BG = BG_THEMES[0];
const STORAGE_KEY_PRIMARY = "wraithdebt-theme-primary";
const STORAGE_KEY_BG = "wraithdebt-theme-bg";

const USER_DEFAULT_PRIMARY: Record<string, string> = {
  bnoc:  "#33937f", // Evoker
  hafad: "#c41e3a", // DK
  phae:  "#ff7c0a", // Druid
  react: "#a330c9", // DH
  cassy: "#f48cba", // Paladin
};

interface ThemeContextValue {
  primary: string;
  setPrimary: (color: string) => void;
  bgTheme: BgTheme;
  setBgTheme: (theme: BgTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primary: DEFAULT_PRIMARY,
  setPrimary: () => {},
  bgTheme: DEFAULT_BG,
  setBgTheme: () => {},
});

function applyBgTheme(theme: BgTheme) {
  const el = document.documentElement;
  el.style.setProperty("--theme-canvas", theme.canvas);
  el.style.setProperty("--theme-surface", theme.surface);
  el.style.setProperty("--theme-surface-hi", theme.surfaceHi);
  el.style.setProperty("--theme-rim", theme.rim);
  el.style.setProperty("--theme-ink-faint", theme.inkFaint);
  el.style.setProperty("--theme-ink-dim", theme.inkDim);
  el.style.setProperty("--theme-ink", theme.ink);
}

export function ThemeProvider({ children, username }: { children: React.ReactNode; username?: string }) {
  const [primary, setPrimaryState] = useState(DEFAULT_PRIMARY);
  const [bgTheme, setBgState] = useState<BgTheme>(DEFAULT_BG);

  useLayoutEffect(() => {
    const storedPrimary = localStorage.getItem(STORAGE_KEY_PRIMARY);
    if (storedPrimary) {
      document.documentElement.style.setProperty("--theme-primary", storedPrimary);
      setPrimaryState(storedPrimary);
    } else if (username) {
      const userDefault = USER_DEFAULT_PRIMARY[username.toLowerCase()];
      if (userDefault) {
        document.documentElement.style.setProperty("--theme-primary", userDefault);
        setPrimaryState(userDefault);
      }
    }

    const storedBgName = localStorage.getItem(STORAGE_KEY_BG);
    if (storedBgName) {
      const found = BG_THEMES.find((t) => t.name === storedBgName);
      if (found) {
        applyBgTheme(found);
        setBgState(found);
      }
    }
  }, [username]);

  function setPrimary(color: string) {
    document.documentElement.style.setProperty("--theme-primary", color);
    setPrimaryState(color);
    localStorage.setItem(STORAGE_KEY_PRIMARY, color);
  }

  function setBgTheme(theme: BgTheme) {
    applyBgTheme(theme);
    setBgState(theme);
    localStorage.setItem(STORAGE_KEY_BG, theme.name);
  }

  return (
    <ThemeContext.Provider value={{ primary, setPrimary, bgTheme, setBgTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
