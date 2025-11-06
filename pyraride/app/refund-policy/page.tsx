import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "PyraRide Refund and Cancellation Policy - Clear guidelines for booking cancellations and refunds.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Breadcrumbs items={[{ label: "Refund Policy" }]} />
        <h1 className="mb-8 font-display text-4xl font-bold">Refund & Cancellation Policy</h1>
        
        <Card className="p-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-muted-foreground mb-6">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <p className="mb-6 text-lg">
              We understand that plans change. This policy outlines our cancellation and refund procedures 
              to ensure fairness for both riders and stable owners.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">Cancellation Timeline & Refunds</h2>
              
              <div className="grid gap-4 mb-6">
                <div className="flex gap-4 items-start p-4 rounded-lg border border-green-200 bg-green-50">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">48+ Hours Before Ride</h3>
                    <p className="mb-2"><strong className="text-green-700">100% Refund</strong></p>
                    <p className="text-sm text-muted-foreground">
                      Cancel anytime more than 48 hours before your scheduled ride time for a full refund. 
                      Refunds processed within 5-7 business days.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">24-48 Hours Before Ride</h3>
                    <p className="mb-2"><strong className="text-yellow-700">50% Refund</strong></p>
                    <p className="text-sm text-muted-foreground">
                      Cancellations made 24-48 hours in advance receive a 50% refund. This helps stables 
                      cover costs and potential lost bookings.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 rounded-lg border border-red-200 bg-red-50">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Less than 24 Hours or No-Show</h3>
                    <p className="mb-2"><strong className="text-red-700">No Refund</strong></p>
                    <p className="text-sm text-muted-foreground">
                      Late cancellations (less than 24 hours) and no-shows are non-refundable as stables 
                      cannot fill the slot on short notice.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How to Cancel Your Booking</h2>
              <ol className="list-decimal pl-6 mb-4 space-y-3">
                <li>
                  <strong>Sign in to your account</strong>
                  <p className="text-sm text-muted-foreground mt-1">Go to your Rider Dashboard</p>
                </li>
                <li>
                  <strong>Find your booking</strong>
                  <p className="text-sm text-muted-foreground mt-1">Navigate to "My Bookings"</p>
                </li>
                <li>
                  <strong>Click "Cancel Booking"</strong>
                  <p className="text-sm text-muted-foreground mt-1">Confirm the cancellation when prompted</p>
                </li>
                <li>
                  <strong>Receive confirmation</strong>
                  <p className="text-sm text-muted-foreground mt-1">You'll receive an email confirming the cancellation and refund details</p>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Stable-Initiated Cancellations</h2>
              <p className="mb-4">
                If a stable cancels your confirmed booking for any reason, you are entitled to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Full 100% refund</strong> - processed within 5-7 business days</li>
                <li>Option to reschedule with the same stable at no additional cost</li>
                <li>Priority booking assistance from our support team</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Weather-Related Cancellations</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="mb-2">
                      In case of severe weather conditions (heavy rain, storms, extreme heat), stables may cancel rides for safety reasons.
                    </p>
                    <p className="font-semibold">You have two options:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Full refund (100%)</li>
                      <li>Free rescheduling to another available date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Modification Policy</h2>
              <p className="mb-4">
                Want to change your booking instead of cancelling? Here's how:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Date/Time Changes:</strong> Free if made 48+ hours in advance (subject to availability)</li>
                <li><strong>Horse Changes:</strong> Free if made 24+ hours in advance</li>
                <li><strong>Number of Riders:</strong> Additional riders can be added (price difference applies)</li>
                <li><strong>Stable Changes:</strong> Treated as a new booking (original cancellation policy applies)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Refund Processing</h2>
              <p className="mb-4">
                <strong>Timeline:</strong> Approved refunds are processed within 5-7 business days
              </p>
              <p className="mb-4">
                <strong>Method:</strong> Refunds are issued to the original payment method used for booking
              </p>
              <p className="mb-4">
                <strong>Notification:</strong> You'll receive email confirmation once the refund is processed
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Note: Depending on your bank or payment provider, it may take an additional 3-5 business days 
                for the refund to appear in your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Exceptions and Special Cases</h2>
              <h3 className="text-xl font-semibold mb-3">Medical Emergencies</h3>
              <p className="mb-4">
                If you need to cancel due to a medical emergency, please contact our support team immediately. 
                We may request documentation and will work with you on a case-by-case basis for a fair resolution.
              </p>

              <h3 className="text-xl font-semibold mb-3">Travel Disruptions</h3>
              <p className="mb-4">
                Flight cancellations, visa issues, or other travel disruptions may be considered for exceptions. 
                Contact us with supporting documentation.
              </p>

              <h3 className="text-xl font-semibold mb-3">Stable Policy Variations</h3>
              <p className="mb-4">
                Some stables may have more flexible cancellation policies. Always check the specific stable's 
                cancellation terms shown during booking confirmation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Disputes and Resolution</h2>
              <p className="mb-4">
                If you have a dispute regarding a cancellation or refund:
              </p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Contact the stable directly first to try to resolve the issue</li>
                <li>If unresolved, contact PyraRide support at <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></li>
                <li>Provide booking details and explanation of the issue</li>
                <li>Our team will mediate and work towards a fair resolution within 48 hours</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="mb-4">
                Questions about cancellations or refunds? We're here to help:
              </p>
              <ul className="list-none space-y-2">
                <li><strong>Email:</strong> <a href="mailto:support@pyraride.com" className="text-primary hover:underline">support@pyraride.com</a></li>
                <li><strong>Response Time:</strong> Within 24 hours</li>
                <li><strong>Phone:</strong> [Your Contact Number - To be provided]</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This policy is designed to balance the needs of riders and stable owners. 
                By making a booking, you agree to these cancellation and refund terms. We recommend reviewing this 
                policy before each booking.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
