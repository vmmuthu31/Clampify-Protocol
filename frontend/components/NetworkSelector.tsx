import { useState, useEffect } from "react";
import { Shield, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";

interface Network {
  name: string;
  chainId: string;
  icon?: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
}

const SUPPORTED_NETWORKS: Network[] = [
  //
  // {
  //   name: "Core Blockchain Mainnet",
  //   chainId: "1116",
  //   rpcUrl: "https://rpc.coredao.org",
  //   nativeCurrency: {
  //     name: "CORE",
  //     symbol: "CORE",
  //     decimals: 18,
  //   },
  //   blockExplorerUrl: "https://scan.coredao.org",
  // },
  // {
  //   name: "Soneium",
  //   chainId: "1868",
  //   rpcUrl: "https://rpc.soneium.org",
  //   nativeCurrency: {
  //     name: "ETH",
  //     symbol: "ETH",
  //     decimals: 18,
  //   },
  //   blockExplorerUrl: "https://soneium.blockscout.com",
  // },
  {
    name: "Core Testnet",
    chainId: "1114",
    rpcUrl: "https://rpc.test2.btcs.network",
    nativeCurrency: {
      name: "Core",
      symbol: "tCORE2",
      decimals: 18,
    },
    blockExplorerUrl: "https://scan.test2.btcs.network",
  },
  {
    name: "BNB Testnet",
    chainId: "97",
    rpcUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
    blockExplorerUrl: "https://testnet.bscscan.com",
  },
  {
    name: "Polygon Amoy",
    chainId: "80002",
    rpcUrl: "https://rpc-amoy.polygon.technology",
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrl: "https://www.oklink.com/amoy",
  },
];

export function NetworkSelector() {
  const [currentNetwork, setCurrentNetwork] = useState<Network>(
    SUPPORTED_NETWORKS[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNetwork();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
      window.ethereum.on("accountsChanged", checkNetwork);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", checkNetwork);
        window.ethereum.removeListener("accountsChanged", checkNetwork);
      }
    };
  }, []);

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        const accounts = await provider.listAccounts();

        setIsConnected(accounts.length > 0);
        const matchedNetwork = SUPPORTED_NETWORKS.find(
          (n) => n.chainId === chainId
        );
        if (matchedNetwork) {
          setCurrentNetwork(matchedNetwork);
        }
      } catch (error) {
        console.error("Error checking network:", error);
        setIsConnected(false);
      }
    }
  };

  const switchNetwork = async (network: Network) => {
    if (!window.ethereum) {
      alert("Please install MetaMask to switch networks!");
      return;
    }

    setIsLoading(true);
    try {
      // Validate network connection first
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      const networkInfo = await provider.getNetwork();

      // Verify chain ID matches
      if (networkInfo.chainId.toString() !== network.chainId) {
        throw new Error(
          "Network chain ID mismatch. Please check network configuration."
        );
      }

      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${parseInt(network.chainId).toString(16)}` }],
      });

      setCurrentNetwork(network);
    } catch (switchError: unknown) {
      if (
        typeof switchError === "object" &&
        switchError &&
        "code" in switchError
      ) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            // Validate network connection before adding
            const provider = new ethers.providers.JsonRpcProvider(
              network.rpcUrl
            );
            await provider.getNetwork();

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${parseInt(network.chainId).toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: network.nativeCurrency,
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.blockExplorerUrl],
                },
              ],
            });

            // After adding the chain, try to switch to it
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [
                { chainId: `0x${parseInt(network.chainId).toString(16)}` },
              ],
            });

            setCurrentNetwork(network);
          } catch (addError) {
            console.error("Error adding network:", addError);
            if (addError instanceof Error) {
              alert(`Failed to add network: ${addError.message}`);
            } else {
              alert(
                "Failed to add network to MetaMask. Please verify the network configuration and try again."
              );
            }
          }
        } else {
          alert(
            "Failed to switch network. Please verify the network configuration and try again."
          );
        }
      } else if (switchError instanceof Error) {
        alert(`Network Error: ${switchError.message}`);
      } else {
        alert(
          "An unknown error occurred while switching networks. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-[#ffae5c]/30 bg-[#ffae5c]/5 text-white/80 hover:text-white ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <div className="relative">
          <Shield className="w-4 h-4 text-[#ffae5c]" />
          <motion.div
            className={`absolute -right-1 -top-1 w-2 h-2 rounded-full ${
              isConnected ? "bg-[#ffae5c]" : "bg-red-400"
            }`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-sm">
          {isLoading ? "Switching..." : currentNetwork.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-60 bg-black/90 border border-[#ffae5c]/20 rounded-xl backdrop-blur-xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              {SUPPORTED_NETWORKS.map((network) => (
                <button
                  key={network.chainId}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-[#ffae5c]/20 transition-colors ${
                    currentNetwork.chainId === network.chainId
                      ? "bg-[#ffae5c]/10 text-white"
                      : ""
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !isLoading && switchNetwork(network)}
                  disabled={isLoading}
                >
                  <span>{network.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
