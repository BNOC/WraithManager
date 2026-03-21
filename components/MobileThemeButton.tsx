"use client";

import { useState } from "react";
import { useTheme, WOW_COLORS, BG_THEMES } from "@/components/ThemeProvider";

export function MobileThemeButton() {
  const { primary, setPrimary, bgTheme, setBgTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Palette trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Change theme"
        className="w-7 h-7 rounded-full border-2 border-rim/60 shadow-sm shrink-0 focus:outline-none"
        style={{ backgroundColor: primary }}
        suppressHydrationWarning
      />

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="bg-surface border-t border-rim rounded-t-2xl shadow-2xl shadow-black/60 p-5 space-y-5">
          {/* Handle */}
          <div className="flex justify-center -mt-1 mb-1">
            <div className="w-8 h-1 rounded-full bg-rim" />
          </div>

          {/* Class colour */}
          <div>
            <p className="text-ink-dim text-xs font-semibold uppercase tracking-wider mb-3">Class Colour</p>
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
                      className="w-10 h-10 rounded-full block transition-transform group-hover:scale-110 shadow-md"
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

          {/* Background */}
          <div>
            <p className="text-ink-dim text-xs font-semibold uppercase tracking-wider mb-3">Background</p>
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
                    <span className="text-ink-faint text-[10px] leading-tight">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safe area bottom spacer */}
          <div className="h-2" />
        </div>
      </div>
    </>
  );
}
