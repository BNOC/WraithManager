import { SideNav } from "@/components/SideNav";
import { ThemePicker } from "@/components/ThemePicker";
import { MobileThemeButton } from "@/components/MobileThemeButton";
import { MobileLogoutButton } from "@/components/MobileLogoutButton";
import { GuildSuppliesWidget } from "@/components/GuildSuppliesWidget";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SideNav widget={<GuildSuppliesWidget />} />

      <main className="flex-1 min-w-0 md:ml-60 min-h-screen flex flex-col">
        {/* Top header — mobile only */}
        <header className="md:hidden sticky top-0 z-20 bg-surface/80 backdrop-blur border-b border-rim px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" className="text-primary shrink-0">
              <path d="M8 1C4.69 1 2 3.69 2 7v6.5l1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25 1.5 1.25 1.5-1.25V7c0-3.31-2.69-6-6-6z" />
              <circle cx="5.8" cy="7" r="1" fill="var(--color-surface)" />
              <circle cx="10.2" cy="7" r="1" fill="var(--color-surface)" />
            </svg>
            <span className="font-bold text-ink tracking-tight leading-none">
              Wraith<span className="text-primary">Debt</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MobileThemeButton />
            <MobileLogoutButton />
          </div>
        </header>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-5 py-6 sm:py-8 pb-20 md:pb-10">
          {children}
        </div>
      </main>

      {/* Floating theme picker — desktop only */}
      <ThemePicker />
    </div>
  );
}
