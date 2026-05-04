"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { X, ImagePlus } from "lucide-react";
import { Stars } from "./Stars";
import { toast } from "sonner";
import { easeLuxury } from "@/components/shared/Motion";

const MAX_IMAGES = 4;
const MAX_BYTES = 5 * 1024 * 1024;

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
  const [images, setImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRating(0); setTitle(""); setBody(""); setAuthor("");
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`Up to ${MAX_IMAGES} photographs.`);
      e.target.value = "";
      return;
    }
    const accepted: typeof images = [];
    for (const f of files.slice(0, room)) {
      if (!f.type?.startsWith("image/")) {
        toast.error(`${f.name} is not an image.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is over 5 MB.`);
        continue;
      }
      accepted.push({ id: `${Date.now()}-${f.name}`, url: URL.createObjectURL(f), name: f.name });
    }
    if (accepted.length) setImages((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("Please bestow a rating.");
    toast.success(images.length ? `Letter received with ${images.length} photograph${images.length > 1 ? "s" : ""}.` : "Letter received. Thank you.");
    reset();
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

              <Field label={`Photographs · optional · up to ${MAX_IMAGES}`}>
                <div className="grid grid-cols-4 gap-3">
                  {(images || []).map((img) => (
                    <div key={img.id} className="relative aspect-square border hairline overflow-hidden bg-surface group">
                      <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 size-6 inline-flex items-center justify-center bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${img.name}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="aspect-square border hairline border-dashed flex flex-col items-center justify-center gap-1 text-ink-muted hover:text-foreground hover:border-foreground transition-colors"
                    >
                      <ImagePlus className="size-5" />
                      <span className="text-[9px] tracking-luxury uppercase">Add</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPick}
                  className="hidden"
                />
                <p className="mt-2 text-[10px] tracking-luxury uppercase text-ink-muted">JPG / PNG · 5 MB each</p>
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
