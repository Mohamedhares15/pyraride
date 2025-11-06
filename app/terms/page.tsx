import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "PyraRide Terms and Conditions - Rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
        <h1 className="mb-8 font-display text-4xl font-bold">Terms & Conditions</h1>
        
        <Card className="p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="mb-6">
              Welcome to PyraRide. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
              Please read them carefully before using our services.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By creating an account, making a booking, or using any part of the PyraRide platform, you acknowledge 
                that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our 
                Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-3">2.1 Registration</h3>
              <p className="mb-4">
                You must be at least 18 years old to create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing accurate and complete registration information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3">2.2 Account Types</h3>
              <p className="mb-4">
                <strong>Riders:</strong> Book horse riding experiences at verified stables
              </p>
              <p className="mb-4">
                <strong>Stable Owners:</strong> List your stable, horses, and manage bookings
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Bookings and Payments</h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Booking Process</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>All bookings are subject to availability</li>
                <li>Booking confirmations are sent via email</li>
                <li>You must arrive at the scheduled time</li>
                <li>Age, weight, and health restrictions may apply</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.2 Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payment methods accepted are displayed at checkout</li>
                <li>Prices are displayed in USD unless otherwise stated</li>
                <li>All payments are processed securely</li>
                <li>Payment may be required in advance or on-site depending on the stable</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">3.3 Pricing</h3>
              <p className="mb-4">
                Prices listed on our platform are set by individual stable owners. PyraRide is not responsible 
                for pricing disputes between riders and stables.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Cancellation and Refund Policy</h2>
              <h3 className="text-xl font-semibold mb-3">4.1 Rider Cancellations</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>More than 48 hours before:</strong> Full refund</li>
                <li><strong>24-48 hours before:</strong> 50% refund</li>
                <li><strong>Less than 24 hours:</strong> No refund</li>
                <li><strong>No-show:</strong> No refund</li>
              </ul>
              <p className="mb-4 text-sm text-muted-foreground">
                Note: Individual stables may have different cancellation policies. Check booking details for specific terms.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.2 Stable Cancellations</h3>
              <p className="mb-4">
                If a stable cancels your confirmed booking, you will receive a full refund within 5-7 business days.
              </p>

              <h3 className="text-xl font-semibold mb-3">4.3 Weather Cancellations</h3>
              <p className="mb-4">
                In case of severe weather, the stable may cancel or reschedule your booking. You will be offered 
                a full refund or the option to reschedule.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Conduct and Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Use the platform only for lawful purposes</li>
                <li>Provide truthful information in reviews and communications</li>
                <li>Respect stable property, staff, and animals</li>
                <li>Follow all safety instructions provided by stable staff</li>
                <li>Not engage in fraudulent activities or misuse the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Safety and Liability</h2>
              <h3 className="text-xl font-semibold mb-3">6.1 Assumption of Risk</h3>
              <p className="mb-4">
                Horse riding is an inherently risky activity. By booking a ride, you acknowledge and accept the risks 
                involved, including but not limited to injury, property damage, or death.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.2 Health Requirements</h3>
              <p className="mb-4">
                You must disclose any medical conditions that may affect your ability to ride safely. 
                Stables reserve the right to refuse service based on safety concerns.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.3 Insurance</h3>
              <p className="mb-4">
                We strongly recommend obtaining travel and activity insurance. PyraRide does not provide insurance coverage.
              </p>

              <h3 className="text-xl font-semibold mb-3">6.4 Limitation of Liability</h3>
              <p className="mb-4">
                PyraRide acts as a booking platform connecting riders with stables. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Injuries or accidents during rides</li>
                <li>Quality of service provided by stables</li>
                <li>Loss or damage to personal property</li>
                <li>Disputes between riders and stable owners</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Reviews and Content</h2>
              <p className="mb-4">
                Users may submit reviews and content. By doing so, you grant PyraRide a non-exclusive, royalty-free license 
                to use, display, and distribute your content. We reserve the right to remove content that violates our policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="mb-4">
                All content on the PyraRide platform, including text, graphics, logos, and software, is owned by or 
                licensed to PyraRide and is protected by copyright and trademark laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, 
                fraudulent activity, or any other reason at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We may modify these Terms at any time. Continued use of the platform after changes constitutes 
                acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p className="mb-4">
                These Terms are governed by the laws of Egypt. Any disputes shall be resolved in the courts of Cairo, Egypt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></li>
                <li><strong>Address:</strong> [Your Business Address - To be provided by stable owner]</li>
                <li><strong>Phone:</strong> [Your Contact Number - To be provided by stable owner]</li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
