"use client";

import { useState } from "react";
import { Mail, CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface NewsletterSignupProps {
  variant?: "hero" | "footer" | "inline";
  showBenefits?: boolean;
}

export default function NewsletterSignup({ 
  variant = "inline", 
  showBenefits = true 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Success! Check your email for a welcome offer.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const benefits = [
    { icon: Gift, text: "Exclusive discounts & early access" },
    { icon: Mail, text: "Weekly riding tips & destination guides" },
    { icon: CheckCircle, text: "No spam, unsubscribe anytime" },
  ];

  if (variant === "hero") {
    return (
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join 10,000+ Adventure Seekers
            </h2>
            <p className="text-white/90 text-lg">
              Get exclusive discounts, riding tips, and early access to new experiences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-14 text-lg bg-white text-black"
              disabled={status === "loading" || status === "success"}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-semibold text-lg"
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? "Subscribing..." : status === "success" ? "✓ Subscribed!" : "Get 10% Off"}
            </Button>
          </form>

          {status === "success" && (
            <p className="text-center mt-4 text-white/90 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="text-center mt-4 text-red-200">{message}</p>
          )}

          {showBenefits && (
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 text-white/80">
                    <Icon className="h-4 w-4" />
                    <span>{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center mt-6 text-white/60 text-xs">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={showBenefits ? "space-y-4" : ""}>
        <div>
          <h3 className="font-semibold text-lg mb-2">Subscribe to Our Newsletter</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get 10% off your first booking + exclusive deals
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            disabled={status === "loading" || status === "success"}
          />
          <Button
            type="submit"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "..." : status === "success" ? "✓" : "Subscribe"}
          </Button>
        </form>

        {status === "success" && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">{message}</p>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <Card className="border-2 border-primary">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Never Miss a Deal</h3>
          <p className="text-muted-foreground">
            Join our community and get 10% off your first booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "Subscribing..." : status === "success" ? "✓ Subscribed!" : "Get My 10% Discount"}
          </Button>
        </form>

        {status === "success" && (
          <p className="text-sm text-green-600 text-center mt-4 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 text-center mt-4">{message}</p>
        )}

        {showBenefits && (
          <div className="mt-6 pt-6 border-t space-y-2">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{benefit.text}</span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Unsubscribe anytime. We respect your privacy.
        </p>
      </CardContent>
    </Card>
  );
}

