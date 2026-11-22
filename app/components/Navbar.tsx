"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full bg-[#0B1F5C] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" width={100} height={100} alt="logo"/>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
                    <Link
          href="/become-provider"
          className={`text-sm font-medium transition-colors ${
            pathname === "/become-provider"
              ? "text-[#00C896]"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Become a Provider
        </Link>
            <Link
              href="/preview/"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Phone Preview
            </Link>

             <div className="hidden md:flex items-center">
            <Link
              href="/"
              className="bg-[#00C896] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#00A87D] transition-colors"
            >
              Get Started
            </Link>
          </div>
          </nav>

          {/* CTA Button */}
         

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D1B2A] border-t border-white/10 px-4 pb-4 pt-2 space-y-3">
         <Link
  href="/become-provider"
  className={`block text-sm font-medium py-2 transition-colors ${
    pathname === "/become-provider"
      ? "text-[#00C896]"
      : "text-gray-300 hover:text-white"
  }`}
  onClick={() => setMenuOpen(false)}
>
  Become a Provider
</Link>
          <Link
            href="/preview/"
            className="block text-sm font-medium text-gray-300 hover:text-white py-2"
            onClick={() => setMenuOpen(false)}
          >
            Phone Preview
          </Link>
          <Link
            href="/browse-providers"
            className="block bg-[#00C896] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#00A87D] transition-colors text-center mt-2"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
