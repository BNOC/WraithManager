"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";
import { USER_DEFAULT_PRIMARY, DEFAULT_PRIMARY } from "@/components/ThemeProvider";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const color = USER_DEFAULT_PRIMARY[e.target.value.toLowerCase()];
    document.documentElement.style.setProperty("--theme-primary", color ?? DEFAULT_PRIMARY);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* ── Left: login form ── */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-ink tracking-tight">
              Wraith<span className="text-primary">Debt</span>
            </h1>
            <p className="text-ink-dim text-sm mt-1.5">Guild consumables tracker</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-widest">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                onChange={handleUsernameChange}
                className="w-full bg-surface border border-rim rounded-xl px-4 py-3 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-dim mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-surface border border-rim rounded-xl px-4 py-3 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-ink-faint text-xs mt-12">@BNOC</p>
        </div>
      </div>

      {/* ── Right: full-bleed image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="hidden md:flex md:w-1/3 relative self-stretch">
        <img
          src="/images/login_bg4.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Inner shadow on the left edge to blend into the form side */}
        <div className="absolute inset-0 bg-linear-to-r from-canvas/60 via-transparent to-transparent" />
      </div>
    </div>
  );
}
