"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";

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
      )}
    </>
  );

  const desktopAuthSection =
    status === "authenticated" ? (
      <li
        className="relative group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Only show notification bell in dashboard */}
        {typeof window !== 'undefined' && window.location.pathname.includes('/dashboard') && (
          <NotificationBell />
        )}
        <button
          className="flex items-center gap-3 focus:outline-none group/btn py-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 group-hover/btn:border-[rgb(218,165,32)]/50 transition-colors duration-300 shadow-lg shadow-black/20">
            {userImage && !imageError ? (
              <Image
                src={userImage}
                alt="Profile"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-black text-xs font-bold text-white group-hover/btn:text-[rgb(218,165,32)] transition-colors">
                {initials}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-white/90 group-hover/btn:text-white transition-colors">{displayName}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <div className="absolute right-0 top-full pt-2 w-56 origin-top-right z-50">
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="rounded-xl bg-[#121212]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-black/5"
              >
                <div className="p-1">
                  <Link
                    href={`/users/${session?.user?.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="p-1.5 rounded-md bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    My Profile
                  </Link>

                  <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                  >
                    <div className="p-1.5 rounded-md bg-white/5 text-white/60 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </li>
    ) : (
      <>
        <li>
          <Link href="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </li>
        <li>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </li>
      </>
    );

  const mobileMenuLinks = (
    <>
      {/* Mobile Menu Items - World Class Styling */}
      <li onClick={closeMenu}>
        <Link href="/" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
          Home
        </Link>
      </li>
      <li onClick={closeMenu}>
        <Link href="/stables" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
          Stables
        </Link>
      </li>
      <li onClick={closeMenu}>
        <Link href="/gallery" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
          Gallery
        </Link>
      </li>
      {session ? (
        <>
          <li onClick={closeMenu}>
            <Link href="/dashboard" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
              Dashboard
            </Link>
          </li>
          <li onClick={closeMenu}>
            <Link href={`/users/${session?.user?.id}`} className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
              Profile
            </Link>
          </li>
          <li onClick={() => { closeMenu(); signOut(); }}>
            <button className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              Sign Out
            </button>
          </li>
        </>
      ) : (
        <>
          <li onClick={closeMenu}>
            <Link href="/signin" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
              Sign In
            </Link>
          </li>
          <li onClick={closeMenu}>
            <Link href="/signup" className="block w-full text-left py-4 px-2 border-b border-white/10 font-medium hover:bg-white/5 hover:text-[rgb(218,165,32)] transition-colors">
              Get Started
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
        style={{
          height: 'var(--header-total-height)',
          paddingTop: 'var(--sat)',
          paddingLeft: 'var(--spacing-left-safe)',
          paddingRight: 'var(--spacing-right-safe)',
        }}
        className="fixed top-0 left-0 right-0 z-[150] flex items-center justify-between backdrop-blur-md bg-[#121212]/90 border-b border-white/10 text-white"
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
          className="md:hidden text-2xl bg-transparent border-none text-white cursor-pointer px-2.5 py-1.5"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={toggleMenu}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </motion.header>

      <div
        className={`fixed inset-0 bg-black/50 z-[140] transition-opacity duration-300 ease-out ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        id="mobile-nav"
        className={`fixed top-0 right-0 w-[85%] max-w-[360px] h-full bg-[#0a0a0a] border-l border-white/10 pt-safe px-6 pb-safe shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-[145] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center py-6 mb-2 border-b border-white/5">
            <span className="text-2xl font-display font-bold text-white tracking-tight">Menu</span>
            <button
              onClick={closeMenu}
              className="p-2 -mr-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <span className="text-2xl leading-none">✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {/* Mobile Menu Items - World Class Styling */}
              <li onClick={closeMenu}>
                <Link href="/" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </div>
                  <span className="font-medium text-lg">Home</span>
                </Link>
              </li>
              <li onClick={closeMenu}>
                <Link href="/stables" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M5 17h8v-6H5v6Z" /></svg>
                  </div>
                  <span className="font-medium text-lg">Stables</span>
                </Link>
              </li>
              <li onClick={closeMenu}>
                <Link href="/gallery" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                  </div>
                  <span className="font-medium text-lg">Gallery</span>
                </Link>
              </li>

              <div className="my-4 h-px bg-white/10 mx-4" />

              {session ? (
                <>
                  <li onClick={closeMenu}>
                    <Link href="/dashboard" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                      </div>
                      <span className="font-medium text-lg">Dashboard</span>
                    </Link>
                  </li>
                  <li onClick={closeMenu}>
                    <Link href={`/users/${session?.user?.id}`} className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-lg">Profile</span>
                    </Link>
                  </li>
                  <li onClick={() => { closeMenu(); signOut(); }}>
                    <button className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200">
                      <div className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-lg">Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li onClick={closeMenu}>
                    <Link href="/signin" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200">
                      <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-[rgb(218,165,32)] group-hover:bg-[rgba(218,165,32,0.1)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                      </div>
                      <span className="font-medium text-lg">Sign In</span>
                    </Link>
                  </li>
                  <li onClick={closeMenu}>
                    <Link href="/signup" className="group flex items-center gap-4 w-full text-left py-4 px-4 rounded-xl bg-white text-black hover:bg-white/90 transition-all duration-200 mt-2">
                      <div className="p-2 rounded-lg bg-black/5 text-black/60">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20" /><path d="m13 5 7 7-7 7" /></svg>
                      </div>
                      <span className="font-bold text-lg">Get Started</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="py-6 border-t border-white/5 px-6">
            <p className="text-xs text-white/30 text-center font-medium tracking-widest uppercase">
              PyraRide &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
