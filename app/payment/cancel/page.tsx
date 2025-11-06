"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="p-8 text-center">
            {/* Cancel Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20">
                <XCircle className="h-12 w-12 text-orange-500" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="mb-4 font-display text-4xl font-bold">
              Payment Cancelled
            </h1>

            {/* Message */}
            <p className="mb-8 text-lg text-muted-foreground">
              Your booking was not completed. No charges were made to your
              account. You can try again anytime.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/stables">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Stables
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/dashboard/rider">Go to My Bookings</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

