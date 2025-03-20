"use client";

import { ReactNode, useState, useEffect } from "react";
import WalletButtonProvider from "@/providers/WalletButtonProvider";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/providers/WalletProvider";
import Loader from "@/components/Loader";

function ClientBody({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  return (
    <div>
      {isLoading && <Loader />}
      <WalletProvider>
        <WalletButtonProvider>
          <Navbar />
          {children}
          <Footer />
        </WalletButtonProvider>
      </WalletProvider>
    </div>
  );
}

export default ClientBody;
