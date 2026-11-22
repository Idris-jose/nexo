"use client";
import { useEffect, useState } from "react";
import { SESSION_KEY } from "@/lib/demo/constants";
import { homeFor } from "@/lib/demo/session";
import { getState } from "@/lib/demo/store";

/** Live-site behaviour: with a session, "Get Started" becomes "Open app" and "Sign In" hides. */
export function useSessionHome(): string | null {
  const [home, setHome] = useState<string | null>(null);
  useEffect(() => {
    try {
      const id = localStorage.getItem(SESSION_KEY);
      const user = id ? getState().users.find((u) => u.id === id) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only storage after hydration
      if (user) setHome(homeFor(user.role));
    } catch {}
  }, []);
  return home;
}

export function GetStartedLink({ className }: { className: string }) {
  const home = useSessionHome();
  return <a href={home ?? "/login/"} className={className}>{home ? "Open app" : "Get Started"}</a>;
}

export function SignInLink({ className }: { className: string }) {
  const home = useSessionHome();
  if (home) return null;
  return <a href="/login/" className={className}>Sign In</a>;
}
