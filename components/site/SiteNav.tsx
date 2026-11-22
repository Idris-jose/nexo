"use client";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui/cx";
import { GetStartedLink, SignInLink } from "./AuthCta";

const LINKS = [
  { href: "/become-provider/", label: "Become a Provider" },
  { href: "/preview/", label: "Phone Preview" },
];

/** The one site header: landing, Become a Provider, Phone Preview and info pages all render this. */
export function SiteNav({ active: forced }: { active?: string } = {}) {
  const pathname = usePathname();
  const active = forced ?? LINKS.find((l) => pathname === l.href || pathname === l.href.replace(/\/$/, ""))?.href;
  return (
    <header className="sticky top-0 z-40 bg-nav">
      <div className="mx-auto flex h-[73px] max-w-[1440px] items-center justify-between px-5 lg:h-24 lg:px-16">
        <Link href="/" aria-label="NEXO® home" className="shrink-0">
          <Image src="/brand/nexo-logo.png" alt="NEXO® marketplace" width={1280} height={476} priority className="h-11 w-auto lg:h-14" />
        </Link>
        <div className="hidden items-center gap-[59px] lg:flex">
          <nav className="flex items-center gap-8 font-display text-base font-medium" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} aria-current={active === l.href ? "page" : undefined} className={cx("transition hover:text-teal-light", active === l.href ? "text-teal" : "text-white")}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <SignInLink className="text-base font-semibold text-white/85 hover:text-white" />
            <GetStartedLink className="rounded-xl bg-teal px-7 py-4 text-base font-semibold leading-none text-white transition hover:bg-primary-dark" />
          </div>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <GetStartedLink className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white" />
          <details className="relative">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/20 text-white" aria-label="Menu">
              <Menu size={20} />
            </summary>
            <div className="absolute right-0 top-12 w-60 rounded-2xl border border-line bg-white p-2 shadow-glass">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className={cx("block rounded-xl px-3 py-2.5 text-[15px] font-semibold hover:bg-surface", active === l.href ? "text-teal" : "text-navy")}>{l.label}</a>
              ))}
              <SignInLink className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-teal hover:bg-surface" />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
