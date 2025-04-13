"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import { NetworkSelector } from "./NetworkSelector";
import { motion } from "framer-motion";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      label: "Launch Token",
      href: "/launch",
    },
    {
      label: "Governance",
      href: "/governance",
    },
    { label: "Stats", href: "/stats" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 border-b border-[#ffae5c]/20"
            : "bg-transparent"
        } backdrop-blur-lg`}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Logo & Desktop Navigation */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/logo.svg"
                  alt="Clampify Logo"
                  width={25}
                  height={25}
                />
              </motion.div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ffae5c] to-[#ff9021]">
                Clampify
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <div key={idx} className="relative">
                  <Link href={item.href} onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className={`text-white/80 hover:text-white hover:bg-[#ffae5c]/10 px-4 py-2 h-12 rounded-xl ${
                        pathname === item.href
                          ? "bg-[#ffae5c]/10 text-white"
                          : ""
                      }`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Network & Connect Wallet */}
          <div className="flex items-center gap-4">
            {/* Network Selector */}
            <div className="hidden md:flex items-center">
              <NetworkSelector />
            </div>

            {/* Wallet Button */}
            <div className="hidden md:flex items-center">
              <WalletButton />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-[#ffae5c]/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Separate from nav to ensure full-screen coverage */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen lg:hidden"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/95"
            onClick={closeMobileMenu}
          />

          {/* Menu content */}
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-y-auto">
            {/* Logo at top-left */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="absolute top-6 left-6 z-10 flex items-center gap-2"
            >
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/logo.svg"
                  alt="Clampify Logo"
                  width={25}
                  height={25}
                />
              </motion.div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ffae5c] to-[#ff9021]">
                Clampify
              </span>
            </Link>

            {/* Close button top-right */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-6 right-6 text-white p-2 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-md mx-auto">
              <div className="space-y-8">
                {navItems.map((item, idx) => (
                  <div key={idx}>
                    <Link href={item.href} onClick={closeMobileMenu}>
                      <div
                        className={`block p-4 rounded-md text-white text-center hover:bg-[#ffae5c]/10 ${
                          pathname === item.href ? "bg-[#ffae5c]/10" : ""
                        }`}
                      >
                        <span className="text-2xl font-medium">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {/* Network Badge (Mobile) */}
              <div className="mt-12 pt-8 border-t border-[#ffae5c]/20">
                <div className="mb-8 flex items-center justify-center gap-4 flex-col">
                  <NetworkSelector />
                  <WalletButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
