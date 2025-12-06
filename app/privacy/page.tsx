"use client";

import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Share2, Globe, UserCheck, Mail } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-black/90 z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mt-4">
            Privacy Policy
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            How we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <p className="text-white/80 leading-relaxed">
              At PyraRide, we take your privacy seriously. This policy outlines how we handle your data to ensure a secure and transparent experience.
            </p>
            <p className="text-sm text-white/40 mt-4">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </Card>

          {/* 1. Information We Collect */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">1</span>
              Information We Collect
            </h2>
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• Name, email, phone number</li>
                    <li>• Payment information</li>
                    <li>• Booking preferences</li>
                    <li>• Profile photos and reviews</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Automatically Collected
                  </h3>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• IP address and device info</li>
                    <li>• Browser type and usage data</li>
                    <li>• Cookies and analytics</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">2</span>
              How We Use Your Information
            </h2>
            <Card className="p-6 bg-white/5 border-white/10">
              <ul className="grid gap-3 md:grid-cols-2 text-white/70">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Process and manage your bookings
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Send booking confirmations and updates
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Process payments securely
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Improve our platform services
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Comply with legal obligations
                </li>
              </ul>
            </Card>
          </section>

          {/* 3. Information Sharing */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">3</span>
              Information Sharing
            </h2>
            <Card className="p-6 bg-white/5 border-white/10">
              <p className="text-white/80 mb-4">We do not sell your personal information. We share it only with:</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Stable Owners</h3>
                    <p className="text-sm text-white/60">To facilitate your bookings (name, contact details).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-orange-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Service Providers</h3>
                    <p className="text-sm text-white/60">Trusted partners for payments, email, and analytics.</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 4. Data Security */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">4</span>
              Data Security
            </h2>
            <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-black border-blue-500/30">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <p className="text-white/80">
                  We implement robust security measures including SSL/TLS encryption, secure payment processing, and regular security audits to protect your data.
                </p>
              </div>
            </Card>
          </section>

          {/* Contact */}
          <section className="mt-10 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-white/70 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="flex items-center gap-3 text-white/70">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:privacy@pyraride.com" className="text-white hover:text-primary transition-colors">
                privacy@pyraride.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
