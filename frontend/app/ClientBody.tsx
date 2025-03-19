"use client";

import { ReactNode } from "react";
import WalletButtonProvider from "@/providers/WalletButtonProvider";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/providers/WalletProvider";

function ClientBody({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      <WalletProvider>
        <WalletButtonProvider>{children}</WalletButtonProvider>
      </WalletProvider>
      <Footer />
    </div>
  );
}

export default ClientBody;
