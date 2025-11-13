import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

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
              <a href="mailto:support@pyraride.com" className="hover:text-primary transition-colors">Customer Support</a>
              <p className="text-xs pt-2">Response time: &lt;4 hours</p>
            </nav>
          </div>

          {/* Connect & Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Connect With Us</h4>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-foreground/70">
                📧 <a href="mailto:support@pyraride.com" className="hover:text-primary transition-colors">support@pyraride.com</a>
              </p>
              <p className="text-sm text-foreground/70">
                📱 +20 123 456 7890
              </p>
              <p className="text-sm text-foreground/70">
                ⏰ 9 AM - 6 PM EET
              </p>
            </div>
            <div className="flex items-center gap-3">
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
