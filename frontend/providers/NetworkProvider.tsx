import { ReactNode } from "react";
import { NetworkProvider as NetworkContextProvider } from "@/components/NetworkSelector";

export function NetworkProvider({ children }: { children: ReactNode }) {
  return <NetworkContextProvider>{children}</NetworkContextProvider>;
}
