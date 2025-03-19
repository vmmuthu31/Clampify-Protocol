"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";

export default function WalletButtonProvider({
  children,
}: {
  children: ReactNode;
}) {
  const coreDaoTestnet2 = {
    id: 1114,
    name: "Core Blockchain Testnet2",
    network: "coredao",
    nativeCurrency: { name: "TCORE2", symbol: "tCore2", decimals: 18 },
    iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/23254.png",
    rpcUrls: {
      default: { http: ["https://rpc.test2.btcs.network/"] },
    },
    blockExplorers: {
      default: {
        name: "Core Blockchain Testnet2",
        url: "https://scan.test2.btcs.network/",
      },
    },
    testnet: true,
  };
  return (
    <PrivyProvider
      appId={process.env.PRIVY_APP_ID || "cm8ednps8005jljpr281m2oqq"}
      config={{
        defaultChain: coreDaoTestnet2,
        supportedChains: [coreDaoTestnet2],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
