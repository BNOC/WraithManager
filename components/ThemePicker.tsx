"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme, WOW_COLORS, BG_THEMES } from "@/components/ThemeProvider";

export function ThemePicker() {
  const { primary, setPrimary, bgTheme, setBgTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change theme"
        className="w-8 h-8 rounded-full border-2 border-rim shadow-lg shadow-black/40 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ backgroundColor: primary }}
        suppressHydrationWarning
      />

      {open && (
        <div className="absolute top-10 right-0 bg-surface border border-rim rounded-2xl shadow-2xl shadow-black/60 p-4 w-72 space-y-5">

          {/* Primary colour */}
          <div>
            <p className="text-ink-dim text-xs font-semibold uppercase tracking-wider mb-3">
              Class Colour
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {WOW_COLORS.map(({ name, color }) => {
                const isActive = primary.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={name}
                    title={name}
                    onClick={() => { setPrimary(color); setOpen(false); }}
                    className="group flex flex-col items-center gap-1"
                  >
                    <span
                      className="w-9 h-9 rounded-full block transition-transform group-hover:scale-110 shadow-md"
                      style={{
                        backgroundColor: color,
                        boxShadow: isActive ? `0 0 0 3px #fff3, 0 0 0 5px ${color}66` : undefined,
                      }}
                    />
                    <span className="text-ink-faint text-[10px] leading-tight text-center truncate w-full">
                      {name.split(" ").pop()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-rim" />

          {/* Background theme */}
          <div>
            <p className="text-ink-dim text-xs font-semibold uppercase tracking-wider mb-3">
              Background
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BG_THEMES.map((theme) => {
                const isActive = bgTheme.name === theme.name;
                return (
                  <button
                    key={theme.name}
                    title={theme.name}
                    onClick={() => { setBgTheme(theme); setOpen(false); }}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    {/* Swatch: outer = canvas, inner = surface, tiny = surface-hi */}
                    <span
                      className="w-full h-10 rounded-xl block relative overflow-hidden transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: theme.canvas,
                        outline: isActive ? `2px solid ${primary}` : `1px solid ${theme.rim}`,
                        outlineOffset: isActive ? "2px" : "0px",
                      }}
                    >
                      <span
                        className="absolute inset-x-2 bottom-1 h-4 rounded-lg"
                        style={{ backgroundColor: theme.surface }}
                      />
                      <span
                        className="absolute inset-x-4 bottom-2 h-2 rounded"
                        style={{ backgroundColor: theme.surfaceHi }}
                      />
                    </span>
                    <span className="text-ink-faint text-[10px] leading-tight">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
