"use client";

import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, XCircle, Shield, Wallet, CreditCard, Users, User } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-black/90 z-10" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Breadcrumbs items={[{ label: "Refund Policy" }]} />
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mt-4">
            Booking & Cancellation Policy
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            Transparent, fair, and secure guidelines for Riders and Stable Partners.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Last Updated */}
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last Updated: 11 November 2025</span>
          </div>

          {/* Intro */}
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <p className="text-white/80 leading-relaxed">
              Welcome to Pyraride! We are committed to providing a transparent, fair, and secure booking experience for all our users, including our valued Riders (customers) and Stable Partners (stables). Your use of our platform and the completion of any booking constitutes your full agreement to these terms. Please read this policy carefully.
            </p>
          </Card>

          {/* 1. Booking Policy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">1</span>
              Booking Policy
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <User className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">1.1 Individual Booking</h3>
                    <p className="text-white/70 text-sm">
                      A booking for a single rider is confirmed immediately upon successful completion of the online payment.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">1.2 Group Booking</h3>
                    <p className="text-white/70 text-sm mb-2">
                      "Smart Link Reservation" - To maintain the integrity of our individual rider rating system, all group bookings must have each spot assigned to a registered Pyraride user.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Group Booking Details</h3>
              <ul className="space-y-4 text-white/70">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Rider Assignment:</strong> The group "Leader" initiates the booking but is required to assign each horse/spot to a specific, registered user account. It is not possible to book "3 spots" without identifying the riders.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white">Payment Options:</strong> The Leader can choose from:
                    <ul className="pl-4 mt-2 space-y-2 border-l-2 border-white/10 ml-1">
                      <li>• <strong>Pay for All:</strong> The Leader pays the full amount for the entire group.</li>
                      <li>• <strong>Split the Bill:</strong> A "Smart Link" is generated for each individual to pay their own share.</li>
                      <li>• <strong>Customize Payment:</strong> The Leader can choose to pay for specific members while others pay their own share.</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-red-400">Booking Confirmation (Important):</strong>
                    <p className="mt-1">Spots are NOT held or temporarily reserved during the payment process. A group booking is only confirmed when the last member successfully completes their payment. If a slot becomes unavailable, paid members are automatically refunded.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </section>

          {/* 2. Cancellation Policy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">2</span>
              Cancellation Policy (Online Payments)
            </h2>
            <p className="text-white/60">This policy applies only to bookings made using our electronic payment gateways (e.g., Visa, Mastercard, Vodafone Cash).</p>

            <div className="space-y-4">
              {/* Tier 1 */}
              <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-green-500/5 p-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CheckCircle className="w-24 h-24 text-green-500" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-green-400 mb-2">2.1 Tier 1: Safe Cancellation</h3>
                  <p className="text-green-200/60 text-sm mb-4">More than 48 hours in advance</p>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 font-bold">
                      100% Full Cash Refund
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertCircle className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">2.2 Tier 2: Medium Cancellation</h3>
                  <p className="text-yellow-200/60 text-sm mb-4">Between 24 to 48 hours in advance</p>
                  <div className="mb-4">
                    <span className="text-white/80">Penalty: </span>
                    <span className="text-red-400 font-semibold">50% fee applied</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/60">Your Refund Options (for the remaining 50%):</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="p-3 rounded bg-white/5 border border-white/10">
                        <span className="block text-white font-semibold">Option A</span>
                        <span className="text-sm text-white/60">50% Cash Refund</span>
                      </div>
                      <div className="p-3 rounded bg-primary/10 border border-primary/30">
                        <span className="block text-primary font-semibold">Option B (Recommended)</span>
                        <span className="text-sm text-white/60">60% Credit in Pyraride Wallet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier 3 */}
              <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5 p-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <XCircle className="w-24 h-24 text-red-500" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-red-400 mb-2">2.3 Tier 3: Late Cancellation</h3>
                  <p className="text-red-200/60 text-sm mb-4">Less than 24 hours in advance</p>
                  <div className="mb-4">
                    <span className="text-white/80">Penalty: </span>
                    <span className="text-red-400 font-semibold">100% fee applied</span>
                  </div>
                  <div className="p-4 rounded bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">Rider Courtesy</h4>
                    <p className="text-sm text-white/70">
                      So you don't lose everything, Pyraride sacrifices its entire commission (e.g., 20%). This amount is automatically credited to your Pyraride Wallet for a future booking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Golden Opportunity */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400/20 text-yellow-400 text-sm">3</span>
              The "Golden Opportunity" Re-booking Feature
            </h2>
            <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-black border-yellow-500/30">
              <p className="text-white/80 mb-4">
                This feature applies only to Tier 3 (Late Cancellation) scenarios. When you make a late cancellation, your spot is automatically relisted on Pyraride as a "Last-Minute" deal.
              </p>
              <div className="flex items-start gap-4 p-4 rounded bg-yellow-500/10 border border-yellow-500/20">
                <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-400 mb-1">If another rider books your spot:</h4>
                  <p className="text-sm text-white/70">
                    The remaining amount (the original stable's share, e.g., 80%) will be added to your Pyraride Wallet as a "Bonus Credit". Your wallet credit can jump from 20% up to 100%. This is a "chance" to recover your funds, not a guarantee.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* 4. Cash Payment Policy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">4</span>
              Cash Payment Policy ("Earned Privilege Model")
            </h2>
            <Card className="p-6 bg-white/5 border-white/10">
              <p className="text-white/80 mb-6">
                We understand some users prefer to pay in cash. However, to protect stables from "No-Shows", cash payment is an earned privilege, not a default right.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded bg-white/5">
                  <h3 className="font-bold text-white mb-2">4.1 New Users</h3>
                  <p className="text-sm text-white/60">
                    "Pay at Stable" is Disabled. You must complete your first booking using Online Payment to unlock this privilege.
                  </p>
                </div>
                <div className="p-4 rounded bg-green-500/10 border border-green-500/20">
                  <h3 className="font-bold text-green-400 mb-2">4.2 Trusted Riders</h3>
                  <p className="text-sm text-white/60">
                    After one successful online booking, the "Cash Payment" privilege is automatically unlocked.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded bg-red-500/10 border border-red-500/20">
                <h3 className="font-bold text-red-400 mb-2">4.3 The "No-Show" Penalty</h3>
                <p className="text-sm text-white/70 mb-2">
                  If a "Trusted Rider" books via cash and fails to show up:
                </p>
                <ul className="list-disc pl-5 text-sm text-white/60 space-y-1">
                  <li>The system will permanently revoke the "Cash Payment" privilege.</li>
                  <li>New accounts created to bypass this will be identified and forced to pay online.</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* 5. Note for Stables */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm">5</span>
              A Note for Our Stable Partners
            </h2>
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white">Online Bookings</h3>
                  <p className="text-sm text-white/60">Your revenue is 100% protected. If a rider cancels late (Tier 3), you receive your full share.</p>
                </div>
                <div>
                  <h3 className="font-bold text-white">Cash Bookings</h3>
                  <p className="text-sm text-white/60 mb-2">You have a choice in your dashboard:</p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span><strong>Disable Cash:</strong> Receive 100% guaranteed, pre-paid online bookings only (0% risk).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      <span><strong>Enable Cash:</strong> Increase potential sales by accepting cash from "Trusted Riders".</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
