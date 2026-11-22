"use client";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { homeFor, sessionId, useCurrentUser } from "@/lib/demo/session";
import type { Role, User } from "@/lib/demo/types";
import { Loading, Splash, Toaster, cx } from "@/components/ui";
import { AppBackButton, type Route } from "./router";

export interface NavItem { to: string; label: string; icon: LucideIcon; match?: (r: Route) => boolean }

function useRequireRole(role: Role): User | null {
  const user = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror the live gate: wait one tick before deciding
    setMounted(true);
    if (!sessionId() || !user) {
      location.replace(`/login/?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`);
    } else if (user.role !== role) {
      location.replace(homeFor(user.role));
    }
  }, [user, role]);
  if (!mounted) return null;
  return user && user.role === role ? user : null;
}

export function RequireRole({ role, children }: { role: Role; children: (u: User) => ReactNode }) {
  const user = useRequireRole(role);
  return user ? <>{children(user)}</> : <Loading label="Opening NEXO®…" />;
}

/** Mobile app frame from the Figma modules: light grey canvas, 440px column, bottom tab bar. */
export function AppShell({ app, nav, route, children, hideTabs }: { app: string; nav: NavItem[]; route: Route; children: ReactNode; hideTabs?: boolean }) {
  // Inside the phone-preview frame (?as=...) leave room for the notch.
  const inPhone = new URLSearchParams(location.search).has("as");
  const isActive = (n: NavItem) => (n.match ? n.match(route) : route.path === n.to || (n.to !== "/" && route.path.startsWith(n.to)));
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <Splash id={app} />
      <main className={cx("mx-auto min-h-dvh max-w-[440px] px-5", inPhone ? "pt-12" : "pt-6", hideTabs ? "pb-10" : "pb-28")}>
        <div className="animate-rise" key={route.path}>{children}</div>
      </main>
      {!hideTabs && (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white" aria-label="Main">
          <div className="mx-auto flex max-w-[440px] items-stretch justify-around px-1">
            {nav.map((n) => {
              const on = isActive(n);
              const I = n.icon;
              return (
                <a key={n.to} href={`#${n.to}`} aria-current={on ? "page" : undefined} className={cx("flex min-w-16 flex-1 flex-col items-center gap-1 pb-3 pt-2.5 text-[11px] font-semibold", on ? "text-primary" : "text-ink/70")}>
                  <I size={22} strokeWidth={on ? 2.2 : 1.8} />
                  {n.label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
      <Toaster />
    </div>
  );
}

/** Figma page title. With `back`, renders the square back button + title row (e.g. "Post a Gig").
 * The button returns to the previous screen; `back` is only the fallback for a fresh load or deep link. */
export function PageHeader({ title, sub, back, right }: { title: ReactNode; sub?: ReactNode; back?: string; right?: ReactNode }) {
  if (back)
    return (
      <div className="mb-5 flex items-center gap-3">
        <AppBackButton fallback={back} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[22px] font-bold leading-tight text-ink">{title}</h1>
          {sub && <p className="truncate text-[13px] text-muted">{sub}</p>}
        </div>
        {right}
      </div>
    );
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-[28px] font-bold leading-tight text-ink">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
