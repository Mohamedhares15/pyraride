"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { User, LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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
        <Link href="/">Home</Link>
      </li>
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
          </Link>
        </li >
    <li>
      <Link href="/signup">
        <Button>Get Started</Button>
      </Link>
    </li>
      </>
    );

  const mobileMenuLinks = (
    <>
      <li onClick={closeMenu}>
        <Link href="/">Home</Link>
      </li>
      <li onClick={closeMenu}>
        <Link href="/stables">Stables</Link>
      </li>
      <li onClick={closeMenu}>
        <Link href="/gallery">Gallery</Link>
      </li>
      {session ? (
        <>
          <li onClick={closeMenu}>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li onClick={closeMenu}>
            <Link href={`/users/${session?.user?.id}`}>Profile</Link>
          </li>
          <li onClick={() => { closeMenu(); signOut(); }}>
            <button>Sign Out</button>
          </li>
        </>
      ) : (
        <>
          <li onClick={closeMenu}>
            <Link href="/signin">
              <button>Sign In</button>
            </Link>
          </li>
          <li onClick={closeMenu}>
            <Link href="/signup">
              <button>Get Started</button>
            </Link>
          </li>
        </>
      )}
    </>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-md bg-[#121212]/80 border-b border-white/10 text-white"
      >
        <Link href="/" className="text-2xl font-bold font-display tracking-tight">
          PyraRide
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {desktopLinks}
            {desktopAuthSection}
          </ul>
        </nav>

        <button
          type="button"
          className="hamburger-menu md:hidden text-2xl"
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
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold">Menu</span>
            <button onClick={closeMenu} className="text-2xl">✕</button>
          </div>
          <ul className="space-y-6 text-lg text-center">
            {mobileMenuLinks}
          </ul>
        </div>
      </nav>
    </>
  );
}
