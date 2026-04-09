"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink tracking-tight">
            Wraith<span className="text-primary">Debt</span>
          </h1>
          <p className="text-ink-dim text-sm mt-1">Guild consumables tracker</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-rim rounded-2xl p-6 shadow-2xl shadow-black/50">
          <p className="text-ink font-semibold text-lg mb-5">Sign in</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-ink-dim mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                className="w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-dim mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-surface-hi border border-rim rounded-xl px-3 py-2.5 text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:opacity-90 text-white font-semibold py-2.5 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-faint text-xs mt-6">
          Wraith Gaming · Internal tool
        </p>
      </div>
    </div>
  );
}
