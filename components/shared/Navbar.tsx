"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import AuthModal from "./AuthModal";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, status } = useSession();

  const [userImage, setUserImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const displayName = useMemo(() => {
    const user = session?.user as any;
    return user?.name || user?.email || "Profile";
  }, [session?.user]);

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

  const initials = useMemo(() => {
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
  }, [session?.user]);

  return (
    <>
      <motion.nav
        className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/5 backdrop-blur-md top-nav"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 md:px-8 md:py-4">
          {/* Logo - White for visibility on image */}
          <Link href="/" className="text-white font-bold text-lg md:text-xl drop-shadow-lg">
            PyraRide
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-2 lg:space-x-4 md:flex">
            <Link
              href="/stables"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              Stables
            </Link>
            <Link
              href="/gallery"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              Gallery
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
              >
                Dashboard
              </Link>
            )}

            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-white/20" />
            ) : session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/40 bg-white/20">
                    {userImage && !imageError ? (
                      <Image
                        src={userImage}
                        alt={displayName}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase">
                        {initials}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium drop-shadow-md">
                    {displayName}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-nile-blue text-white hover:bg-nile-blue/90"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="border-t border-white/20 bg-black/80 px-4 py-4 backdrop-blur-md md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/stables"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                Browse Stables
              </Link>
              <Link
                href="/gallery"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                Gallery
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white transition-colors hover:text-white/70"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {session && (
                <Link
                  href="/profile"
                  className="text-sm font-medium text-white transition-colors hover:text-white/70"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
              )}
              {status === "loading" ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-white/20" />
              ) : session ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      {userImage && !imageError ? (
                        <Image
                          src={userImage}
                          alt={displayName}
                          fill
                          sizes="32px"
                          className="object-cover"
                          unoptimized
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-white/80">View profile</span>
                  </div>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="bg-nile-blue text-white hover:bg-nile-blue/90"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
