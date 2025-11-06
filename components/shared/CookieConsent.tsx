"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after 2 seconds to avoid disrupting initial page load
      setTimeout(() => setShowBanner(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="mx-auto max-w-4xl shadow-2xl border-2">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="w-10 h-10 text-primary flex-shrink-0" />
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">We Value Your Privacy</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and provide personalized content. 
                By clicking "Accept", you consent to our use of cookies. You can manage your preferences anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={acceptCookies}
                  className="flex-1 sm:flex-initial"
                >
                  Accept All Cookies
                </Button>
                <Button 
                  onClick={declineCookies}
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                >
                  Decline Non-Essential
                </Button>
                <Link 
                  href="/privacy"
                  className="text-sm text-primary hover:underline self-center"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <button
              onClick={declineCookies}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
