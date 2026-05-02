import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative h-[300px] w-full overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D4A6E]/20 to-black/90 z-10" />
        <img src="/hero-bg.webp" alt="Privacy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4">Privacy Policy</h1>
          <p className="text-white/60 mt-2">How we collect, use, and protect your personal information.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <Card className="p-6 bg-white/5 border-white/10">
            <p className="text-white/80 leading-relaxed">At PyraRides, we take your privacy seriously. This policy outlines how we handle your data to ensure a secure and transparent experience.</p>
          </Card>
          {[
            { title: "Information We Collect", content: "We collect information you provide directly (name, email, phone), booking data, and usage information to improve your experience on PyraRides." },
            { title: "How We Use Your Information", content: "We use your information to process bookings, send confirmations, provide customer support, improve our platform, and send relevant communications with your consent." },
            { title: "Data Security", content: "We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest." },
            { title: "Your Rights", content: "You have the right to access, update, or delete your personal information. Contact us at privacy@pyrarides.com for any data requests." },
            { title: "Contact Us", content: "For privacy-related inquiries, contact us at privacy@pyrarides.com. We typically respond within 48 hours." },
          ].map(({ title, content }, idx) => (
            <Card key={idx} className="p-6 bg-white/5 border-white/10">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-[#2D4A6E] flex-shrink-0 mt-1" />
                <div><h3 className="text-lg font-semibold text-white mb-2">{title}</h3><p className="text-white/70 leading-relaxed">{content}</p></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
