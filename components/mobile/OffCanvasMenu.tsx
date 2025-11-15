"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, LayoutDashboard, Image as ImageIcon, User, Settings, HelpCircle, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import AuthModal from "@/components/shared/AuthModal";

interface OffCanvasMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OffCanvasMenu({ isOpen, onClose }: OffCanvasMenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Auto-close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  const displayName = session?.user?.name || session?.user?.email || "Profile";

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    onClose();
  };

  const primaryNavItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      requireAuth: false,
    },
    {
      href: "/stables",
      label: "Browse Stables",
      icon: LayoutDashboard,
      requireAuth: false,
    },
    {
      href: "/gallery",
      label: "Gallery",
      icon: ImageIcon,
      requireAuth: false,
    },
    {
      href: session ? "/profile" : "/dashboard",
      label: session ? "Profile" : "Dashboard",
      icon: User,
      requireAuth: false,
      showAvatar: true,
    },
  ];

  const secondaryNavItems = [
    {
      href: "/faq",
      label: "Help & FAQ",
      icon: HelpCircle,
    },
    {
      href: "/contact",
      label: "Contact Support",
      icon: Mail,
    },
    {
      href: "/profile",
      label: "Account Settings",
      icon: Settings,
      requireAuth: true,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-off-canvas-menu-backdrop fixed inset-0 z-[90] bg-black/50"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Off-Canvas Menu */}
          <motion.nav
            id="mobile-nav"
            className="mobile-off-canvas-menu fixed top-0 right-0 z-[100] h-full w-[80%] max-w-[320px] bg-white shadow-[-5px_0_15px_rgba(0,0,0,0.5)] md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
                aria-expanded="true"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto h-[calc(100vh-80px)] pb-4">
              {/* User Profile Section (if logged in) */}
              {session && (
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    {userImage && !imageError ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary">
                        <Image
                          src={userImage}
                          alt="Profile"
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                          onError={() => setImageError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary text-lg font-bold">
                        {initials()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Navigation */}
              <ul className="list-none p-0 m-0">
                {primaryNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const showProfileAvatar = item.showAvatar && session;

                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-4 text-gray-900 no-underline transition-colors hover:bg-gray-50 ${
                          active ? "bg-primary/5 border-l-4 border-l-primary" : ""
                        }`}
                      >
                        {showProfileAvatar && userImage && !imageError ? (
                          <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary">
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
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary text-xs font-bold">
                            {initials()}
                          </div>
                        ) : (
                          <Icon className={`h-6 w-6 flex-shrink-0 ${active ? "text-primary" : "text-gray-600"}`} />
                        )}
                        <span className={`font-medium ${active ? "text-primary" : "text-gray-900"}`}>
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Secondary Navigation */}
              <ul className="list-none p-0 m-0">
                {secondaryNavItems.map((item, index) => {
                  const Icon = item.icon;
                  if (item.requireAuth && !session) return null;

                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (primaryNavItems.length + index) * 0.05 }}
                      className="border-b border-gray-100"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-4 text-gray-700 no-underline transition-colors hover:bg-gray-50"
                      >
                        <Icon className="h-6 w-6 flex-shrink-0 text-gray-600" />
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Sign In / Sign Out Section */}
              <div className="px-4 pt-4">
                {session ? (
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full gap-2 h-12 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        onClose();
                      }}
                      className="w-full mb-2 h-12"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        onClose();
                      }}
                      className="w-full h-12"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.nav>

          {/* Auth Modal */}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
}

