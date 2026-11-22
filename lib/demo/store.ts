"use client";
import { useSyncExternalStore } from "react";
import { RELOADED_KEY, SESSION_KEY, STATE_KEY, STATE_VERSION } from "./constants";
import { createSeed } from "./seed";
import type { State } from "./types";

let memory: string | null = null;
let cacheRaw: string | null = null;
let cacheState: State | null = null;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return localStorage.getItem(STATE_KEY);
  } catch {
    return memory;
  }
}

function writeRaw(raw: string) {
  memory = raw;
  try {
    localStorage.setItem(STATE_KEY, raw);
  } catch {}
}

/** Snapshot cached by raw string so useSyncExternalStore sees stable references. */
export function getState(): State {
  const raw = readRaw();
  if (raw && raw === cacheRaw && cacheState) return cacheState;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === STATE_VERSION) {
        cacheRaw = raw;
        cacheState = parsed;
        return parsed;
      }
      if (parsed.version > STATE_VERSION) {
        if (typeof window !== "undefined" && !sessionStorage.getItem(RELOADED_KEY)) {
          sessionStorage.setItem(RELOADED_KEY, "1");
          location.reload();
        }
        cacheState ??= createSeed();
        return cacheState;
      }
    } catch {}
  }
  const seed = createSeed();
  const seedRaw = JSON.stringify(seed);
  writeRaw(seedRaw);
  cacheRaw = seedRaw;
  cacheState = seed;
  return seed;
}

export function emit() {
  listeners.forEach((l) => l());
}

/** structuredClone → mutate → save → notify. */
export function mutate(fn: (draft: State) => void) {
  const raw = readRaw();
  if (raw) {
    try {
      if ((JSON.parse(raw) as State).version > STATE_VERSION) return;
    } catch {}
  }
  const draft = structuredClone(getState());
  fn(draft);
  const next = JSON.stringify(draft);
  writeRaw(next);
  cacheRaw = next;
  cacheState = draft;
  emit();
}

export function resetState() {
  const seed = createSeed();
  const raw = JSON.stringify(seed);
  writeRaw(raw);
  cacheRaw = raw;
  cacheState = seed;
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STATE_KEY || e.key === SESSION_KEY || e.key === null) emit();
  });
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useSelector<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}
