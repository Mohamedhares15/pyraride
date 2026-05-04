import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle } from "@/components/shared/DashShell";
import { STABLES } from "@/lib/mock-data/seed";

const StableManage = () => {
  const stable = STABLES[0];
  const [name, setName] = useState(stable.name);
  const [description, setDescription] = useState(stable.description);
  const [address, setAddress] = useState(stable.address);
  const [banner, setBanner] = useState(stable.announcementBanner ?? "");
  const [leadTime, setLeadTime] = useState(stable.minLeadTimeHours);
  const [images, setImages] = useState<string[]>(stable.galleryUrls ?? [stable.imageUrl]);

  const removeImage = (i: number) => setImages((p) => p.filter((_, idx) => idx !== i));
  const addImage = () => toast("Connect Lovable Cloud to enable image uploads.");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Stable details saved.");
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="text-[10px] tracking-luxury uppercase text-ink-muted">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );

  const inp = "w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors";

  return (
    <>
      <SubNav kind="stable" />
      <DashShell eyebrow="Stable Owner" title="Stable details" subtitle="The information riders see when they find you on the plateau.">
        <form onSubmit={submit} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <SectionTitle title="Gallery" hint={`${images.length} images`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative group aspect-[4/3] overflow-hidden border hairline">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Remove"
                      className="absolute top-2 right-2 size-7 inline-flex items-center justify-center bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="aspect-[4/3] border hairline border-dashed flex flex-col items-center justify-center gap-2 text-ink-muted hover:bg-surface-elevated hover:text-foreground hover:border-foreground transition-colors"
                >
                  <Plus className="size-5" />
                  <span className="text-[10px] tracking-luxury uppercase">Add image</span>
                </button>
              </div>
            </div>

            <SectionTitle title="Public profile" />
            <Field label="Stable name"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /></Field>
            <Field label="Description">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inp} resize-none leading-relaxed`} />
            </Field>
            <Field label="Address"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inp} /></Field>
            <Field label="Announcement banner (optional)"><input value={banner} onChange={(e) => setBanner(e.target.value)} className={inp} placeholder="e.g. Sunrise rides depart at 5:45am" /></Field>

            <SectionTitle title="Booking rules" />
            <Field label="Minimum lead time (hours)">
              <input type="number" value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className={inp} />
            </Field>

            <button type="submit" className="px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase">Save changes</button>
          </div>

          <aside className="space-y-6">
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Status</p>
              <p className="mt-2 font-display text-2xl capitalize">{stable.status.replace("_", " ")}</p>
            </div>
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Commission rate</p>
              <p className="mt-2 font-display text-2xl tabular-nums">{(stable.commissionRate * 100).toFixed(0)}%</p>
              <p className="mt-1 text-[11px] text-ink-muted">Set by admin</p>
            </div>
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Cover image</p>
              <img src={stable.imageUrl} alt="" className="mt-3 aspect-[4/3] w-full object-cover" />
              <button type="button" onClick={() => toast("Connect Lovable Cloud to enable uploads.")} className="mt-3 w-full px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">Replace</button>
            </div>
          </aside>
        </form>
      </DashShell>
    </>
  );
};

export default StableManage;
