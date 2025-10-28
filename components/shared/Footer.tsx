import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-nile-blue font-semibold text-lg">PyraRide</div>

          <nav className="flex flex-wrap gap-6 text-sm text-foreground/80">
            <Link href="/about">About</Link>
            <Link href="/stables">Stables</Link>
            <Link href="/trust">Trust &amp; Safety</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="flex items-center gap-4 text-foreground/70">
            <Link aria-label="Instagram" href="https://instagram.com">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link aria-label="Facebook" href="https://facebook.com">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link aria-label="Twitter" href="https://twitter.com">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-foreground/60">
          © {new Date().getFullYear()} PyraRide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
