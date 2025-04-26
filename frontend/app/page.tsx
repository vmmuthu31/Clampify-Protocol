"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock, Search } from "lucide-react";
import Image from "next/image";
import {
  FaClock,
  FaShieldAlt,
  FaRobot,
  FaBrain,
  FaRocket,
  FaExchangeAlt,
  FaChartBar,
  FaUsers,
} from "react-icons/fa";
import { useNetworkApi } from "@/hooks/useNetworkApi";

// Reusable section header component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center mb-8 md:mb-12 text-gray-400 text-sm overflow-hidden w-full">
    <span className="mr-2 md:mr-3 text-xs md:text-sm">{">>>>"}</span>
    <span className="mr-2 md:mr-3 font-medium text-white text-base md:text-lg whitespace-nowrap">
      {title}
    </span>
    <div className="flex-grow hidden md:block">
      {Array(140)
        .fill(">")
        .map((_, i) => (
          <span key={i}>{">"}</span>
        ))}
    </div>
    <div className="flex-grow block md:hidden">
      {Array(50)
        .fill(">")
        .map((_, i) => (
          <span key={i}>{">"}</span>
        ))}
    </div>{" "}
  </div>
);

// Define interface for token data
interface TokenData {
  _id?: string;
  id?: string;
  name: string;
  symbol: string;
  address?: string;
  initialPrice?: string;
  price?: number;
  creator?: string;
  chainId?: string;
  chainName?: string;
  initialSupply?: string;
  maxSupply?: string;
  creatorLockupPeriod?: string;
  lockLiquidity?: boolean;
  liquidityLockPeriod?: string;
  image?: string;
  createdAt?: string;

  // Display properties
  displayPrice?: number;
  displayChange?: number;
  displayLocked?: string;
  displayVolume?: number;
  displayDaysAgo?: number;
  displayIsNew?: boolean;
  displayIsTrending?: boolean;
}

export default function HomePage() {
  // Client-side state
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [processedTokens, setProcessedTokens] = useState<TokenData[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Use network API directly to avoid Redux issues
  const networkApi = useNetworkApi();

  // Fetch tokens directly from the API - ONCE only
  useEffect(() => {
    // Only fetch if we're on client and haven't fetched data yet
    if (isClient && !isDataFetched && !loading) {
      const fetchTokens = async () => {
        try {
          setLoading(true);
          const response = await networkApi.getTokens();

          const tokensData = response.tokens || [];

          // Check if we received valid data
          if (Array.isArray(tokensData) && tokensData.length > 0) {
            // Apply consistent random properties
            const processedData = tokensData.map((token) => {
              // Use a consistent seed based on token ID or address
              const seedStr = token._id || token.address || "";
              let seed = 0;

              // Simple hash function for consistent randomness
              for (let i = 0; i < seedStr.length; i++) {
                seed = (seed << 5) - seed + seedStr.charCodeAt(i);
                seed = seed & seed; // Convert to 32bit integer
              }

              // Normalize to 0-1 range
              seed = Math.abs(seed % 1000) / 1000;

              // Ensure initialPrice is converted to a number
              const initialPriceNum = token.initialPrice
                ? parseFloat(token.initialPrice)
                : null;
              const calculatedPrice = 0.0001 + seed * 0.01;

              return {
                ...token,
                id: token._id, // Map _id to id for consistency
                displayPrice: initialPriceNum || calculatedPrice,
                displayChange: (seed - 0.5) * 2 * 50, // Range from -50% to +50%
                displayLocked: `${Math.floor(70 + seed * 30)}%`, // Range from 70% to 100%
                displayVolume: Math.floor(10 + seed * 42), // Range from 10% to 52%
                displayDaysAgo: Math.max(1, Math.floor(seed * 7)), // Range from 1 to 7 days
                displayIsNew: Math.floor(seed * 7) <= 2, // New if 2 days or less
                displayIsTrending: seed > 0.6, // 40% chance of trending
              };
            });

            setProcessedTokens(processedData);
          } else {
            console.log("No tokens found or invalid data", tokensData);
          }
        } catch (error) {
          console.error("Error fetching tokens:", error);
        } finally {
          setLoading(false);
          setIsDataFetched(true); // Mark as fetched regardless of result
        }
      };

      fetchTokens();
    }
  }, [networkApi, isClient, isDataFetched, loading]);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Filter tokens based on search input
  const filteredTokens = processedTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black to-[#0D0B15]">
      {/* Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(72, 52, 212, 0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Content */}
      <div className="container mx-auto px-4 pt-20">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 lg:py-28 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Main dark background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[700px] md:w-[800px] h-[600px] sm:h-[700px] md:h-[800px] rounded-full bg-[#1a1710] opacity-80 blur-[120px]"></div>

            {/* Centered rich amber glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] xl:h-[350px] rounded-full bg-[#3a2e1b] opacity-70 blur-[80px]"></div>

            {/* Horizontal stage light effect */}
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] h-[40px] sm:h-[60px] md:h-[80px] lg:h-[100px] bg-[#ffae5c]/15 blur-[30px]"></div>

            {/* Stage spotlight effects */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[350px] sm:w-[500px] md:w-[700px] lg:w-[900px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] rounded-full bg-[#ffae5c]/10 blur-[80px]"
              animate={{
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Bottom edge highlight */}
            <div className="absolute top-[70%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] md:w-[80%] max-w-[1000px] h-[2px] bg-gradient-to-r from-transparent via-[#ffae5c]/50 to-transparent"></div>

            {/* Dynamic spotlight glow */}
            <motion.div
              className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[80%] sm:w-[70%] md:w-[60%] max-w-[800px] h-[20px] sm:h-[30px] md:h-[40px] lg:h-[60px] bg-[#ffae5c]/20 blur-[10px]"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                width: ["80%", "90%", "80%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Protocol header */}
          <div className="mb-4 sm:mb-6 relative">
            <div className="absolute -top-2 -left-3 sm:-left-5 w-3 sm:w-5 h-3 sm:h-5 border-t-2 border-l-2 border-[#3A3A3A]"></div>
            <div className="absolute -top-2 -right-3 sm:-right-5 w-3 sm:w-5 h-3 sm:h-5 border-t-2 border-r-2 border-[#3A3A3A]"></div>
            <div className="absolute -bottom-2 -left-3 sm:-left-5 w-3 sm:w-5 h-3 sm:h-5 border-b-2 border-l-2 border-[#3A3A3A]"></div>
            <div className="absolute -bottom-2 -right-3 sm:-right-5 w-3 sm:w-5 h-3 sm:h-5 border-b-2 border-r-2 border-[#3A3A3A]"></div>
            <h2 className="text-white text-base sm:text-xl font-light tracking-wide px-4 sm:px-8 py-2 sm:py-3">
              The Rugproof Token Protocol
            </h2>
          </div>

          {/* Main heading with gradient */}
          <div className="max-w-[90%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl relative z-10 px-2 sm:px-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light mb-2 sm:mb-3 leading-tight text-white">
              The Safer Way to
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-[#ffcb8b] to-[#ffae5c] drop-shadow-[0_5px_15px_rgba(255,174,92,0.3)]">
              Launch Meme Tokens.
            </h1>

            <div>
              <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12">
                Clampify is the first protocol to combine supply locking,
                anti-rug protection, and gasless smart contract deployment — all
                in one launchpad.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
              <Link href="/launch" className="relative group w-full sm:w-auto">
                <div className="absolute -top-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-t border-l border-[#ffae5c]"></div>
                <div className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-t border-r border-[#ffae5c]"></div>
                <div className="absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-b border-l border-[#ffae5c]"></div>
                <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-b border-r border-[#ffae5c]"></div>
                <div className="absolute inset-0 -z-10 bg-[#ffae5c]/20 blur-[15px] opacity-75 rounded-sm transform scale-110"></div>
                <button className="w-full sm:w-auto bg-[#ffae5c] hover:bg-[#ffcb8b] text-black font-medium px-6 sm:px-8 py-2.5 sm:py-3 uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 shadow-[0_0_15px_rgba(255,174,92,0.3)]">
                  LAUNCH TOKEN
                </button>
              </Link>

              <Link href="/about" className="relative group w-full sm:w-auto">
                <div className="absolute -top-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-t border-l border-white/30"></div>
                <div className="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-t border-r border-white/30"></div>
                <div className="absolute -bottom-1 -left-1 w-2 sm:w-3 h-2 sm:h-3 border-b border-l border-white/30"></div>
                <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 border-b border-r border-white/30"></div>
                <button className="w-full sm:w-auto bg-transparent border border-white/30 hover:border-white/70 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 uppercase tracking-wider text-xs sm:text-sm transition-all duration-300">
                  LEARN MORE
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Token Grid with lock indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Trending Rugproof Tokens
              </h2>
              <p className="text-base sm:text-lg text-white/70 mt-2">
                Secure launches that are gaining traction — backed by locked
                supply & community trust.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 pr-10 rounded-lg bg-[#1E1E1E] border border-[#3A3A3A] 
                    text-white placeholder-white/50 focus:outline-none focus:border-[#ffae5c]/40
                    transition-all duration-300"
                />
                <Search className="w-4 h-4 text-white/50 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <Link
                href="/discover"
                className="text-[#ffae5c] hover:underline flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-white/70">Fetching tokens...</p>
            </motion.div>
          ) : (
            <>
              {filteredTokens.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-white/70">
                    No tokens found matching &quot;{searchQuery}&quot;
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredTokens.slice(0, 8).map((token, i) => {
                    return (
                      <div
                        key={token.id || token._id || i}
                        className="relative"
                      >
                        {/* Border styling with corner lines */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>
                        </div>

                        <motion.div
                          className="bg-[#1F1C19] rounded-none p-6 h-full flex flex-col"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(40, 35, 30, 1)",
                          }}
                        >
                          <div className="flex items-start gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#583D21] flex items-center justify-center text-white font-semibold text-sm">
                              {token.symbol.substring(0, 3)}
                            </div>
                            <div>
                              <div className="text-white font-medium text-lg">
                                {token.name}
                              </div>
                              <div className="text-[#00C48C] text-sm">
                                Secure
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-auto">
                            <div className="text-white text-sm">
                              Supply Locked
                            </div>
                            <div className="text-white text-sm">
                              Volume: +{token.displayVolume || 20}%
                            </div>
                            <div className="text-white text-sm">
                              Launched: {token.displayDaysAgo || 3} days ago
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap mt-5 mb-4">
                            {token.displayIsNew && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F59E0B] text-black">
                                New
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#38343096] text-white">
                              Rugproof
                            </span>
                            {token.displayIsTrending && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#38343096] text-white">
                                Trending
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#38343096] text-white">
                              Anti-Bot
                            </span>
                          </div>

                          <Link href={`/token/${token.address}`}>
                            <div className="text-[#ffae5c] font-medium text-sm flex items-center">
                              View Token <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                          </Link>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Built with the Best of Web3 Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative overflow-hidden">
            <SectionHeader title="Built with the Best of Web3" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="md:w-1/2">
                <p className="text-lg text-white/70 leading-relaxed">
                  From execution to security, Clampify integrates leading
                  protocols across the ecosystem — ensuring every launch is
                  fast, fair, and fundamentally secure.
                </p>
              </div>
              <div className="md:w-1/2 flex flex-wrap items-center justify-end gap-8">
                <Image
                  src="/tokens/base.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/tokens/0G.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/tokens/polygon.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/tokens/arbitrum.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/tokens/ethereum.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/tokens/solana.svg"
                  alt="Protocol Logo"
                  width={40}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
              </div>
            </div>

            <SectionHeader title="Built Different. Locked Safer." />

            <h2 className="text-4xl font-bold text-white mb-6">
              Why Creators Choose Clampify
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-3xl">
              Our revolutionary protocol prevents rug pulls and protects
              investors through innovative supply locking mechanisms
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {/* Supply Locking */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Supply Locking
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Time-based + milestone-based unlocks prevent creator/whale
                    dumps
                  </p>
                </div>
              </div>

              {/* Anti-Rug Safeguards */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Anti-Rug Safeguards
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Protocol-enforced LP locks and smart triggers eliminate exit
                    scams
                  </p>
                </div>
              </div>

              {/* Bot & Whale Protection */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaRobot className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Bot & Whale Protection
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Advanced controls to limit bots + cap wallet size and
                    transaction limits
                  </p>
                </div>
              </div>

              {/* AI Risk Detection */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaBrain className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    AI Risk Detection
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Real-time launch scoring to flag risky or malicious tokens
                  </p>
                </div>
              </div>

              {/* Second row */}
              {/* Auto DEX Listing */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaExchangeAlt className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Auto DEX Listing
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Instant listing and liquidity lock on supported DEXs
                  </p>
                </div>
              </div>

              {/* Supply Locking (duplicate for visualization) */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaRocket className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Supply Locking
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Time-based + milestone-based unlocks prevent creator/whale
                    dumps
                  </p>
                </div>
              </div>

              {/* Tiered Liquidity Locks */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    Tiered Liquidity Locks
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Enforce time-based LP releases to prevent sudden exits
                  </p>
                </div>
              </div>

              {/* On-Chain Governance */}
              <div className="relative border border-[#3A3A3A] bg-[#1A1A1A] rounded-sm p-4 sm:p-5 md:p-6 hover:bg-[#252525] transition-all duration-300">
                <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>

                <div className="flex flex-col h-full">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4">
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/10"></div>
                    <div className="absolute w-full h-full rounded-md bg-[#FFAE5C]/5 blur-[15px]"></div>
                    <div className="absolute inset-0 rounded-md bg-[#FFAE5C]/5 blur-[5px]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#583D21] flex items-center justify-center">
                        <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFAE5C]" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    On-Chain Governance
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 mb-4">
                    Let holders vote on unlocks, changes, and rewards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* From Wallet to Rugproof Section */}
        <section className="py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 bg-[#0A0A0F] opacity-90"></div>

          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-[#4834D4]/10 blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-[#ffae5c]/5 blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center mb-4 text-gray-400 text-sm overflow-hidden w-full">
              <SectionHeader title="From Wallet to Rugproof — Fast." />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Creation to Clamp — in Under 5 Minutes
            </h2>
            <p className="text-lg text-white/70 mb-16 max-w-2xl">
              Launch a fully protected meme token in just a few clicks — no
              code, no risk.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Step 01 */}
              <div className="relative group">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>
                </div>

                <div className="p-8 relative">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Step 01.
                      </h3>
                      <h4 className="text-2xl font-bold text-white">
                        Connect Wallet
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#583D21] flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-[#FFAE5C]" />
                    </div>
                  </div>
                  <p className="text-white/70">
                    Connect your wallet securely to the Clampify protocol
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative group">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>
                </div>

                <div className="p-8 relative">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Step 02.
                      </h3>
                      <h4 className="text-2xl font-bold text-white">
                        Configure Security
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#583D21] flex items-center justify-center">
                      <FaShieldAlt className="w-5 h-5 text-[#FFAE5C]" />
                    </div>
                  </div>
                  <p className="text-white/70">
                    Set supply lock parameters and anti-rug safeguards
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative group">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#3A3A3A]"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#3A3A3A]"></div>
                </div>

                <div className="p-8 relative">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Step 03.
                      </h3>
                      <h4 className="text-2xl font-bold text-white">
                        Launch & Trade
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#583D21] flex items-center justify-center">
                      <FaRocket className="w-5 h-5 text-[#FFAE5C]" />
                    </div>
                  </div>
                  <p className="text-white/70">
                    Deploy your rugproof token with confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-20 text-gray-400 text-sm overflow-hidden w-full">
              <SectionHeader title="Fresh on Clampify" />
            </div>
          </div>
        </section>

        {/* Latest Tokens Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Latest Launches
            </h2>
            <Link
              href="/tokens"
              className="text-[#ffae5c] hover:underline flex items-center"
            >
              View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Link>
          </div>

          <p className="text-base sm:text-lg text-white/70 mb-6">
            Discover the freshest meme tokens launched on Clampify — fully
            secured with locked supply and anti-rug safeguards. Track price
            movements, supply lock %, and trade instantly.
          </p>

          <div className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl border border-[#ffae5c]/20 overflow-hidden">
            <div className="hidden sm:grid grid-cols-5 border-b border-[#ffae5c]/20 p-4 text-white/70">
              <div className="col-span-1">Token</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">24h Change</div>
              <div className="col-span-1">Supply Locked</div>
              <div className="col-span-1">Launch Date</div>
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-white/70">Fetching latest tokens...</p>
              </motion.div>
            ) : (
              <>
                {processedTokens.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-white/70">No tokens available</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Sort tokens by createdAt in descending order and take the latest 5 */}
                    {processedTokens
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt || 0).getTime() -
                          new Date(a.createdAt || 0).getTime()
                      )
                      .slice(0, 5)
                      .map((token, i) => {
                        return (
                          <motion.div
                            key={token.id || token._id || i}
                            className="sm:grid sm:grid-cols-5 flex flex-col items-start sm:items-center border-b border-[#ffae5c]/10 hover:bg-[#ffae5c]/10 transition-colors p-4"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="col-span-1 mb-3 sm:mb-0 w-full">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#ffae5c]/30 to-[#4834D4]/30 flex items-center justify-center">
                                  <span className="text-white/90 font-medium text-xs sm:text-sm">
                                    {token.symbol.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium text-sm sm:text-base">
                                    {token.name}
                                  </div>
                                  <div className="text-white/50 text-xs sm:text-sm">
                                    ${token.symbol}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between w-full sm:w-auto sm:block sm:col-span-1 pb-2 sm:pb-0 border-b border-[#ffae5c]/10 sm:border-0 mb-2 sm:mb-0">
                              <span className="text-white/70 sm:hidden text-xs">
                                Price:
                              </span>
                              <span className="text-white font-medium text-sm sm:text-base">
                                $
                                {typeof token.displayPrice === "number"
                                  ? token.displayPrice.toFixed(8)
                                  : "0.0000001"}
                              </span>
                            </div>
                            <div className="flex justify-between w-full sm:w-auto sm:block sm:col-span-1 pb-2 sm:pb-0 border-b border-[#ffae5c]/10 sm:border-0 mb-2 sm:mb-0">
                              <span className="text-white/70 sm:hidden text-xs">
                                24h:
                              </span>
                              <span
                                className={`text-sm ${
                                  (token.displayChange || 0) >= 0
                                    ? "text-[#00FFA3]"
                                    : "text-[#FF3B69]"
                                }`}
                              >
                                {(token.displayChange || 0) >= 0 ? "+" : ""}
                                {typeof token.displayChange === "number"
                                  ? token.displayChange.toFixed(1)
                                  : "0.0"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between w-full sm:w-auto sm:block sm:col-span-1 pb-2 sm:pb-0 border-b border-[#ffae5c]/10 sm:border-0 mb-2 sm:mb-0">
                              <span className="text-white/70 sm:hidden text-xs">
                                Locked:
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="relative w-16 sm:w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffae5c] to-[#4834D4]"
                                    style={{
                                      width: token.lockLiquidity
                                        ? "95%"
                                        : token.displayLocked || "85%",
                                    }}
                                    initial={{ width: "0%" }}
                                    whileInView={{
                                      width: token.lockLiquidity
                                        ? "95%"
                                        : token.displayLocked || "85%",
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 0.8,
                                      delay: i * 0.1,
                                    }}
                                  />
                                </div>
                                <span className="text-white text-xs sm:text-sm">
                                  {token.lockLiquidity
                                    ? "95%"
                                    : token.displayLocked || "85%"}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center w-full sm:col-span-1">
                              <div className="flex items-center">
                                <span className="text-white/70 sm:hidden text-xs mr-2">
                                  Created:
                                </span>
                                <span className="text-white/70 text-xs sm:text-sm">
                                  {token.displayDaysAgo ||
                                    new Date().getDate() -
                                      new Date(
                                        token.createdAt || 0
                                      ).getDate() ||
                                    3}
                                  d ago
                                </span>
                              </div>
                              <Link
                                href={`/token/${token.address}`}
                                className="bg-[#583D21] hover:bg-[#73512E] text-white font-medium text-xs sm:text-sm px-3 sm:px-5 py-1 sm:py-2 h-auto"
                              >
                                Trade
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Banner Section */}
        <motion.div
          className="mb-20 relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="rounded-xl bg-gradient-to-r from-[#1F1C19] to-[#2A2521] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <Image
                src="/logo.svg"
                alt="Clampify Logo"
                width={300}
                height={300}
                className="opacity-30 object-contain absolute right-0"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Launch Your Rugproof Token?
              </h2>
              <p className="text-xl text-white/70 max-w-xl mb-8">
                Create a token with built-in security that investors can trust.
                No code required.
              </p>
              <Link href="/launch">
                <Button className="bg-[#ffae5c] hover:bg-[#ff9021] text-black font-medium px-8 py-6 text-lg uppercase tracking-wide">
                  LAUNCH TOKEN NOW
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {mousePosition && (
        <motion.div
          className="fixed pointer-events-none w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle at center, rgba(108,92,231,0.1) 0%, transparent 70%)`,
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 200,
          }}
        />
      )}

      {/* Floating mini locks */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-6 h-6 text-[#ffae5c]/30 pointer-events-none z-10"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            rotate: [0, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Lock className="w-full h-full" />
        </motion.div>
      ))}
    </main>
  );
}
