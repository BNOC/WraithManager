// lib/actions/_guard.ts
"use server";

import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function requireBnoc() {
  const cookieStore = await cookies();
  const user = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (user?.toLowerCase() !== "bnoc") throw new Error("Unauthorised");
}
