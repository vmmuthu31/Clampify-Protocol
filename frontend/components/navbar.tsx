"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Launch", href: "/launch" },
    { label: "Trade", href: "/trade" },
    { label: "Stats", href: "/stats" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold gradient-text">ClampFi</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`text-white/70 hover:text-white ${
                    pathname === item.href ? "bg-white/10" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden sm:flex items-center gap-2 border-white/10 bg-black/20"
          >
            <Lock className="w-4 h-4 text-green-400" />
            <span className="text-white/70">CoreDAO Network</span>
          </Button>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
