import { Metadata } from "next";
import { RefreshCw, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy - PyraRide",
  description: "PyraRide Refund Policy - Clear guidelines for cancellations, refunds, and rescheduling.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="h-10 w-10" />
            <h1 className="font-display text-4xl md:text-5xl font-bold">Refund Policy</h1>
          </div>
          <p className="text-lg text-white/90">Last Updated: November 1, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        
        {/* Quick Reference Table */}
        <div className="bg-muted p-6 rounded-lg mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Refund Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-3 px-4 font-semibold">Cancellation Time</th>
                  <th className="py-3 px-4 font-semibold">Refund Amount</th>
                  <th className="py-3 px-4 font-semibold">Processing Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">24+ hours before ride</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">100% Full Refund</td>
                  <td className="py-3 px-4">5-7 business days</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">12-24 hours before ride</td>
                  <td className="py-3 px-4 text-orange-600 font-semibold">50% Partial Refund</td>
                  <td className="py-3 px-4">5-7 business days</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4">Less than 12 hours</td>
                  <td className="py-3 px-4 text-red-600 font-semibold">No Refund</td>
                  <td className="py-3 px-4">N/A</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Weather cancellation</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">100% or Reschedule</td>
                  <td className="py-3 px-4">Immediate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Cancellation Policy</h2>
            
            <h3 className="text-xl font-semibold mb-3">1.1 Standard Cancellations</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  24+ Hours Before Scheduled Ride
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Full 100% refund to original payment method</li>
                  <li>No cancellation fees</li>
                  <li>Processed within 5-7 business days</li>
                  <li>Free rescheduling option available</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  12-24 Hours Before Scheduled Ride
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>50% refund to original payment method</li>
                  <li>50% retained to cover stable preparation costs</li>
                  <li>Processed within 5-7 business days</li>
                  <li>One-time free rescheduling allowed</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  Less Than 12 Hours Before Ride
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>No refund available</li>
                  <li>Full payment retained</li>
                  <li>Rescheduling subject to availability and fees</li>
                  <li>Valid only for exceptional circumstances</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 No-Show Policy</h3>
            <p>
              If you fail to arrive within 15 minutes of your scheduled time without prior notification, 
              your booking will be marked as a no-show and <strong>no refund will be issued</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Weather & Safety Cancellations</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Stable-Initiated Cancellations
              </p>
              <p className="mb-4">
                If a stable cancels due to unsafe weather, horse health issues, or other safety concerns:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>100% Full Refund</strong> processed immediately</li>
                <li><strong>OR</strong> Free rescheduling to any available date/time</li>
                <li>No penalties or fees</li>
                <li>Notification via email and SMS</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mb-3">Weather Conditions Covered:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Heavy rain or thunderstorms</li>
              <li>Extreme heat (above 40°C/104°F)</li>
              <li>High winds (above 40 km/h)</li>
              <li>Sandstorms or poor visibility</li>
              <li>Any conditions deemed unsafe by stable management</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Rescheduling Options</h2>
            
            <h3 className="text-xl font-semibold mb-3">Free Rescheduling:</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Available if canceled 24+ hours in advance</li>
              <li>Must reschedule within 90 days of original booking</li>
              <li>Subject to stable availability</li>
              <li>No additional fees</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Paid Rescheduling:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Available if canceled 12-24 hours in advance</li>
              <li>One-time rescheduling fee: $10 USD</li>
              <li>Must reschedule within 60 days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Refund Processing</h2>
            
            <h3 className="text-xl font-semibold mb-3">Timeline:</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Cancellation request processed within 24 hours</li>
              <li>Refund initiated within 2 business days</li>
              <li>Bank/card processing: 5-7 business days</li>
              <li>Total timeline: Up to 10 business days</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Refund Methods:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Original payment method (credit/debit card)</li>
              <li>Same card/account used for booking</li>
              <li>Email confirmation sent when refund is processed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Special Circumstances</h2>
            
            <h3 className="text-xl font-semibold mb-3">Medical Emergencies:</h3>
            <p className="mb-4">
              In case of documented medical emergencies (hospitalization, serious illness, injury):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Full refund or free rescheduling available</li>
              <li>Medical documentation required</li>
              <li>Contact support@pyraride.com within 48 hours</li>
              <li>Case-by-case evaluation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Travel Disruptions:</h3>
            <p className="mb-4">
              For flight cancellations, visa issues, or major travel disruptions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Documentation required (flight confirmation, visa rejection, etc.)</li>
              <li>May be eligible for full refund or free rescheduling</li>
              <li>Subject to management approval</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Force Majeure:</h3>
            <p>
              In case of natural disasters, pandemics, government restrictions, or other force majeure 
              events, full refunds will be provided at PyraRide's discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Non-Refundable Items</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Additional services purchased separately (photos, videos, equipment rental)</li>
              <li>Booking fees (if applicable)</li>
              <li>Third-party travel insurance premiums</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Partial Cancellations (Group Bookings)</h2>
            <p className="mb-4">
              If you booked for multiple riders and wish to reduce the number:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Same cancellation timeframes apply</li>
              <li>Refund calculated per rider</li>
              <li>Minimum booking requirements may apply</li>
              <li>Contact support for assistance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. How to Request a Refund</h2>
            
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-4">Step-by-Step Process:</p>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Log in to your PyraRide account</strong>
                  <p className="text-sm mt-1">Go to "My Bookings" in your dashboard</p>
                </li>
                <li>
                  <strong>Select the booking to cancel</strong>
                  <p className="text-sm mt-1">Click "Cancel Booking" button</p>
                </li>
                <li>
                  <strong>Choose refund or reschedule</strong>
                  <p className="text-sm mt-1">Select your preferred option</p>
                </li>
                <li>
                  <strong>Provide cancellation reason (optional)</strong>
                  <p className="text-sm mt-1">Helps us improve our service</p>
                </li>
                <li>
                  <strong>Confirm cancellation</strong>
                  <p className="text-sm mt-1">Review refund amount and confirm</p>
                </li>
                <li>
                  <strong>Receive confirmation email</strong>
                  <p className="text-sm mt-1">Refund tracking details included</p>
                </li>
              </ol>
            </div>

            <p className="mt-6">
              <strong>Need help?</strong> Contact our support team:
            </p>
            <ul className="list-none space-y-2 mt-2">
              <li>📧 Email: <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></li>
              <li>📱 Phone: +20 123 456 7890</li>
              <li>⏰ Available: 9 AM - 6 PM EET, 7 days a week</li>
              <li>⚡ Response Time: Within 4 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Disputes & Appeals</h2>
            <p className="mb-4">
              If you believe your cancellation was handled incorrectly:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact support@pyraride.com within 7 days</li>
              <li>Provide booking reference and explanation</li>
              <li>Our team will review within 2 business days</li>
              <li>Final decisions communicated via email</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Travel Insurance Recommendation</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="font-semibold mb-2">💡 Pro Tip: Purchase Travel Insurance</p>
              <p className="mb-3">
                We strongly recommend purchasing travel insurance that covers:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Trip cancellations and interruptions</li>
                <li>Medical emergencies</li>
                <li>Travel delays</li>
                <li>Activity-specific coverage (horse riding)</li>
              </ul>
              <p className="mt-3 text-sm">
                Note: PyraRide does not provide or sell travel insurance.
              </p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="font-semibold mb-2">Fair & Transparent</p>
            <p className="text-sm">
              Our refund policy is designed to be fair to both riders and stables. We understand 
              that plans change, and we strive to provide flexibility while respecting the time and 
              resources of our stable partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

