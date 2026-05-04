import { useState } from "react";
import { toast } from "sonner";
import { SubNav } from "@/components/shared/SubNav";
import { DashShell, SectionTitle, StatGrid } from "@/components/shared/DashShell";
import { useAuth } from "@/hooks/use-auth";
import { fmtMoney } from "@/lib/format";

const DriverAccount = () => {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [vehicle, setVehicle] = useState("Toyota Hiace · ABC-1234");
  const [available, setAvailable] = useState(true);

  const inp = "w-full bg-transparent border-b hairline pb-3 text-lg font-display placeholder:text-ink-muted/60 focus:outline-none focus:border-foreground transition-colors";

  return (
    <>
      <SubNav kind="driver" />
      <DashShell eyebrow="Driver" title="Account" subtitle="Your details, your vehicle, your earnings.">
        <StatGrid stats={[
          { label: "Today's runs", value: 3, hint: "2 completed · 1 active" },
          { label: "This week", value: fmtMoney(4830), hint: "12 runs" },
          { label: "Available", value: fmtMoney(2450), hint: "Ready for payout" },
          { label: "Rating", value: "4.9 ★", hint: "312 reviews" },
        ]} />
        <div className="mt-12 grid lg:grid-cols-3 gap-10">
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Account saved."); }} className="lg:col-span-2 space-y-8">
            <SectionTitle title="Profile" />
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${inp}`} />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-2 ${inp}`} />
            </label>

            <SectionTitle title="Vehicle" />
            <label className="block">
              <span className="text-[10px] tracking-luxury uppercase text-ink-muted">Make · plate</span>
              <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={`mt-2 ${inp}`} />
            </label>

            <SectionTitle title="Availability" />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="size-4" />
              <span className="text-sm">Currently accepting runs</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="px-8 py-4 bg-foreground text-background text-[12px] tracking-[0.22em] uppercase">Save</button>
              <button type="button" onClick={() => { signOut(); toast.success("Signed out."); }} className="px-8 py-4 border hairline text-[12px] tracking-[0.22em] uppercase hover:bg-destructive hover:text-background hover:border-destructive transition-colors">
                Sign out
              </button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">This week</p>
              <p className="mt-2 font-display text-4xl tabular-nums">{fmtMoney(4830)}</p>
              <p className="mt-1 text-[11px] text-ink-muted">12 runs</p>
            </div>
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Available for payout</p>
              <p className="mt-2 font-display text-4xl tabular-nums">{fmtMoney(2450)}</p>
              <button className="mt-4 w-full px-4 py-2.5 border hairline text-[11px] tracking-[0.18em] uppercase hover:bg-foreground hover:text-background hover:border-foreground transition-colors">
                Request payout
              </button>
            </div>
            <div className="border hairline p-6">
              <p className="text-[10px] tracking-luxury uppercase text-ink-muted">Lifetime rating</p>
              <p className="mt-2 font-display text-4xl tabular-nums">4.9 ★</p>
              <p className="mt-1 text-[11px] text-ink-muted">312 reviews</p>
            </div>
          </aside>
        </div>
      </DashShell>
    </>
  );
};

export default DriverAccount;
