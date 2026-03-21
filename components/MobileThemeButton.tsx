"use client";

import { useState } from "react";
import { useTheme, WOW_COLORS } from "@/components/ThemeProvider";

export function MobileThemeButton() {
  const { primary, setPrimary } = useTheme();
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
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="bg-surface border-t border-rim rounded-t-2xl shadow-2xl shadow-black/60 p-5">
            {/* Handle */}
            <div className="flex justify-center -mt-1 mb-4">
              <div className="w-8 h-1 rounded-full bg-rim" />
            </div>

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

            {/* Safe area bottom spacer */}
            <div className="h-2" />
          </div>
        </div>
      )}
    </>
  );
}
