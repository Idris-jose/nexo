"use client";
import { useEffect, useState } from "react";
import { SESSION_KEY } from "@/lib/demo/constants";
import { homeFor } from "@/lib/demo/session";
import { getState } from "@/lib/demo/store";

/** With a demo session, "Get Started" opens that user's app and "Sign In" hides. */
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
  // Always labelled "Get Started"; a signed-in demo user goes straight back into their app.
  return <a href={home ?? "/login/"} className={className}>Get Started</a>;
}

export function SignInLink({ className }: { className: string }) {
  const home = useSessionHome();
  if (home) return null;
  return <a href="/login/" className={className}>Sign In</a>;
}
