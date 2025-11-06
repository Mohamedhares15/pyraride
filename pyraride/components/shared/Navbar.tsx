"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      <motion.nav
        className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/5 backdrop-blur-md"
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
            <Link
              href="/pricing"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="/faq"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-xs lg:text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white"
            >
              Contact
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
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white drop-shadow-md">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
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
              <Link
                href="/pricing"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-white transition-colors hover:text-white/70"
                onClick={() => setIsOpen(false)}
              >
                Contact
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
              {status === "loading" ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-white/20" />
              ) : session ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
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
