"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Image as ImageIcon, LayoutDashboard, User } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function MobileFooter() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userImage, setUserImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fetch profile image separately from API to avoid JWT cookie size limits
  useEffect(() => {
    if (!session?.user?.id) {
      setUserImage(null);
      setImageError(false);
      return;
    }

    const fetchProfileImage = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUserImage(data.user?.profileImageUrl ?? null);
          setImageError(false);
        }
      } catch (error) {
        console.error("Failed to fetch profile image:", error);
        setUserImage(null);
      }
    };

    fetchProfileImage();
  }, [session?.user?.id]);

  const initials = () => {
    const user = session?.user as any;
    if (user?.name) {
      return (user.name as string)
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return (user.email as string).charAt(0).toUpperCase();
    }
    return "P";
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      href: "/",
      label: "HOME",
      icon: Home,
      requireAuth: false,
    },
    {
      href: "/stables",
      label: "BROWSE",
      icon: LayoutDashboard, // Using LayoutDashboard as Browse icon
      requireAuth: false,
    },
    {
      href: "/gallery",
      label: "GALLERY",
      icon: ImageIcon,
      requireAuth: false,
    },
    {
      href: session ? "/profile" : "/dashboard",
      label: session ? "PROFILE" : "DASHBOARD",
      icon: User,
      requireAuth: false, // Always show, but page will handle auth
      showAvatar: true,
    },
  ];

  // Always show all 4 items (HOME, GALLERY, DASHBOARD, PROFILE)
  // Dashboard and Profile pages will handle authentication redirects
  const displayItems = navItems;

  return (
    <footer className="mobile-bottom-nav md:hidden">
      <nav className="flex items-center justify-around">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showProfileAvatar = item.showAvatar && session;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all duration-200 flex-1 min-w-0 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground active:text-primary"
              }`}
            >
              <div className="icon-wrapper flex items-center justify-center">
                {showProfileAvatar && userImage && !imageError ? (
                  <div className={`relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border-2 transition-all ${
                    active ? "border-primary shadow-md" : "border-muted-foreground/30"
                  }`}>
                    <Image
                      src={userImage}
                      alt="Profile"
                      fill
                      sizes="24px"
                      className="object-cover"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : showProfileAvatar && session ? (
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-primary/10 border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {initials()}
                  </div>
                ) : (
                  <Icon
                    className={`h-6 w-6 flex-shrink-0 ${
                      active ? "fill-primary stroke-primary" : "stroke-current"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wide leading-tight text-center ${
                active ? "text-primary font-semibold" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}

