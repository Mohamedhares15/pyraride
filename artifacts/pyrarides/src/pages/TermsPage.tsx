import { Card } from "@/components/ui/card";
import { Scale, AlertTriangle } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black text-white">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-24">
        <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
        <div className="mb-8 text-center">
          <h1 className="font-sans text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-white/60">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Card className="p-8 bg-white/5 border-white/10">
          <div className="space-y-8">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-amber-400" /><h3 className="font-semibold text-amber-400">Legal Notice</h3></div>
              <p className="text-sm text-amber-300/80">This agreement is legally binding pursuant to Egyptian Electronic Signature Law No. 15 of 2004.</p>
            </div>
            {[
              { title: "1. Acceptance of Terms", content: "By accessing or using PyraRides, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform." },
              { title: "2. Booking & Reservations", content: "All bookings are subject to stable availability and confirmation. PyraRides acts as a marketplace connecting riders with verified stables." },
              { title: "3. Cancellation Policy", content: "Cancellations made 48+ hours before: full refund. 24-48 hours before: 50% refund. Less than 24 hours: no refund. Cancellations must be made through the platform." },
              { title: "4. Safety & Liability", content: "All riders must follow safety guidelines. PyraRides is not responsible for injuries resulting from failure to follow safety instructions provided by stable staff." },
              { title: "5. Payment", content: "All prices are in Egyptian Pounds (EGP) unless otherwise stated. Payments are processed securely through our payment providers." },
              { title: "6. Contact", content: "For legal inquiries, contact legal@pyrarides.com." },
            ].map(({ title, content }, idx) => (
              <div key={idx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">{content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
