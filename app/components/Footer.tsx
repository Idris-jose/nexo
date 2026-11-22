import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0B1F5C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1 mb-4">
              <Image src="/logo.png" alt="NEXO®" width={100} height={100} />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mt-2">
              Connecting customers with trusted service professionals.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/preview/" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Phone Preview
                </Link>
              </li>
              <li>
                <Link href="/become-provider/" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Safety &amp; Trust
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Legal &amp; Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Contact / Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 NEXO®. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
