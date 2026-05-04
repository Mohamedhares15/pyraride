"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, X, Search } from "lucide-react";
import { Link } from "@/components/shared/shims";
import { horses as initialHorses, stables, type Horse } from "@/data/mock";
import { Reveal, StaggerGroup, StaggerItem, easeLuxury } from "@/components/shared/Motion";
import { toast } from "sonner";

const empty: Omit<Horse, "id"> = { stableId: "al-nasr", name: "", breed: "Egyptian Arabian", age: 5, temperament: "", image: "", adminTier: "novice", pricePerHour: 120, isActive: true };

const AdminHorses = () => {
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Horse | null>(null);
  const [creating, setCreating] = useState(false);
  const stable = stables[0];

  const visible = horses.filter((h) => h.stableId === stable.id && h.name.toLowerCase().includes(query.toLowerCase()));

  const save = (data: Omit<Horse, "id"> & { id?: string }) => {
    if (data.id) {
      setHorses((hs) => (hs || []).map((h) => (h.id === data.id ? { ...h, ...data } as Horse : h)));
      toast.success("Roster updated.");
    } else {
      setHorses((hs) => [...hs, { ...data, id: `h${Date.now()}`, stableId: stable.id }]);
      toast.success("Horse added to the roster.");
    }
    setEditing(null); setCreating(false);
  };

  const remove = (id: string) => {
    setHorses((hs) => hs.filter((h) => h.id !== id));
    toast.success("Horse retired from roster.");
  };

  return (
    <div className="min-h-screen pt-28">
      <div className="container">
        <Link to="/admin" className="inline-flex items-center gap-2 text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Stable OS
        </Link>
      </div>

      <div className="container border-b hairline pb-6 pt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] tracking-luxury uppercase text-ink-muted mb-2">Horse management</p>
          <h1 className="font-display text-4xl md:text-5xl leading-none">The Roster</h1>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
          <Plus className="size-3.5" /> Add horse
        </button>
      </div>

      <div className="container py-8">
        <div className="relative max-w-md mb-8">
          <Search className="size-3.5 absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full bg-transparent border-b hairline pl-6 pb-3 text-sm focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div className="border hairline">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b hairline bg-surface/40 text-[10px] tracking-luxury uppercase text-ink-muted">
            <div className="col-span-1">№</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Breed</div>
            <div className="col-span-1">Age</div>
            <div className="col-span-3">Temperament</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <StaggerGroup gap={0.04}>
            {(visible || []).map((h, i) => (
              <StaggerItem key={h.id}>
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-5 border-b hairline last:border-b-0 hover:bg-surface/40 transition-colors items-center">
                  <div className="md:col-span-1 text-[11px] tracking-luxury uppercase text-ink-muted">№ {String(i + 1).padStart(2, "0")}</div>
                  <div className="md:col-span-3 font-display text-xl">{h.name}</div>
                  <div className="md:col-span-2 text-sm text-ink-soft">{h.breed}</div>
                  <div className="md:col-span-1 text-sm tabular-nums">{h.age}y</div>
                  <div className="md:col-span-3 text-sm text-ink-soft truncate">{h.temperament}</div>
                  <div className="md:col-span-2 flex md:justify-end gap-2">
                    <button onClick={() => setEditing(h)} className="inline-flex size-9 items-center justify-center border hairline hover:bg-foreground hover:text-background hover:border-foreground transition-all" aria-label="Edit">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => remove(h.id)} className="inline-flex size-9 items-center justify-center border hairline hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all" aria-label="Remove">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
            {visible.length === 0 && (
              <div className="px-6 py-16 text-center text-ink-muted text-sm">No horses match your search.</div>
            )}
          </StaggerGroup>
        </div>
      </div>

      <HorseFormSheet
        open={!!editing || creating}
        onClose={() => { setEditing(null); setCreating(false); }}
        initial={editing ?? { ...empty, id: "" }}
        isEdit={!!editing}
        onSave={save}
      />
    </div>
  );
};

const HorseFormSheet = ({
  open, onClose, initial, isEdit, onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Horse | (Omit<Horse, "id"> & { id: string });
  isEdit: boolean;
  onSave: (data: Omit<Horse, "id"> & { id?: string }) => void;
}) => {
  const [data, setData] = useState(initial);
  // sync when opening with new initial
  useState(() => { setData(initial); });

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]" initial="closed" animate="open" exit="closed">
          <motion.div
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            variants={{ open: { x: 0 }, closed: { x: "100%" } }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l hairline p-8 overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] tracking-luxury uppercase text-ink-muted">{isEdit ? "Edit" : "New"}</p>
                <h2 className="font-display text-3xl mt-1">{isEdit ? data.name : "Add to roster"}</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-1.5"><X className="size-4" /></button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); onSave(isEdit ? data as Horse : { ...data, id: undefined } as any); }}
              className="space-y-6"
            >
              <Field label="Name">
                <input required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full bg-transparent border-b hairline pb-3 text-lg font-display focus:outline-none focus:border-foreground" />
              </Field>
              <Field label="Breed">
                <input value={data.breed} onChange={(e) => setData({ ...data, breed: e.target.value })}
                  className="w-full bg-transparent border-b hairline pb-3 focus:outline-none focus:border-foreground" />
              </Field>
              <Field label="Age (years)">
                <input type="number" min={1} max={40} value={data.age} onChange={(e) => setData({ ...data, age: +e.target.value })}
                  className="w-full bg-transparent border-b hairline pb-3 focus:outline-none focus:border-foreground" />
              </Field>
              <Field label="Temperament">
                <textarea rows={3} value={data.temperament} onChange={(e) => setData({ ...data, temperament: e.target.value })}
                  className="w-full bg-transparent border hairline p-3 text-sm focus:outline-none focus:border-foreground resize-none" />
              </Field>
              <div className="pt-6 border-t hairline flex justify-between items-center">
                <button type="button" onClick={onClose} className="text-[11px] tracking-luxury uppercase text-ink-muted hover:text-foreground">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-foreground text-background text-[11px] tracking-[0.18em] uppercase">
                  {isEdit ? "Save changes" : "Add horse"}
                </button>
              </div>
            </form>
          </motion.aside>
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

export default AdminHorses;
