import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { AlertTriangle, Scale, Shield, Users, CreditCard, Database, Cloud, Gavel } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | PyraRide",
  description: "PyraRide Terms and Conditions - Legally binding agreement pursuant to Egyptian Electronic Signature Law No. 15 of 2004.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/90 via-black/95 to-black">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />

        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-white/60">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
          <div className="prose prose-invert max-w-none">

            {/* Legal Notice Alert */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-amber-400 font-semibold mb-1">IMPORTANT LEGAL NOTICE</h3>
                  <p className="text-amber-200/80 text-sm">
                    These Terms constitute a legally binding electronic agreement (Clickwrap Agreement) pursuant to the provisions of the Egyptian Electronic Signature Law No. 15 of 2004. By clicking the "I Agree" button, creating an account, or booking a ride, you acknowledge your electronic signature on this document and your acceptance to be bound by it.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">1. Who We Are and The Nature of Our Services</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">1.1. Our Role (Commercial Intermediary)</h3>
              <p className="text-white/70 mb-4">
                The "PyraRide" platform is a technology platform and commercial marketplace connecting Riders (passengers) with independent horse stables ("Stable Partners") in Egypt. We operate exclusively as a commercial intermediary.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">1.2. We Are Not a Stable</h3>
              <p className="text-white/70 mb-4">
                PyraRide does not own, manage, or control horses, stables, or facilities. Horse riding services are provided entirely by the "Stable Partners." When you book a ride via the platform, the service contract is formed directly between you and the Stable Partner.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">1.3. Disclaimer</h3>
              <p className="text-white/70">
                While PyraRide carefully vets Stable Partners, we do not guarantee your personal safety. Horse riding is an activity involving live animals with unpredictable behavior. PyraRide assumes no liability for any errors, negligence, violations, or defaults committed by any Stable Partners.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">2. Eligibility and Legal Capacity</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">2.1. Account Holder Eligibility ("The Booker")</h3>
              <p className="text-white/70 mb-4">
                To create an account and make payments, you must possess the legal capacity to conclude contracts:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li><strong className="text-white">Age of Majority:</strong> You acknowledge your awareness that the full age of majority in Egypt is 21 Gregorian years (pursuant to Article 44 of the Civil Code).</li>
                <li><strong className="text-white">Users (18-21 Years):</strong> If you are between 18 and 21 years of age, you represent that you possess sufficient discernment to enter into this agreement and that you have obtained permission from your natural or legal guardian to use your funds for this activity.</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2">2.2. Rider Eligibility ("The Riders")</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li><strong className="text-white">Minimum Age:</strong> The Rider must be at least 6 years old.</li>
                <li><strong className="text-white">Minors (Under 18):</strong> Children between 6 and 12 years old must be accompanied by a parent or legal guardian while inside the stable.</li>
                <li><strong className="text-white">Guardian Responsibility:</strong> If you book on behalf of a minor, you represent that you are their natural or legal guardian, you assume full legal responsibility for their safety, and you explicitly consent to the processing of their personal data in accordance with the Personal Data Protection Law No. 151 of 2020.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">3. Assumption of Risk and Limitation of Liability</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">3.1. "Ride at Your Own Risk"</h3>
              <p className="text-white/70 mb-4">
                You acknowledge and agree that horse riding is an activity that inherently involves risks, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li>Unpredictable animal behavior (biting, kicking, bolting/bucking)</li>
                <li>Falls, collisions, or equipment failure</li>
                <li>Environmental hazards (sand, rocks, heat)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2">3.2. Limitation of Liability (Article 217 of the Civil Code)</h3>
              <p className="text-white/70 mb-4">
                To the maximum extent permitted by Egyptian law:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li>PyraRide assumes no liability for direct or indirect damages resulting from the use of the service.</li>
                <li><strong className="text-white">Specific Waiver:</strong> You hereby waive your right to sue PyraRide for injuries resulting from ordinary negligence, lack of riding skill ("Rider Error"), or failure to follow stable instructions.</li>
                <li><strong className="text-white">Exceptions:</strong> Pursuant to Article 217 of the Egyptian Civil Code, this exemption from liability shall not apply in cases of damages resulting from fraud or gross negligence on the part of PyraRide.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">4. Code of Conduct: Alcohol and Drugs</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">4.1. Zero Tolerance Policy</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li>You undertake not to attend any ride while under the influence of alcohol or drugs.</li>
                <li><strong className="text-white">Right of Refusal:</strong> The Stable Partner reserves the absolute right to cancel your ride without refund if they suspect you are under the influence of intoxicants.</li>
                <li><strong className="text-white">Reporting to Authorities:</strong> PyraRide reserves the right to report any user endangering themselves or others to the Egyptian Police.</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2">4.2. Accuracy of Information</h3>
              <p className="text-white/70">
                You must truthfully state your riding experience level (Beginner, Intermediate, Expert). Providing incorrect information constitutes a material breach of these Terms and absolves the Stable from liability for accidents resulting from a lack of skill.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">5. Booking, Payment, and Cancellation Policy</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">5.1. Booking Confirmation ("The Deposit")</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li><strong className="text-white">Individual Booking:</strong> Confirmed immediately upon successful electronic payment.</li>
                <li><strong className="text-white">Group Booking ("Smart Link"):</strong> A group booking is not confirmed until the last member of the group completes payment. If the booking window closes or spots run out before the last member pays, amounts paid by previous members will be automatically refunded.</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2">5.2. Cancellation Policy (Consumer Protection Compliance)</h3>
              <p className="text-white/70 mb-4">
                You acknowledge that horse riding bookings fall under "Recreational activities valid for a specific date," which are exempt from the 14-day right of return pursuant to the Executive Regulations of the Consumer Protection Law. Cancellations are subject to the following tiers:
              </p>

              <div className="rounded-lg border border-white/10 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-3 text-white font-semibold">Tier</th>
                      <th className="text-left px-4 py-3 text-white font-semibold">Time Before Ride</th>
                      <th className="text-left px-4 py-3 text-white font-semibold">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/70">
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-3 text-green-400 font-medium">Tier 1 (Safe)</td>
                      <td className="px-4 py-3">More than 48 hours</td>
                      <td className="px-4 py-3">100% Cash Refund</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-3 text-amber-400 font-medium">Tier 2 (Medium)</td>
                      <td className="px-4 py-3">24-48 hours</td>
                      <td className="px-4 py-3">50% Cash or 60% Wallet Credit</td>
                    </tr>
                    <tr className="border-t border-white/10">
                      <td className="px-4 py-3 text-red-400 font-medium">Tier 3 (Late)</td>
                      <td className="px-4 py-3">Less than 24 hours</td>
                      <td className="px-4 py-3">No refund + Wallet goodwill credit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">5.3. "Golden Chance" Feature</h3>
              <p className="text-white/70 mb-4">
                In the event of a Late Cancellation (Tier 3), your spot is re-listed for booking. If another user books it:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li>PyraRide retains its commission from the new booking.</li>
                <li>The Stable's share from the new booking is added to your Wallet as "Extra Credit" (potentially compensating you up to 100%).</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2">5.4. Cash Payment ("Earned Privilege")</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li><strong className="text-white">New Users:</strong> Must pay electronically for the first time.</li>
                <li><strong className="text-white">Trusted Riders:</strong> The "Pay on Arrival" (Cash) option is activated after completing one successful ride.</li>
                <li><strong className="text-white">No-Show Penalty:</strong> If you book via "Cash" and fail to show up, the cash payment privilege will be permanently revoked from your account. Creating multiple accounts to circumvent this clause is prohibited.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">6. Data Protection and Privacy</h2>
              </div>

              <p className="text-white/70 mb-4">
                By using PyraRide, you agree to the collection and processing of your personal data in accordance with the Personal Data Protection Law No. 151 of 2020.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-white/70">
                <li><strong className="text-white">Marketing:</strong> You have the right to explicitly agree to or refuse the receipt of marketing communications.</li>
                <li><strong className="text-white">Children:</strong> We process the data of minors only with the explicit consent of the guardian (as outlined in Clause 2.2).</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">7. Force Majeure</h2>
              </div>

              <p className="text-white/70">
                Neither PyraRide nor the Stable Partners shall be liable for cancellations resulting from circumstances beyond their control, including but not limited to: Sandstorms, extreme heat waves (Meteorological warnings), civil unrest, or epidemics. In such cases, the ride will be rescheduled or the value credited to the Wallet (no cash refunds for Force Majeure unless approved by the Stable).
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Gavel className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-bold text-white m-0">8. Governing Law and Jurisdiction</h2>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">8.1. Prevailing Language</h3>
              <p className="text-white/70 mb-4">
                This Agreement is drafted in both Arabic and English. Pursuant to Article 5 of the Consumer Protection Law No. 181 of 2018, in the event of any discrepancy between the two texts, the Arabic text shall prevail and shall be the version relied upon before Egyptian Courts.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">8.2. Jurisdiction</h3>
              <p className="text-white/70 mb-4">
                These Terms are governed by the laws of the Arab Republic of Egypt.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Consumer Disputes:</strong> The Economic Courts of Cairo shall have jurisdiction over any dispute arising with consumer users.</li>
                <li><strong className="text-white">Business Disputes:</strong> Commercial disputes shall be settled via arbitration in accordance with the rules of the Cairo Regional Centre for International Commercial Arbitration (CRCICA).</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="mt-10 pt-6 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
              <p className="text-white/70 mb-4">
                For questions about these Terms, please contact us:
              </p>
              <ul className="list-none space-y-2 text-white/70">
                <li><strong className="text-white">Email:</strong> <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></li>
                <li><strong className="text-white">Website:</strong> <a href="https://www.pyrarides.com" className="text-primary hover:underline">www.pyrarides.com</a></li>
              </ul>
            </section>

          </div>
        </Card>
      </div>
    </div>
  );
}
