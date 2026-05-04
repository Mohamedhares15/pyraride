import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t hairline mt-32">
    <div className="container py-20 grid gap-16 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="font-display text-4xl md:text-5xl text-balance leading-[1.05]">
          Where heritage<br/>meets the saddle.
        </p>
        <p className="mt-6 text-ink-muted max-w-sm text-pretty">
          A private concierge for equestrian journeys at the Pyramids of Giza. By invitation, by reservation, by horseback.
        </p>
      </div>
      <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
        <Col title="Discover" links={[["/stables","Stables"],["/packages","Packages"],["/training","Training"],["/gallery","Gallery"],["/reviews","Letters"],["/leaderboard","The Register"]]} />
        <Col title="Concierge" links={[["/booking","Reserve"],["/checkout","Checkout"],["/dashboard","Your journeys"],["/dashboard/loyalty","Le Cercle standing"],["/chat","Correspondence"],["/cercle","Le Cercle"],["/contact","Contact"],["/faq","FAQ"]]} />
        <Col title="House" links={[["/about","About"],["/pricing","Pricing"],["/admin","Stable OS"],["/auth","Sign in"],["/auth/switch","Switchboard"],["/privacy","Privacy"],["/terms","Terms"],["/refund-policy","Refunds"]]} />
      </div>
    </div>
    <div className="border-t hairline">
      <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
        <span>© {new Date().getFullYear()} PyraRides — Giza, Egypt</span>
        <span className="tracking-[0.24em] uppercase">Quiet luxury · By reservation only</span>
      </div>
    </div>
  </footer>
);

const Col = ({ title, links }: { title: string; links: [string,string][] }) => (
  <div>
    <p className="text-[11px] tracking-luxury uppercase text-ink-muted mb-4">{title}</p>
    <ul className="space-y-2.5">
      {links.map(([to,label]) => (
        <li key={to}><Link to={to} className="text-foreground/85 hover:text-foreground transition-colors">{label}</Link></li>
      ))}
    </ul>
  </div>
);
