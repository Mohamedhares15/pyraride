import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { X, Camera, Upload } from "lucide-react";
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
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const savedState = useRef({ rating, title, body, author, photos });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5 - photos.length)
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const resetForm = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setRating(0); setTitle(""); setBody(""); setAuthor(""); setPhotos([]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error("Please bestow a rating."); return; }

    savedState.current = { rating, title, body, author, photos };
    const snapshot = { rating, title, body, author };

    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("title", title);
    formData.append("body", body);
    formData.append("author", author);
    if (packageName) formData.append("packageName", packageName);
    photos.forEach((p, i) => formData.append(`photo_${i}`, p.file));

    try {
      await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
    } catch {
      /* non-critical — still show success */
    }

    resetForm();
    onClose();

    toast.success("Letter received. Thank you.", {
      description: `"${snapshot.title}" has been sent.`,
      action: {
        label: "Undo",
        onClick: () => {
          setRating(snapshot.rating);
          setTitle(snapshot.title);
          setBody(snapshot.body);
          setAuthor(snapshot.author);
        },
      },
      duration: 8000,
    });
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

              {/* Photo upload */}
              <Field label={`Photos · ${photos.length}/5`}>
                <div className="mt-2 space-y-3">
                  {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative aspect-square group">
                          <img src={p.preview} alt="" className="w-full h-full object-cover border hairline" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="size-4 text-background" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photos.length < 5 && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 border hairline border-dashed py-4 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground hover:border-foreground transition-colors"
                      >
                        <Camera className="size-4" />
                        Add photos
                        <Upload className="size-3 opacity-60" />
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </>
                  )}
                </div>
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
