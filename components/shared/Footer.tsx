import Link from "next/link";
import { Instagram } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

// TikTok Icon SVG Component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-secondary border-t hidden md:block">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        {/* Newsletter Signup */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Mission */}
          <div>
            <h3 className="text-primary font-bold text-xl mb-4">PyraRide</h3>
            <p className="text-sm text-foreground/70 mb-4">
              The Pyramids, Unforgettable.<br />
              The Ride, Uncomplicated.
            </p>
            <p className="text-xs text-foreground/60">
              Connecting travelers with trusted, verified horse riding experiences at Egypt's most iconic landmarks.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Explore</h4>
            <nav className="flex flex-col gap-2 text-sm text-foreground/70">
              <Link href="/stables" className="hover:text-primary transition-colors">Browse Stables</Link>
              <Link href="/gallery" className="hover:text-primary transition-colors">Photo Gallery</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            </nav>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support & Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-foreground/70">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            </nav>
          </div>

          {/* Connect & Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Connect With Us</h4>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-foreground/70">
                📧 <a href="mailto:support@pyraride.com" className="hover:text-primary transition-colors">support@pyraride.com</a>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                aria-label="Instagram" 
                href="https://instagram.com/pyrarides" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                aria-label="TikTok" 
                href="https://tiktok.com/@pyrarides" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <TikTokIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-foreground/60 text-center md:text-left">
            © {new Date().getFullYear()} PyraRide. All rights reserved. Made with ❤️ in Egypt.
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refunds</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
