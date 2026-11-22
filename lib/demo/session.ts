"use client";
import { SESSION_KEY } from "./constants";
import { emit, useSelector } from "./store";
import type { Role } from "./types";

export function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  const as = new URLSearchParams(location.search).get("as");
  if (as) return as;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function login(id: string) {
  try {
    localStorage.setItem(SESSION_KEY, id);
  } catch {}
  emit();
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
  emit();
}

export function useCurrentUser() {
  return useSelector((s) => {
    const id = sessionId();
    return (id && s.users.find((u) => u.id === id)) || null;
  });
}

export const homeFor = (role: Role) => (role === "vendor" ? "/vendor/" : role === "admin" ? "/admin/" : "/app/");
