import { Link } from "wouter";
import { Instagram } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export const Footer = () => (
  <footer className="border-t hairline mt-32">
    <div className="container py-20 grid gap-16 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="font-display text-4xl md:text-5xl text-balance leading-[1.05]">
          Where heritage<br />meets the saddle.
        </p>
        <p className="mt-6 text-ink-muted max-w-sm text-pretty">
          A private concierge for equestrian journeys at the Pyramids of Giza. By invitation, by reservation, by horseback.
        </p>
        <p className="mt-6 text-sm text-ink-muted">
          📧 <a href="mailto:support@pyrarides.com" className="hover:text-foreground transition-colors">support@pyrarides.com</a>
        </p>
        <div className="flex items-center gap-4 mt-5">
          <a
            href="https://instagram.com/pyrarides"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-ink-muted hover:text-foreground transition-colors"
          >
            <Instagram className="size-5" />
          </a>
          <a
            href="https://tiktok.com/@pyrarides"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-ink-muted hover:text-foreground transition-colors"
          >
            <TikTokIcon className="size-5" />
          </a>
        </div>
      </div>
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
        <Col title="Discover" links={[
          ["/stables", "Browse Stables"],
          ["/packages", "Packages"],
          ["/training", "Training"],
          ["/gallery", "Photo Gallery"],
        ]} />
        <Col title="Concierge" links={[
          ["/booking", "Reserve a ride"],
          ["/contact", "Contact"],
          ["/faq", "FAQ"],
        ]} />
        <Col title="House" links={[
          ["/about", "About"],
          ["/signin", "Sign In"],
          ["/privacy", "Privacy Policy"],
          ["/terms", "Terms & Conditions"],
          ["/refund-policy", "Refund Policy"],
        ]} />
      </div>
    </div>
    <div className="border-t hairline">
      <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span>© {new Date().getFullYear()} PyraRides — Giza, Egypt. Made with ❤️ in Egypt.</span>
        <span className="tracking-[0.24em] uppercase">The Pyramids, Unforgettable.</span>
      </div>
    </div>
  </footer>
);

const Col = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div>
    <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">{title}</p>
    <ul className="space-y-2.5">
      {links.map(([to, label]) => (
        <li key={to}><Link to={to} className="text-foreground/85 hover:text-foreground transition-colors">{label}</Link></li>
      ))}
    </ul>
  </div>
);

export default Footer;
