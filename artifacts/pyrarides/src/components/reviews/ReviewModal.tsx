import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { Stars } from "./Stars";
import { toast } from "sonner";
import { easeLuxury } from "@/components/shared/Motion";

export const ReviewModal = ({
  open,
  onClose,
  packageName,
}: {
  open: boolean;
  onClose: () => void;
  packageName?: string;
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("Please bestow a rating.");
    toast.success("Letter received. Thank you.");
    setRating(0); setTitle(""); setBody(""); setAuthor("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial="closed" animate="open" exit="closed"
        >
          <motion.div
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.form
            onSubmit={submit}
            variants={{
              open: { opacity: 1, y: 0, scale: 1 },
              closed: { opacity: 0, y: 24, scale: 0.98 },
            }}
            transition={{ duration: 0.55, ease: easeLuxury }}
            className="relative w-full max-w-xl bg-background border hairline shadow-lift p-8 md:p-10 max-h-[90vh] overflow-y-auto"
          >
            <button type="button" onClick={onClose} className="absolute top-5 right-5 p-1.5" aria-label="Close">
              <X className="size-4" />
            </button>

            <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Compose a letter</p>
            <h2 className="font-display text-3xl md:text-4xl mt-2 leading-tight">Share your hour at Giza</h2>
            {packageName && <p className="mt-2 text-sm text-ink-muted">For: {packageName}</p>}

            <div className="mt-8 space-y-6">
              <Field label="Bestowed rating">
                <div className="pt-1"><Stars value={rating} size="lg" interactive onChange={setRating} /></div>
              </Field>
              <Field label="Headline">
                <input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="An hour outside of time"
                  className="w-full bg-transparent border-b hairline pb-3 text-lg font-display focus:outline-none focus:border-foreground transition-colors"
                  required
                />
              </Field>
              <Field label="Your letter">
                <textarea
                  value={body} onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder="Write candidly, as if to a friend who has never been..."
                  className="w-full bg-transparent border hairline p-3 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  required
                />
              </Field>
              <Field label="Signed">
                <input
                  value={author} onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent border-b hairline pb-3 focus:outline-none focus:border-foreground transition-colors"
                  required
                />
              </Field>
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t hairline">
              <button type="button" onClick={onClose} className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
                Discard
              </button>
              <button type="submit" className="inline-flex px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                Seal &amp; send
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

export default ReviewModal;
