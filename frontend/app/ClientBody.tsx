"use client";

import { ReactNode } from "react";
import WalletButtonProvider from "@/providers/WalletButtonProvider";
function ClientBody({ children }: { children: ReactNode }) {
  return (
    <div>
      <WalletButtonProvider>{children}</WalletButtonProvider>
    </div>
  );
}

export default ClientBody;
