import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-8">
          <div className="text-nile-blue font-semibold text-base md:text-lg">PyraRide</div>

          <nav className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-foreground/80 justify-center md:justify-start">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/stables" className="hover:text-primary transition-colors">Stables</Link>
            <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
            <Link href="/studios" className="hover:text-primary transition-colors">Studios</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4 text-foreground/70">
            <Link 
              aria-label="Instagram" 
              href="https://instagram.com/pyraride" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link 
              aria-label="Facebook" 
              href="https://facebook.com/pyraride" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link 
              aria-label="Twitter" 
              href="https://twitter.com/pyraride" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link 
              aria-label="YouTube" 
              href="https://youtube.com/@pyraride" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
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
