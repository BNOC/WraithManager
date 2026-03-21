import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SideNav } from "@/components/SideNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemePicker } from "@/components/ThemePicker";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WraithManager - Guild Consumables Tracker",
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
            {/* Side nav — fixed, desktop only */}
            <aside className="hidden md:block fixed inset-y-0 left-0 w-60 z-30 bg-surface border-r border-rim">
              <SideNav />
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-60 min-h-screen">
              <div className="max-w-5xl mx-auto px-5 py-8 pb-24 md:pb-10">
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
