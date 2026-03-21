import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SideNav } from "@/components/SideNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemePicker } from "@/components/ThemePicker";
import { MobileThemeButton } from "@/components/MobileThemeButton";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WraithDebt - Guild Consumables Tracker",
  description: "Track consumables, payments, and crafters for your WoW raid guild",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen">
            {/* SideNav renders desktop fixed sidebar + mobile bottom bar */}
            <SideNav />

            {/* Main content */}
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
                <MobileThemeButton />
              </header>

              <div className="max-w-5xl mx-auto w-full px-4 sm:px-5 py-6 sm:py-8 pb-20 md:pb-10">
                {children}
              </div>
            </main>
          </div>

          {/* Floating theme picker */}
          <ThemePicker />
        </ThemeProvider>
      </body>
    </html>
  );
}
