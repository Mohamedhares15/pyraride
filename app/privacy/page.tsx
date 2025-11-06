import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PyraRide Privacy Policy - How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
        <h1 className="mb-8 font-display text-4xl font-bold">Privacy Policy</h1>
        
        <Card className="p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Create an account and register as a rider or stable owner</li>
                <li>Make a booking or payment</li>
                <li>Contact our customer support</li>
                <li>Sign up for our newsletter</li>
                <li>Leave reviews or interact with our platform</li>
              </ul>
              <p className="mb-4">
                <strong>Personal Information:</strong> Name, email address, phone number, payment information, 
                booking preferences, and any other information you choose to provide.
              </p>
              <p className="mb-4">
                <strong>Automatically Collected Information:</strong> IP address, browser type, device information, 
                usage data, cookies, and analytics data to improve our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Process and manage your bookings</li>
                <li>Communicate with you about your reservations</li>
                <li>Send booking confirmations and updates</li>
                <li>Process payments and prevent fraud</li>
                <li>Improve our platform and user experience</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Stable Owners:</strong> To facilitate your bookings (name, contact details, booking information)</li>
                <li><strong>Service Providers:</strong> Payment processors, email services, analytics providers</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through trusted providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for data processing</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, contact us at: <a href="mailto:privacy@pyraride.com" className="text-primary hover:underline">privacy@pyraride.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience. You can control cookies 
                through your browser settings. Essential cookies are necessary for the platform to function properly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not directed to children under 16. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@pyraride.com" className="text-primary hover:underline">privacy@pyraride.com</a></li>
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
