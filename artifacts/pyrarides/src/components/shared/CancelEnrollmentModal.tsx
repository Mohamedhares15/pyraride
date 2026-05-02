"use client";

import { AlertCircle, Phone, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import NextImage from "@/shims/next-image";

interface CancelEnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: any | null;
  onConfirm: (enrollmentId: string) => void;
}

export default function CancelEnrollmentModal({
  open,
  onOpenChange,
  enrollment,
  onConfirm,
}: CancelEnrollmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enrollment) return null;

  const handleCancelClick = async () => {
    setIsSubmitting(true);
    await onConfirm(enrollment.id);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in transition-all" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4 md:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="relative bg-[#0a0a0a] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.05)]">
            
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative p-8">
              <button 
                onClick={() => onOpenChange(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>

              <h2 className="text-2xl font-display text-white mb-2">Cancel Enrollment?</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You are about to cancel your enrollment in <strong>{enrollment.program.name}</strong> at <strong>{enrollment.academy.name}</strong>.
                If you cancel now, you will lose your spot and your progress.
              </p>

              {/* Captain Contact Card */}
              {enrollment.academy.captain && (
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">Academy Captain</p>
                    <p className="text-white font-medium">{enrollment.academy.captain.fullName}</p>
                  </div>
                  {enrollment.academy.captain.phoneNumber && (
                    <a 
                      href={`tel:${enrollment.academy.captain.phoneNumber}`}
                      className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
                      title="Call Captain"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-col-reverse md:flex-row gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-semibold uppercase tracking-widest text-white"
                >
                  Keep Enrollment
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-sm font-semibold uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Canceling..." : "Yes, Cancel It"}
                </button>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
