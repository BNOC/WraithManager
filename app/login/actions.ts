"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyCredentials, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ error: string } | never> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password || !verifyCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }

  const token = await createSessionToken(username);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
