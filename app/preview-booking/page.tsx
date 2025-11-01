"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import DirectionsArrowSVG from '@/components/icons/DirectionsArrowSVG';

export default function PreviewBookingPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply dark background to overlay
    const applyBackground = () => {
      const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement;
      if (overlay) {
        overlay.style.backgroundColor = '#0F1011';
      }
    };
    const timer = setTimeout(applyBackground, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Mock booking data
  const bookingData = {
    bookingId: "BOOK-123456",
    horseName: "Thunder",
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "10:00",
    location: "Pyramids Stable, Giza, Egypt",
    totalPrice: 100,
    riders: 2,
  };

  const gmapsLink = `https://maps.google.com/?daddr=${encodeURIComponent(bookingData.location)}`;
  const bookingDate = new Date(bookingData.date);
  const dayOfMonth = bookingDate.getDate();

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0F1011] flex items-center justify-center p-8">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden"
        >
          {/* Dark card - pixel-perfect to design.png */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-[720px] max-w-full rounded-[28px] overflow-hidden"
            style={{
              background: "#111316",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              padding: "24px 28px 28px",
              color: "#FFFFFF",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Header - pixel perfect */}
            <div className="flex flex-col items-center gap-4">
              {/* Check circle: 64x64, radius 32, bg #1E3B2F, check #8FE3B4 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#1E3B2F" }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: "#8FE3B4" }} />
              </motion.div>
              {/* H1: 32px, Semibold, -1% letter spacing, spacing 16px from icon */}
              <h2 className="font-semibold mb-2" style={{ fontSize: "32px", letterSpacing: "-0.01em", marginTop: "0" }}>
                Booking Confirmed
              </h2>
              {/* Subtitle: 18px, Regular, 120% line-height, color #C9CDD1, spacing 8px from H1 */}
              <p className="font-normal" style={{ fontSize: "18px", lineHeight: "1.2", color: "#C9CDD1", marginTop: "0" }}>
                Your adventure is ready!
              </p>
            </div>

            {/* Details Panel - pixel perfect */}
            <div
              className="mt-6"
              style={{
                padding: "24px",
                borderRadius: "20px",
                background: "#1A1D20",
                boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Date & Time - pixel perfect */}
                <div className="flex items-start" style={{ gap: "12px" }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#262B30",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "currentColor" }}>
                      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <path d="M4 10h16M8 4v4M16 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <text x="12" y="17" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="600">{dayOfMonth}</text>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                      DATE &amp; TIME
                    </p>
                    <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                      {new Date(bookingData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="font-normal" style={{ fontSize: "14px", lineHeight: "1.3", color: "#8D949B" }}>
                      {bookingData.startTime} - {bookingData.endTime}
                    </div>
                  </div>
                </div>

                {/* Horse Information - pixel perfect */}
                <div className="flex items-start" style={{ gap: "12px" }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#262B30",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "currentColor" }}>
                      <path d="M12 7c-2 0-3.5 1-4.5 2.5-1-1-2-1-2.5-0.5-0.5 0.5-1 1-0.5 2s1 1 1.5 0.5c0.5-0.2 1-0.5 1.5-1 0.5 0.5 1 1.5 2 2 1 0.5 2 0.5 2.5 0 0.5 0.5 1 0.5 2 0.5 1 0 1.5-0.2 2-0.5 1 0.5 2 0.5 2.5 0 1-0.5 2-1 2-1.5 0.5 0.5 1 1 1.5 0.5 0.5-0.5 0.5-1.5 0-2-0.5-0.5-1.5 0-2.5 0.5-1-1.5-2.5-2.5-4.5-2.5z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="11" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                      HORSE INFORMATION
                    </p>
                    <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                      {bookingData.horseName}
                    </div>
                    <div className="font-normal" style={{ fontSize: "14px", lineHeight: "1.3", color: "#8D949B" }}>
                      {bookingData.riders} {bookingData.riders === 1 ? 'rider' : 'riders'}
                    </div>
                  </div>
                </div>

                {/* Location - pixel perfect */}
                <div className="flex items-start" style={{ gap: "12px" }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#262B30",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "currentColor" }}>
                      <path d="M12 8c-2.5 0-4.5 1.5-4.5 3.5 0 3 4.5 6 4.5 6s4.5-3 4.5-6c0-2-2-3.5-4.5-3.5zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <circle cx="12" cy="11" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                      LOCATION
                    </p>
                    <div className="font-semibold mb-1" style={{ fontSize: "16px", lineHeight: "1.3", color: "#FFFFFF" }}>
                      {bookingData.location}
                    </div>
                    <a
                      href={gmapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center w-full rounded-2xl transition-all"
                      style={{
                        height: "56px",
                        padding: "0 24px",
                        borderRadius: "16px",
                        background: "linear-gradient(90deg, #0D7F94, #144A78)",
                        color: "#FFFFFF",
                        fontSize: "16px",
                        fontWeight: 600,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                      }}
                    >
                      Get Directions
                      <DirectionsArrowSVG className="w-5 h-5 ml-2" />
                    </a>
                  </div>
                </div>

                {/* Total Amount - pixel perfect, 24px top spacing, divider */}
                <div className="flex items-start pt-6" style={{ gap: "12px", borderTop: "1px solid #2A2F34", marginTop: "24px", paddingTop: "16px" }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#262B30",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "currentColor" }}>
                      <rect x="5" y="7" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="7" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M5 7 Q6 6 7 7 Q8 6 9 7 Q10 6 11 7 Q12 6 13 7 Q14 6 15 7 Q16 6 17 7 Q18 6 19 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="uppercase mb-2" style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em", color: "#8D949B", marginTop: "0" }}>
                      TOTAL AMOUNT
                    </p>
                    <p className="font-bold mb-2" style={{ fontSize: "20px", color: "#FFFFFF", lineHeight: "1.2" }}>
                      ${bookingData.totalPrice.toFixed(2)}
                    </p>
                    <p className="font-normal" style={{ fontSize: "12px", color: "#8D949B", lineHeight: "1.3" }}>
                      Payment will be processed on-site or via your preferred method
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

