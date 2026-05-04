import { Link, useLocation } from "@/components/shared/shims";
import { type ReactNode } from "react";

const STABLE_NAV = [
  { to: "/dashboard/stable", label: "Overview", end: true },
  { to: "/dashboard/stable/manage", label: "Stable" },
  { to: "/dashboard/stable/horses", label: "Horses" },
  { to: "/dashboard/stable/schedule", label: "Schedule" },
  { to: "/dashboard/stable/os", label: "Stable OS" },
];

const ADMIN_NAV = [
  { to: "/dashboard/admin", label: "Overview", end: true },
  { to: "/dashboard/admin/stables", label: "Stables" },
  { to: "/dashboard/admin/horses", label: "Horses" },
  { to: "/dashboard/admin/horse-changes", label: "Changes" },
  { to: "/dashboard/admin/packages", label: "Packages" },
  { to: "/dashboard/admin/users", label: "Users" },
  { to: "/dashboard/admin/locations", label: "Locations" },
  { to: "/dashboard/admin/transport-zones", label: "Transport" },
  { to: "/dashboard/admin/academies", label: "Academies" },
  { to: "/dashboard/admin/premium", label: "Premium" },
  { to: "/dashboard/admin/instant-booking", label: "Instant" },
  { to: "/dashboard/analytics", label: "Analytics" },
];

const DRIVER_NAV = [
  { to: "/dashboard/driver", label: "Queue", end: true },
  { to: "/dashboard/driver/active", label: "Active" },
  { to: "/dashboard/driver/history", label: "History" },
  { to: "/dashboard/driver/account", label: "Account" },
];

const CX_NAV = [
  { to: "/dashboard/cx-media", label: "Overview", end: true },
  { to: "/dashboard/cx-media/gallery", label: "Gallery" },
  { to: "/dashboard/cx-media/support", label: "Support" },
];

const NAVS = { stable: STABLE_NAV, admin: ADMIN_NAV, driver: DRIVER_NAV, cx: CX_NAV };

export const SubNav = ({ kind, children }: { kind: keyof typeof NAVS; children?: ReactNode }) => {
  const { pathname } = useLocation();
  const items = NAVS[kind];
  return (
    <div className="border-b hairline bg-background sticky top-20 z-30">
      <div className="container">
        <div className="flex items-center gap-1 overflow-x-auto py-3">
          {(items || []).map((item) => {
            const isActive = item.end ? pathname === item.to : pathname?.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors ${
                  isActive ? "bg-foreground text-background" : "text-ink-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {children}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
