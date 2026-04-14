"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme, WOW_COLORS } from "@/components/layout/ThemeProvider";

export function ThemePicker() {
  const { primary, setPrimary } = useTheme();
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
    <div ref={ref} className="hidden md:block fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Change theme"
        className="w-8 h-8 rounded-full border-2 border-rim shadow-lg shadow-black/40 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{ backgroundColor: primary }}
        suppressHydrationWarning
      />

      {open && (
        <div className="absolute top-10 right-0 bg-surface border border-rim rounded-2xl shadow-2xl shadow-black/60 p-4 w-72">
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
      )}
    </div>
  );
}
