import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - PyraRide",
  description: "PyraRide Privacy Policy - How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10" />
            <h1 className="font-display text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-white/90">Last Updated: November 1, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose prose-lg max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-4">
              PyraRide ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our website 
              and services.
            </p>
            <p>
              By using PyraRide, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
            <p className="mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Name and contact information (email, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Booking details and preferences</li>
              <li>Reviews and feedback</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location data (with your permission)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processing and managing your bookings</li>
              <li>Communicating with you about your reservations</li>
              <li>Sending booking confirmations and updates</li>
              <li>Improving our services and user experience</li>
              <li>Personalizing content and recommendations</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
              <li>Sending marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-semibold mb-3">We may share your information with:</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Stable Partners:</strong> To facilitate your bookings</li>
              <li><strong>Service Providers:</strong> Payment processors, email services, analytics providers</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
            <p className="font-semibold">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Compliance with PCI DSS standards for payment data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Your Rights (GDPR & CCPA Compliance)</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@pyraride.com" className="text-primary hover:underline">privacy@pyraride.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies Policy</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for website functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
              <li><strong>Marketing Cookies:</strong> Personalize advertising (with consent)</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes 
              outlined in this policy, comply with legal obligations, resolve disputes, and enforce 
              our agreements. Booking records are retained for 7 years for accounting and legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than Egypt. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              this Privacy Policy and applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect 
              personal information from children. If you believe we have collected information from 
              a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant 
              changes via email or through a prominent notice on our website. Your continued use 
              of PyraRide after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              For questions or concerns about this Privacy Policy or our data practices:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-2">PyraRide Data Protection Officer</p>
              <p>Email: <a href="mailto:privacy@pyraride.com" className="text-primary hover:underline">privacy@pyraride.com</a></p>
              <p>Address: Giza, Egypt</p>
              <p>Response Time: Within 48 hours</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="font-semibold mb-2">Your Privacy Matters</p>
            <p className="text-sm">
              We are committed to transparency and protecting your rights. If you have any concerns 
              about how we handle your data, please don't hesitate to reach out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
