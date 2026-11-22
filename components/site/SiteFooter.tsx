import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  { title: "Explore", links: [["Home", "/"], ["Phone Preview", "/preview/"], ["Become a Provider", "/become-provider/"], ["Safety & Trust", "/safety/"]] },
  { title: "Account", links: [["Get Started", "/login/"]] },
  { title: "Legal & Support", links: [["Terms & Conditions", "/terms/"], ["Privacy Policy", "/privacy/"], ["Contact / Support", "/contact/"]] },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-5 py-12 lg:p-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <Image src="/brand/nexo-logo-white.png" alt="NEXO® marketplace" width={1280} height={475} className="h-14 w-auto self-start" />
            <p className="text-[15px] text-footer-text">Connecting customers with trusted service professionals.</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:flex sm:gap-16">
            {COLUMNS.map((c) => (
              <div key={c.title} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-teal-light">{c.title}</p>
                {c.links.map(([label, href]) => (
                  <Link key={label} href={href} className="text-base text-white hover:text-teal-light">{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-divider" />
        <p className="text-sm text-footer-text">© 2026 NEXO®. All rights reserved.</p>
      </div>
    </footer>
  );
}
