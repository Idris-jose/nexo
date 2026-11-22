"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui/cx";
import { GetStartedLink } from "./AuthCta";

const LINKS = [
  { href: "/become-provider/", label: "Become a Provider" },
  { href: "/preview/", label: "Phone Preview" },
];

/** The one site header: landing, Become a Provider, Phone Preview and info pages all render this. */
export function SiteNav({ active: forced }: { active?: string } = {}) {
  const pathname = usePathname();
  const active = forced ?? LINKS.find((l) => pathname === l.href || pathname === l.href.replace(/\/$/, ""))?.href;
  const [open, setOpen] = useState(false);
  // Close the accordion whenever the page changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI state on navigation
  useEffect(() => setOpen(false), [pathname]);
  return (
    <header className="sticky top-0 z-40 bg-nav">
      <div className="mx-auto flex h-[73px] max-w-[1440px] items-center justify-between px-5 lg:h-24 lg:px-16">
        <Link href="/" aria-label="NEXO® home" className="shrink-0">
          <Image src="/logo.png" width={100} height={100} alt="NEXO® logo" priority />
        </Link>
        <div className="hidden items-center gap-[59px] lg:flex">
          <nav className="flex items-center gap-8 text-sm font-medium" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} aria-current={active === l.href ? "page" : undefined} className={cx("transition hover:text-teal-light", active === l.href ? "text-teal" : "text-white")}>
                {l.label}
              </a>
            ))}
          </nav>
          <GetStartedLink className="rounded-xl bg-teal px-7 py-4 text-base font-semibold leading-none text-white transition hover:bg-primary-dark" />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-10 items-center justify-center rounded-xl border border-white/20 text-white lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {/* Mobile accordion: the menu slides open below the bar. */}
      <div
        id="site-menu"
        className={cx("grid overflow-hidden border-t border-white/10 bg-nav transition-[grid-template-rows] duration-300 ease-out lg:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent")}
        inert={!open}
      >
        <div className="min-h-0">
          <nav className="flex flex-col px-5 pb-5 pt-2" aria-label="Mobile">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={active === l.href ? "page" : undefined}
                className={cx("border-b border-white/10 py-3.5 text-sm font-medium", active === l.href ? "text-teal-light" : "text-white")}
              >
                {l.label}
              </a>
            ))}
            <GetStartedLink className="mt-4 rounded-xl bg-teal px-4 py-3 text-center text-[15px] font-semibold text-white" />
          </nav>
        </div>
      </div>
    </header>
  );
}
