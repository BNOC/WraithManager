"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/login/actions";

export function MobileLogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="text-xs text-ink-faint hover:text-red-400 transition-colors disabled:opacity-50 px-1 py-1"
    >
      {pending ? "…" : "Sign out"}
    </button>
  );
}
