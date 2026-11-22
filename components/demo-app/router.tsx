"use client";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui";

export interface Route { path: string; parts: string[]; query: URLSearchParams }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "") || "/";
  const [p, q] = raw.split("?");
  const path = p.startsWith("/") ? p : `/${p}`;
  return { path, parts: path.split("/").filter(Boolean), query: new URLSearchParams(q) };
}

/**
 * In-app history: the hash routes visited in this document, and where we are in them.
 * Lets back buttons return to the screen the user actually came from, and tells us when
 * there is nothing in-app to go back to (fresh load, deep link) so we use the page's default parent.
 */
const trail = { stack: [] as string[], at: -1, replacing: false, backing: false };
const current = () => location.hash.replace(/^#/, "") || "/";

function record(hash: string) {
  const { stack, at } = trail;
  if (trail.backing && at > 0) {
    trail.backing = false;
    trail.at = at - 1; // in-app back inside a preview phone (see goBack)
  } else if (trail.replacing && at >= 0) {
    trail.replacing = false;
    trail.stack = [...stack.slice(0, at), hash];
  } else if (at < 0) {
    trail.stack = [hash];
    trail.at = 0;
  } else if (stack[at] === hash) {
    // same entry (re-render or re-mount)
  } else if (stack[at - 1] === hash) {
    trail.at = at - 1; // browser/app back
  } else if (stack[at + 1] === hash) {
    trail.at = at + 1; // browser forward
  } else {
    trail.stack = [...stack.slice(0, at + 1), hash];
    trail.at = at + 1;
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(typeof location === "undefined" ? "" : location.hash));
  useEffect(() => {
    record(current());
    const h = () => {
      record(current());
      setRoute(parseHash(location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return route;
}

export const navigate = (to: string) => {
  location.hash = to;
};

/** Navigate without adding a history entry (redirects, fallback "back"). */
export const replaceRoute = (to: string) => {
  if (current() === to) return;
  trail.replacing = true;
  location.replace(`#${to}`);
};

/**
 * Go back to the previous in-app screen; if there isn't one, go to `fallback` (the page's natural parent).
 * Inside the preview page both phones are iframes sharing ONE session history, so `history.back()`
 * could undo the other phone's last navigation. There we step back through our own trail instead.
 */
export function goBack(fallback: string) {
  if (trail.at <= 0) return replaceRoute(fallback);
  if (window.self === window.top) return history.back();
  trail.backing = true;
  location.replace(`#${trail.stack[trail.at - 1]}`);
}

/** Square back button wired to in-app history. `fallback` is used on a fresh load or deep link. */
export function AppBackButton({ fallback, label }: { fallback: string; label?: string }) {
  return <BackButton href={`#${fallback}`} label={label} onClick={() => goBack(fallback)} />;
}

export function Redirect({ to }: { to: string }) {
  useEffect(() => replaceRoute(to), [to]);
  return null;
}
