import { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions - PyraRide",
  description: "PyraRide Terms and Conditions - Rules and guidelines for using our horse riding booking platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-10 w-10" />
            <h1 className="font-display text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-lg text-white/90">Last Updated: November 1, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-lg max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PyraRide ("the Platform"), you accept and agree to be bound by 
              these Terms and Conditions. If you do not agree with any part of these terms, you must 
              not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Platform"</strong> refers to the PyraRide website and services</li>
              <li><strong>"User"</strong> refers to anyone accessing or using the Platform</li>
              <li><strong>"Rider"</strong> refers to customers booking horse riding experiences</li>
              <li><strong>"Stable"</strong> refers to registered horse riding service providers</li>
              <li><strong>"Booking"</strong> refers to a reservation made through the Platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold mb-3">3.1 Registration</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must be at least 18 years old to create an account</li>
              <li>You must provide accurate, current, and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3.2 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, 
              engage in fraudulent activity, or pose a risk to other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Booking Terms</h2>
            
            <h3 className="text-xl font-semibold mb-3">4.1 Booking Process</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>All bookings are subject to stable availability</li>
              <li>Booking confirmation will be sent via email</li>
              <li>You must arrive at the stable at the scheduled time</li>
              <li>Late arrivals may result in reduced ride time or cancellation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.2 Pricing</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Prices are displayed in USD and may vary by stable</li>
              <li>All prices include applicable taxes unless otherwise stated</li>
              <li>Payment is processed at the time of booking</li>
              <li>We reserve the right to correct pricing errors</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4.3 Cancellation & Refund Policy</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>24+ hours before:</strong> Full refund</li>
              <li><strong>12-24 hours before:</strong> 50% refund</li>
              <li><strong>Less than 12 hours:</strong> No refund</li>
              <li>Weather-related cancellations: Full refund or rescheduling</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Safety & Liability</h2>
            
            <h3 className="text-xl font-semibold mb-3">5.1 Health Requirements</h3>
            <p className="mb-4">Riders must:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Be in good physical health</li>
              <li>Disclose any medical conditions that may affect riding</li>
              <li>Follow all safety instructions provided by stable staff</li>
              <li>Wear appropriate clothing and footwear</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.2 Assumption of Risk</h3>
            <p className="mb-4">
              Horse riding is an inherently risky activity. By booking, you acknowledge and accept:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Risk of injury from falls, kicks, or horse behavior</li>
              <li>Responsibility for following safety guidelines</li>
              <li>That horses are unpredictable animals</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">5.3 Liability Waiver</h3>
            <p>
              PyraRide acts as a booking platform connecting riders with independent stables. 
              We are not responsible for injuries, accidents, or incidents that occur during 
              riding activities. Each stable maintains its own insurance and liability coverage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. User Conduct</h2>
            <p className="mb-4">Users must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide false or misleading information</li>
              <li>Impersonate another person or entity</li>
              <li>Use the Platform for illegal purposes</li>
              <li>Harass, threaten, or abuse other users or staff</li>
              <li>Attempt to hack, disrupt, or damage the Platform</li>
              <li>Post offensive, defamatory, or inappropriate content</li>
              <li>Engage in fraudulent booking or payment activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Reviews & Content</h2>
            
            <h3 className="text-xl font-semibold mb-3">7.1 User-Generated Content</h3>
            <p className="mb-4">By submitting reviews, photos, or other content:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You grant PyraRide a license to use, display, and distribute your content</li>
              <li>You confirm the content is original and does not infringe rights</li>
              <li>You agree to our content guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">7.2 Content Moderation</h3>
            <p>
              We reserve the right to remove content that violates our guidelines, is offensive, 
              misleading, or inappropriate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All Platform content is owned by PyraRide or licensed</li>
              <li>PyraRide logo, trademarks, and branding are protected</li>
              <li>You may not copy, modify, or distribute our content without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold mb-3">9.1 Customer Support</h3>
            <p className="mb-4">
              For booking issues or disputes, contact our support team at 
              <a href="mailto:support@pyraride.com" className="text-primary hover:underline ml-1">support@pyraride.com</a>
            </p>

            <h3 className="text-xl font-semibold mb-3">9.2 Mediation</h3>
            <p>
              If a dispute cannot be resolved through customer support, both parties agree to 
              attempt good-faith mediation before pursuing legal action.
            </p>

            <h3 className="text-xl font-semibold mb-3">9.3 Governing Law</h3>
            <p>
              These terms are governed by the laws of Egypt. Disputes will be resolved in 
              Egyptian courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, PyraRide shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Acts or omissions of third-party stables</li>
              <li>Force majeure events (natural disasters, pandemics, etc.)</li>
            </ul>
            <p className="mt-4">
              Our total liability is limited to the amount paid for your booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Significant changes will 
              be communicated via email or platform notification. Continued use after changes 
              constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-2">PyraRide Support Team</p>
              <p>Email: <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></p>
              <p>Phone: +20 123 456 7890</p>
              <p>Address: Giza, Egypt</p>
              <p className="mt-2">Business Hours: 9 AM - 6 PM EET, 7 days a week</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="font-semibold mb-2">Agreement</p>
            <p className="text-sm">
              By using PyraRide, you acknowledge that you have read, understood, and agree to 
              be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
