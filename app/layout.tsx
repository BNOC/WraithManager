import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WraithDebt - Guild Consumables Tracker",
  description: "Track consumables, payments, and crafters for your WoW raid guild",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const username = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value) ?? undefined;

  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <ThemeProvider username={username}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
