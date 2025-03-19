"use client";

import { ReactNode } from "react";
import WalletButtonProvider from "@/providers/WalletButtonProvider";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/navbar";

function ClientBody({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar />
      <WalletButtonProvider>{children}</WalletButtonProvider>
      <Footer />
    </div>
  );
}

export default ClientBody;
