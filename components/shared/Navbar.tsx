"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  const desktopLinks = (
    <>
      <li>
        <Link href="/stables">Stables</Link>
      </li>
      <li>
        <Link href="/gallery">Gallery</Link>
      </li>
      {session && (
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
      )}
    </>
  );

  const desktopAuthSection =
    status === "loading" ? (
      <li>
        <div className="h-8 w-20 animate-pulse rounded-md bg-white/20" />
      </li>
    ) : session ? (
      <>
        <li>
          <Link href="/profile" className="profile-chip">
            <div className="profile-chip__avatar">
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
                <span>{initials}</span>
              )}
            </div>
            <span>{displayName}</span>
          </Link>
        </li>
        <li>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            Sign Out
          </Button>
        </li>
      </>
    ) : (
      <>
        <li>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            Sign In
          </Button>
        </li>
        <li>
          <Button
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-nile-blue text-white hover:bg-nile-blue/90"
          >
            Get Started
          </Button>
        </li>
      </>
    );

  const mobileMenuLinks = (
    <>
      <li>
        <Link href="/stables" onClick={closeMenu}>
          Stables
        </Link>
      </li>
      <li>
        <Link href="/gallery" onClick={closeMenu}>
          Gallery
        </Link>
      </li>
      {session && (
        <li>
          <Link href="/dashboard" onClick={closeMenu}>
            Dashboard
          </Link>
        </li>
      )}
      {status === "loading" ? (
        <li>
          <div className="h-10 w-full animate-pulse rounded-md bg-white/20" />
        </li>
      ) : session ? (
        <>
          <li>
            <Link href="/profile" onClick={closeMenu}>
              Profile
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                signOut();
                closeMenu();
              }}
            >
              Sign Out
            </button>
          </li>
        </>
      ) : (
        <>
          <li>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(true);
                closeMenu();
              }}
            >
              Sign In
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(true);
                closeMenu();
              }}
            >
              Get Started
            </button>
          </li>
        </>
      )}
    </>
  );

  return (
    <>
      <motion.header
        className="main-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="logo">
          PyraRide
        </Link>

        <nav className="desktop-nav">
          <ul>
            {desktopLinks}
            {desktopAuthSection}
          </ul>
        </nav>

        <button
          type="button"
          className="hamburger-menu"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={toggleMenu}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </motion.header>

      <div
        className={`mobile-off-canvas-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav"
        className={`mobile-off-canvas-menu ${isOpen ? "is-open" : ""}`}
      >
        <ul>{mobileMenuLinks}</ul>
      </nav>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
