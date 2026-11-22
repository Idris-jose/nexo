"use client";
import {
  BookOpen, ChevronLeft, CircleAlert, Headphones, Heart, Key, Leaf, LoaderCircle, Music, PaintRoller, Pipette, Sparkles, Star,
  Truck, User, Wrench, X, Zap, type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatRand } from "@/lib/demo/money";
import { userPhoto } from "@/lib/demo/photos";
import { getService } from "@/lib/demo/services";
import type { Tone } from "@/lib/demo/types";
import { cx } from "./cx";

export { cx };
export type Icon = LucideIcon;

/* ---------- Brand ---------- */
export function Logo({ className = "h-8", white }: { className?: string; white?: boolean }) {
  return (
    <Image
      src={white ? "/brand/nexo-logo-white.png" : "/brand/nexo-logo.png"}
      alt="NEXO® marketplace"
      width={1280}
      height={476}
      className={cx("w-auto", className)}
      priority
    />
  );
}

/** Splashes mid-play. Survives React Strict Mode's mount/unmount/mount so the animation isn't cut short. */
const splashPlaying = new Set<string>();

/**
 * Figma "Nexo Splash": black screen, two-tone logo slides in from the right, then fades out.
 * Covers its own viewport only, so inside the phone-preview iframe it stays within the phone.
 * Plays once per browser session per `id`; starts hidden so return visits never flash black.
 */
export function Splash({ id }: { id: string }) {
  const [show, setShow] = useState(false);
  useLayoutEffect(() => {
    const key = splashKey(id);
    if (!splashPlaying.has(id) && sessionStorage.getItem(key)) return;
    splashPlaying.add(id);
    sessionStorage.setItem(key, "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- splash plays once per browser session
    setShow(true);
    const t = setTimeout(() => {
      splashPlaying.delete(id);
      setShow(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [id]);
  if (!show) return null;
  return (
    <div className="splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black" aria-hidden="true">
      <div className="splash-logo splash-mark w-[200px] sm:w-[300px]" />
    </div>
  );
}
export const splashKey = (id: string) => `nexo.splash.${id}`;

/* ---------- Button ---------- */
const VARIANTS = {
  primary: "bg-ink text-white hover:bg-[#13286f]",
  teal: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-white text-ink border border-line hover:border-primary/40",
  soft: "bg-primary-soft text-primary-dark hover:bg-[#d2ece8]",
  ghost: "text-muted hover:text-ink hover:bg-black/[.04]",
  danger: "bg-white text-danger border border-danger/30 hover:bg-danger/5",
  dark: "bg-ink text-white hover:bg-black",
};
const SIZES = { sm: "h-9 px-3.5 text-sm rounded-lg", md: "h-11 px-4 text-[15px] rounded-xl", lg: "h-12 px-5 text-[15px] rounded-xl" };

export function Button({
  children, variant = "primary", size = "md", href, onClick, disabled, loading, full, type = "button", icon: IconC, iconRight: IconR, className, label, target,
}: {
  children?: ReactNode; variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES; href?: string; onClick?: () => void;
  disabled?: boolean; loading?: boolean; full?: boolean; type?: "button" | "submit"; icon?: Icon; iconRight?: Icon;
  className?: string; label?: string; target?: string;
}) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[.98] select-none whitespace-nowrap",
    VARIANTS[variant], SIZES[size], full && "w-full", (disabled || loading) && "opacity-50 pointer-events-none", className,
  );
  const inner = (
    <>
      {loading ? <LoaderCircle size={18} className="animate-spin" /> : IconC && <IconC size={18} strokeWidth={2.1} />}
      {children}
      {IconR && !loading && <IconR size={18} strokeWidth={2.1} />}
    </>
  );
  return href ? (
    <a href={href} className={cls} aria-label={label} target={target}>{inner}</a>
  ) : (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} aria-label={label}>{inner}</button>
  );
}

/** Figma square back button (40px, outlined, chevron). With both `href` and `onClick`, the href is the no-JS fallback. */
export function BackButton({ href, onClick, label = "Back" }: { href?: string; onClick?: () => void; label?: string }) {
  const cls = "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink transition hover:border-primary/40";
  return href ? (
    <a
      href={href}
      className={cls}
      aria-label={label}
      onClick={onClick && ((e) => { e.preventDefault(); onClick(); })}
    >
      <ChevronLeft size={20} />
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={label}><ChevronLeft size={20} /></button>
  );
}

export function IconButton({ icon: I, label, href, onClick, badge }: { icon: Icon; label: string; href?: string; onClick?: () => void; badge?: number }) {
  const inner = (
    <>
      <I size={20} />
      {!!badge && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[11px] font-bold text-white ring-2 ring-cream">{badge}</span>}
    </>
  );
  const cls = "relative inline-flex size-11 items-center justify-center rounded-xl border border-line bg-white text-ink transition hover:border-primary/40";
  return href ? <a href={href} className={cls} aria-label={label}>{inner}</a> : <button type="button" onClick={onClick} className={cls} aria-label={label}>{inner}</button>;
}

/* ---------- Card ---------- */
export function Card({ children, className, onClick, href, selected }: { children: ReactNode; className?: string; onClick?: () => void; href?: string; selected?: boolean }) {
  const cls = cx(
    "rounded-2xl bg-white border border-line",
    (onClick || href) && "transition hover:border-primary/40 text-left",
    selected && "ring-2 ring-primary border-primary",
    className,
  );
  if (href) return <a href={href} className={cx(cls, "block")}>{children}</a>;
  if (onClick) return <button type="button" onClick={onClick} className={cx(cls, "block w-full")}>{children}</button>;
  return <div className={cls}>{children}</div>;
}

export function SectionTitle({ children, action, href }: { children: ReactNode; action?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-[19px] font-bold text-ink">{children}</h2>
      {action && href && (
        <a href={href} className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline">
          {action} <ChevronLeft size={15} className="rotate-180" />
        </a>
      )}
    </div>
  );
}

/* ---------- Badges ---------- */
const TONES: Record<Tone | "red", string> = {
  green: "bg-primary-soft text-primary",
  gold: "bg-yellow text-[#8a5a00]",
  gray: "bg-field text-ink/75",
  red: "bg-danger/10 text-danger",
};
export function Badge({ children, tone = "green", icon: IconC, className }: { children: ReactNode; tone?: Tone | "red"; icon?: Icon; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", TONES[tone], className)}>
      {IconC && <IconC size={13} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-primary" title="Verified individual">
      <svg width={small ? 14 : 16} height={small ? 14 : 16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.4 1.8 3-.2 1 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3.1 15.9 4 13 3.1 10.1l2.5-1.7 1-2.8 3 .2z" />
        <path d="M8.5 12.2l2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!small && <span className="text-xs font-semibold">Verified</span>}
    </span>
  );
}

/** Figma avatar: the person's photo when we have one, else a mint circle with a navy person glyph (or an initial letter). */
export function Avatar({ name, id, size = 44, letter, className }: { name?: string; id?: string; size?: number; letter?: string; className?: string }) {
  const src = userPhoto(id);
  if (src)
    return (
      <Image src={src} alt={name ?? ""} width={size} height={size} sizes={`${size * 2}px`} className={cx("shrink-0 rounded-full bg-primary-soft object-cover", className)} style={{ width: size, height: size }} />
    );
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-display font-bold text-ink", className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label={name}
      role={name ? "img" : undefined}
    >
      {letter ?? <User size={Math.round(size * 0.48)} strokeWidth={1.9} />}
    </span>
  );
}

/** Full-bleed provider photo for cards and profile heroes; falls back to the person glyph on mint. */
export function PersonPhoto({ id, name, sizes, className }: { id?: string; name: string; sizes: string; className?: string }) {
  const src = userPhoto(id);
  return (
    <span className={cx("relative block overflow-hidden bg-primary-soft", className)}>
      {src ? (
        <Image src={src} alt={name} fill sizes={sizes} className="object-cover object-[50%_25%]" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-ink/70" role="img" aria-label={name}><User size={40} strokeWidth={1.6} /></span>
      )}
    </span>
  );
}

/** Figma rating: teal star, "4.9 · 28 reviews". */
export function Stars({ value, count, size = 14, className }: { value?: number; count?: number; size?: number; className?: string }) {
  if (!value) return <span className="text-xs font-medium text-muted">New</span>;
  return (
    <span className={cx("inline-flex items-center gap-1 text-[13px] font-semibold text-primary", className)} aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <Star size={size} className="fill-primary text-primary" />
      {value.toFixed(1)}
      {count != null && <span>· {count} {count === 1 ? "review" : "reviews"}</span>}
    </span>
  );
}

export function StarInput({ value, onChange, size = 34 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-2" role={onChange ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          role={onChange ? "radio" : undefined}
          aria-checked={onChange ? value === n : undefined}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition active:scale-90 disabled:cursor-default"
        >
          <Star size={size} className={n <= value ? "fill-primary text-primary" : "text-primary/40"} strokeWidth={1.6} />
        </button>
      ))}
    </div>
  );
}

export function Money({ cents, className, hourly }: { cents: number; className?: string; hourly?: boolean }) {
  return (
    <span className={cx("font-display font-bold tabular-nums text-ink", className)}>
      {formatRand(cents)}
      {hourly && <span className="ml-0.5 font-sans text-[0.72em] font-medium text-muted">/hr</span>}
    </span>
  );
}

export const SERVICE_ICONS: Record<string, Icon> = {
  electrical: Zap, plumbing: Wrench, cleaning: Sparkles, painting: PaintRoller, moving: Truck, repairs: Pipette, gardening: Leaf,
  tutoring: BookOpen, massage: Heart, events: Music, admin: Headphones, locksmith: Key,
};
export function ServiceIcon({ slug, size = 20, tile = 44, className }: { slug: string; size?: number; tile?: number; className?: string }) {
  const IconC = SERVICE_ICONS[getService(slug)?.slug ?? ""] ?? Wrench;
  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary", className)} style={{ width: tile, height: tile }}>
      <IconC size={size} strokeWidth={2} />
    </span>
  );
}

/** Figma stat card (My Gigs "Active gigs 2"). */
export function StatTile({ icon: IconC, value, label, tone = "green" }: { icon: Icon; value: ReactNode; label: string; tone?: "green" | "gold" }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
        <IconC size={15} className={tone === "gold" ? "text-[#b07a00]" : "text-primary"} /> {label}
      </p>
      <p className="mt-1 break-words font-display text-[26px] font-bold leading-tight text-ink">{value}</p>
    </div>
  );
}

export function EmptyState({ icon: IconC, title, body, action }: { icon: Icon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
      <span className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><IconC size={26} /></span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted" role="status">
      <LoaderCircle className="animate-spin text-primary" size={20} /> {label}
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger" role="alert">
      <CircleAlert size={15} /> {children}
    </p>
  );
}

export function Field({ label, error, hint, children, htmlFor, extra }: { label: ReactNode; error?: string; hint?: string; children: ReactNode; htmlFor?: string; extra?: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink">{label}</label>
        {extra}
      </div>
      {children}
      {error ? <FieldError>{error}</FieldError> : hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Figma segmented tabs (My Gigs: All / Active / Completed): white track, teal selected. */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div className={cx("flex gap-1 rounded-xl border border-line bg-white p-1", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("min-w-0 flex-auto truncate rounded-lg px-2 py-2 text-sm font-semibold transition", value === o.value ? "bg-primary text-white" : "text-ink/75 hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Figma pill options (Post a Gig "When": ASAP / This week / Flexible). */
export function Pills<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("h-10 rounded-full border text-sm font-semibold transition", value === o.value ? "border-primary bg-primary text-white" : "border-line bg-white text-ink/80 hover:border-primary/40")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx("relative h-8 w-14 shrink-0 rounded-full transition", on ? "bg-primary" : "bg-line")}>
      <span className={cx("absolute top-1 size-6 rounded-full bg-white shadow transition-all", on ? "left-7" : "left-1")} />
    </button>
  );
}

/** Figma start-code boxes. */
export function CodeDisplay({ code }: { code: string }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`Code ${code.split("").join(" ")}`}>
      {code.split("").map((d, i) => (
        <span key={i} className="flex h-14 w-11 items-center justify-center rounded-xl border border-line bg-white font-display text-2xl font-bold text-ink">{d}</span>
      ))}
    </div>
  );
}

export function OtpInput({ length = 6, value, onChange, onComplete, autoFocus = true, invalid }: { length?: number; value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; autoFocus?: boolean; invalid?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <div className="relative" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        value={value}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={`${length}-digit code`}
        aria-invalid={invalid}
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, length);
          onChange(v);
          if (v.length === length) onComplete?.(v);
        }}
        className="absolute inset-0 opacity-0"
      />
      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, i) => {
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <span
              key={i}
              className={cx(
                "flex h-14 w-11 items-center justify-center rounded-xl border bg-white font-display text-2xl font-bold text-ink transition",
                invalid ? "border-danger" : active ? "border-primary ring-4 ring-primary/15" : "border-line",
              )}
            >
              {value[i] ?? (active ? <span className="h-6 w-0.5 animate-blink bg-primary" /> : "")}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Figma bottom sheet (Request Vendor): title + close, content, CTA. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  // Portal: the page wrapper animates with a transform, which would trap a fixed overlay under the tab bar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px]" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full max-w-[440px] animate-rise overflow-y-auto rounded-t-3xl bg-cream p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white text-ink"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Toasts ---------- */
let pushToast: ((text: string) => void) | null = null;
export const toast = (text: string) => pushToast?.(text);

export function Toaster() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    pushToast = (text) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs, { id, text }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3200);
    };
    return () => {
      pushToast = null;
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] mx-auto flex max-w-[440px] flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="animate-rise rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white shadow-glass">{t.text}</div>
      ))}
    </div>
  );
}

/** Re-render every `ms` (OTP countdowns, ETA); returns the current time. */
export function useTick(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
