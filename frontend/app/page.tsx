"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  ChartBar,
  Rocket,
  Lock,
  Users,
  Shield,
  Timer,
  BarChart3,
  Vote,
  Repeat,
  Search,
} from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  // Client-side state
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  interface Token {
    _id: string;
    address: string;
    name: string;
    symbol: string;
    creator: string;
    initialSupply: string;
    maxSupply: string;
    createdAt: string;
    __v: number;
    // Display attributes
    displayPrice?: number;
    displayChange?: number;
    displayLocked?: string;
    displayVolume?: number;
    displayDaysAgo?: number;
    displayIsNew?: boolean;
    displayIsTrending?: boolean;
  }

  const [tokens, setTokens] = useState<Token[]>([]);

  const fetchTokens = async () => {
    setLoading(true);
    const response = await fetch("/api/tokens");
    const data = await response.json();
    setTokens(data.tokens);
    setLoading(false);
  };

  // Add display attributes to tokens once they're loaded
  useEffect(() => {
    if (tokens.length > 0) {
      const enhancedTokens = tokens.map((token) => {
        // Generate consistent random values for each token based on its address
        const seed = token.address.charCodeAt(2) / 255; // Use character code as pseudo-random seed

        return {
          ...token,
          displayPrice: 0.0001 + seed * 0.01,
          displayChange: (seed - 0.5) * 2 * 50, // Range from -50% to +50%
          displayLocked: `${Math.floor(70 + seed * 30)}%`, // Range from 70% to 100%
          displayVolume: Math.floor(10 + seed * 42), // Range from 10% to 52%
          displayDaysAgo: Math.max(1, Math.floor(seed * 7)), // Range from 1 to 7 days
          displayIsNew: Math.floor(seed * 7) <= 2, // New if 2 days or less
          displayIsTrending: seed > 0.6, // 40% chance of trending
        };
      });

      setTokens(enhancedTokens);
    }
  }, [tokens.length]);

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filteredTokens = tokens.filter(
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
          className="flex flex-col md:flex-row items-center justify-between mb-16 relative py-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left Content - Text */}
          <div className="w-full md:w-1/2 mb-16 md:mb-0 z-10">
            <motion.div
              className="inline-block mb-4 px-4 py-2 bg-[#ffae5c]/10 backdrop-blur-sm rounded-full border border-[#ffae5c]/30"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[#ffae5c] font-medium flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="mr-2"
                >
                  <Image
                    src="/logo.svg"
                    alt="Clampify Logo"
                    width={25}
                    height={25}
                  />
                </motion.div>
                Introducing Clampify Protocol
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffae5c] to-[#4834D4]">
                Meme Tokens
              </span>
              <br />
              <span className="text-white">Without The Rugs</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Launch your meme token with revolutionary supply locking and
              anti-rug pull safeguards built right into the protocol.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/launch" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#ffae5c] to-[#4834D4] 
            hover:opacity-90 rounded-xl text-lg font-medium group relative overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative flex items-center justify-center">
                    Launch Token
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              <Button
                className="w-full sm:w-auto h-14 px-8 bg-transparent border border-[#ffae5c]/50 
          hover:bg-[#ffae5c]/10 rounded-xl text-lg font-medium text-white"
              >
                Learn More
              </Button>
            </motion.div>
          </div>

          {/* Right Content - Animation */}
          <motion.div
            className="w-full md:w-1/2 relative h-[300px] sm:h-[400px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Lottie Animation - Replace with actual Lottie component if you have it */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Main Lock Animation with Glow Effect */}
              <div className="relative">
                <motion.div
                  className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full bg-[#ffae5c]/20 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <motion.div
                    className="text-[120px] sm:text-[180px] opacity-90 filter drop-shadow-[0_0_15px_rgba(108,92,231,0.5)]"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Image
                      src="/logo.svg"
                      alt="Clampify Logo"
                      width={200}
                      height={200}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute -top-8 -right-8 sm:-top-10 sm:-right-10 text-4xl sm:text-6xl"
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Image
                      src="/btc.png"
                      alt="Clampify Logo"
                      width={100}
                      height={100}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-8 -left-8 sm:-bottom-10 sm:-left-10 text-4xl sm:text-6xl"
                    animate={{ rotate: [0, -360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  >
                    <Image
                      src="/core.png"
                      alt="Clampify Logo"
                      width={100}
                      height={100}
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Orbiting Tokens with Better Visibility on Mobile */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-r from-[#ffae5c]/20 to-[#4834D4]/20 rounded-full backdrop-blur-sm border border-[#ffae5c]/30 shadow-lg shadow-[#ffae5c]/10"
                  initial={{
                    x:
                      Math.cos(i * ((2 * Math.PI) / 5)) *
                      (window.innerWidth < 640 ? 100 : 150),
                    y:
                      Math.sin(i * ((2 * Math.PI) / 5)) *
                      (window.innerWidth < 640 ? 100 : 150),
                  }}
                  animate={{
                    x: [
                      Math.cos(i * ((2 * Math.PI) / 5)) *
                        (window.innerWidth < 640 ? 100 : 150),
                      Math.cos(i * ((2 * Math.PI) / 5) + Math.PI) *
                        (window.innerWidth < 640 ? 100 : 150),
                      Math.cos(i * ((2 * Math.PI) / 5) + 2 * Math.PI) *
                        (window.innerWidth < 640 ? 100 : 150),
                    ],
                    y: [
                      Math.sin(i * ((2 * Math.PI) / 5)) *
                        (window.innerWidth < 640 ? 100 : 150),
                      Math.sin(i * ((2 * Math.PI) / 5) + Math.PI) *
                        (window.innerWidth < 640 ? 100 : 150),
                      Math.sin(i * ((2 * Math.PI) / 5) + 2 * Math.PI) *
                        (window.innerWidth < 640 ? 100 : 150),
                    ],
                  }}
                  transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  whileHover={{
                    scale: 1.2,
                    backgroundColor: "rgba(108, 92, 231, 0.3)",
                  }}
                >
                  <span className="text-white font-bold flex items-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block mr-1"
                    >
                      <Image
                        src="/logo.svg"
                        alt="Clampify Logo"
                        width={25}
                        height={25}
                      />
                    </motion.span>
                    <span>CLAMP</span>
                  </span>
                </motion.div>
              ))}

              {/* Floating Tokens */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`float-${i}`}
                  className="absolute w-8 h-8 rounded-full bg-[#ffae5c]/10 border border-[#ffae5c]/20 flex items-center justify-center text-xs text-white/70  md:flex"
                  initial={{
                    x: Math.random() * 300 - 150,
                    y: Math.random() * 300 - 150,
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.3,
                  }}
                  animate={{
                    y: [
                      Math.random() * 100 - 50,
                      Math.random() * -100 + 50,
                      Math.random() * 100 - 50,
                    ],
                    opacity: [
                      Math.random() * 0.5 + 0.3,
                      Math.random() * 0.5 + 0.5,
                      Math.random() * 0.5 + 0.3,
                    ],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {["$", "💎", "🔒", "⚡", "🛡️", "🚀", "💰", "🔐"][i]}
                </motion.div>
              ))}

              {/* Animated Shield Glow Effect */}
              <motion.div
                className="absolute inset-0 z-0 opacity-30"
                animate={{
                  background: [
                    "radial-gradient(circle at 50% 50%, rgba(108, 92, 231, 0.4) 0%, transparent 60%)",
                    "radial-gradient(circle at 50% 50%, rgba(108, 92, 231, 0.2) 20%, transparent 70%)",
                    "radial-gradient(circle at 50% 50%, rgba(108, 92, 231, 0.4) 0%, transparent 60%)",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Mobile-optimized animated background */}
          <motion.div
            className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 rounded-full bg-[#ffae5c]/5 blur-3xl z-0 md:hidden"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Stats Bar with locking effect */}
        <motion.div
          className="grid grid-cols-2 gap-2 md:grid-cols-4 items-center justify-between mb-14 p-5 bg-[#ffae5c]/10 backdrop-blur-md rounded-xl border border-[#ffae5c]/30 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, #ffae5c 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, #ffae5c 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, #ffae5c 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="flex items-center gap-2 text-white/70">
            <ChartBar className="w-4 h-4 text-[#ffae5c]" />
            <span>24h Volume:</span>
            <motion.span
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              $2.4M
            </motion.span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Lock className="w-4 h-4 text-[#ffae5c]" />
            <span>Supply Locked:</span>
            <motion.span
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              74.8%
            </motion.span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <TrendingUp className="w-4 h-4 text-[#ffae5c]" />
            <span>Tokens Created:</span>
            <motion.span
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              1,834
            </motion.span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Shield className="w-4 h-4 text-[#ffae5c]" />
            <span>Rugs Prevented:</span>
            <motion.span
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            >
              324
            </motion.span>
          </div>
        </motion.div>

        {/* Token Grid with lock indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Trending Rugproof Tokens
              </h2>
              <p className="text-lg text-white/70 mt-2">
                Secure launches that are gaining traction — backed by locked
                supply & community trust.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 pr-10 rounded-lg bg-[#1E1E1E] border border-[#3A3A3A] 
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
                  {filteredTokens.slice(0, 8).map((token: Token, i: number) => {
                    return (
                      <div key={token.address} className="relative">
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
                              CLP
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

        {/* Why Clampify Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Why Clampify
          </h2>
          <p className="text-xl text-white/60 text-center mb-12 max-w-3xl mx-auto">
            Our revolutionary protocol prevents rug pulls and protects investors
            through innovative supply locking mechanisms
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Feature */}
            <motion.div
              className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-8 border border-[#ffae5c]/20 relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    "radial-gradient(circle at 0% 0%, #ffae5c 0%, transparent 70%)",
                    "radial-gradient(circle at 100% 100%, #ffae5c 0%, transparent 70%)",
                    "radial-gradient(circle at 0% 0%, #ffae5c 0%, transparent 70%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />

              <div className="relative">
                <div className="mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-[#ffae5c]/20 border border-[#ffae5c]/30 flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <Lock className="w-7 h-7 text-[#ffae5c]" />
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Supply Locking Mechanism
                </h3>

                <ul className="space-y-4">
                  {[
                    "Time-based lockups prevent large holders from dumping tokens",
                    "Graduated unlock schedules protect against market manipulation",
                    "Smart contract triggers prevent coordinated selling",
                    "Built-in protection against flash loan attacks",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="mt-1 min-w-5">
                        <motion.div
                          className="w-5 h-5 rounded-full bg-[#ffae5c]/20 border border-[#ffae5c]/40 flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-[#ffae5c]"></div>
                        </motion.div>
                      </div>
                      <span className="text-white/80">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Feature */}
            <motion.div
              className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-8 border border-[#ffae5c]/20 relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  background: [
                    "radial-gradient(circle at 100% 0%, #ffae5c 0%, transparent 70%)",
                    "radial-gradient(circle at 0% 100%, #ffae5c 0%, transparent 70%)",
                    "radial-gradient(circle at 100% 0%, #ffae5c 0%, transparent 70%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />

              <div className="relative">
                <div className="mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-[#ffae5c]/20 border border-[#ffae5c]/30 flex items-center justify-center"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <Shield className="w-7 h-7 text-[#ffae5c]" />
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Anti-Rug Pull Safeguards
                </h3>

                <ul className="space-y-4">
                  {[
                    "100% of liquidity locked in time-release smart contracts",
                    "Algorithmic circuit breakers prevent major price manipulations",
                    "Transparent on-chain verification of token supply distribution",
                    "Tiered liquidity release schedules to prevent instant draining",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="mt-1 min-w-5">
                        <motion.div
                          className="w-5 h-5 rounded-full bg-[#ffae5c]/20 border border-[#ffae5c]/40 flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-[#ffae5c]"></div>
                        </motion.div>
                      </div>
                      <span className="text-white/80">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works Section - Reimagined with lock animations */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            How It Works
          </h2>
          <p className="text-xl text-white/60 text-center mb-12 max-w-3xl mx-auto">
            Launch your secure token in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Connect Wallet",
                desc: "Connect your wallet securely to the Clampify protocol",
                icon: <Users className="w-6 h-6" />,
                animation: {
                  rotate: [0, 10, -10, 0],
                  duration: 6,
                },
              },
              {
                step: 2,
                title: "Configure Security",
                desc: "Set your supply lock parameters and anti-rug safeguards",
                icon: <Lock className="w-6 h-6" />,
                animation: {
                  scale: [1, 1.1, 1],
                  duration: 4,
                },
              },
              {
                step: 3,
                title: "Launch & Trade",
                desc: "Deploy your rugproof token with confidence",
                icon: <Rocket className="w-6 h-6" />,
                animation: {
                  y: [0, -5, 0],
                  duration: 5,
                },
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-8 border border-[#ffae5c]/20 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-10"
                  animate={{
                    background: [
                      `radial-gradient(circle at ${50 + i * 20}% ${
                        50 - i * 20
                      }%, #ffae5c 0%, transparent 70%)`,
                      `radial-gradient(circle at ${50 - i * 20}% ${
                        50 + i * 20
                      }%, #ffae5c 0%, transparent 70%)`,
                      `radial-gradient(circle at ${50 + i * 20}% ${
                        50 - i * 20
                      }%, #ffae5c 0%, transparent 70%)`,
                    ],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />

                <div className="relative">
                  <div className="flex justify-between items-center mb-6">
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ffae5c] to-[#4834D4] flex items-center justify-center"
                      animate={item.animation}
                      transition={{
                        duration: item.animation.duration,
                        repeat: Infinity,
                      }}
                    >
                      {item.icon}
                    </motion.div>

                    <div className="w-10 h-10 rounded-full border border-[#ffae5c]/40 flex items-center justify-center text-xl font-bold text-white">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/70">{item.desc}</p>

                  {i < 2 && (
                    <motion.div
                      className="absolute -right-12 top-12 text-[#ffae5c]/40 hidden md:block"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <ArrowRight className="w-8 h-8" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Core Features */}

        {/* Core Protocol Features Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Core Protocol Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Time-Lock Mechanics",
                desc: "Gradual supply unlocking based on predefined schedules",
                icon: <Timer className="w-6 h-6" />,
              },
              {
                title: "Stability Mechanics",
                desc: "Dynamic minting/burning features stabilize token price",
                icon: <BarChart3 className="w-6 h-6" />,
              },
              {
                title: "Governance System",
                desc: "Decentralized community control of protocol parameters",
                icon: <Vote className="w-6 h-6" />,
              },
              {
                title: "DEX Integration",
                desc: "Seamless trading on major decentralized exchanges",
                icon: <Repeat className="w-6 h-6" />,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-6 border border-[#ffae5c]/20"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(108, 92, 231, 0.1)",
                  borderColor: "rgba(108, 92, 231, 0.3)",
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-[#ffae5c]/20 border border-[#ffae5c]/30 
          flex items-center justify-center mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistics Section with Animated Charts */}
        <motion.div
          className="mb-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#ffae5c]/20 to-transparent rounded-xl blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-center mb-14 text-white">
              Protocol Analytics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  value: "$18.5M",
                  label: "Total Value Locked",
                  icon: <Lock />,
                },
                { value: "1,834", label: "Tokens Launched", icon: <Rocket /> },
                {
                  value: "$7.2M",
                  label: "24h Trading Volume",
                  icon: <ChartBar />,
                },
                { value: "56.4K", label: "Active Users", icon: <Users /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-6 border border-[#ffae5c]/20"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.div
                    className="text-[#ffae5c] mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div
                    className="text-3xl font-bold text-white mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Latest Tokens Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Latest Launches</h2>
            <Link
              href="/tokens"
              className="text-[#ffae5c] hover:underline flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <p className="text-lg text-white/70 mb-6">
            Discover the freshest meme tokens launched on Clampify — fully
            secured with locked supply and anti-rug safeguards. Track price
            movements, supply lock %, and trade instantly.
          </p>

          <div className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl border border-[#ffae5c]/20 overflow-hidden">
            <div className="grid grid-cols-5 border-b border-[#ffae5c]/20 p-4 text-white/70">
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
                {tokens.length === 0 ? (
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
                    {tokens
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 5)
                      .map((token, i) => {
                        return (
                          <motion.div
                            key={token._id}
                            className="grid grid-cols-5 items-center border-b border-[#ffae5c]/10 hover:bg-[#ffae5c]/10 transition-colors p-4"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="col-span-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffae5c]/30 to-[#4834D4]/30 flex items-center justify-center">
                                  <span className="text-white/90 font-medium">
                                    {token.symbol.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium">
                                    {token.name}
                                  </div>
                                  <div className="text-white/50 text-sm">
                                    ${token.symbol}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-1 text-white font-medium">
                              ${token.displayPrice?.toFixed(4) || "0.0023"}
                            </div>
                            <div className="col-span-1">
                              <span
                                className={
                                  (token.displayChange || 0) >= 0
                                    ? "text-[#00FFA3]"
                                    : "text-[#FF3B69]"
                                }
                              >
                                {(token.displayChange || 0) >= 0 ? "+" : ""}
                                {token.displayChange?.toFixed(1) || "0.0"}%
                              </span>
                            </div>
                            <div className="col-span-1">
                              <div className="flex items-center gap-2">
                                <div className="relative w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffae5c] to-[#4834D4]"
                                    style={{
                                      width: token.displayLocked || "85%",
                                    }}
                                    initial={{ width: "0%" }}
                                    whileInView={{
                                      width: token.displayLocked || "85%",
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 0.8,
                                      delay: i * 0.1,
                                    }}
                                  />
                                </div>
                                <span className="text-white">
                                  {token.displayLocked || "85%"}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-between items-center">
                              <span className="text-white/70">
                                {token.displayDaysAgo || 3}d ago
                              </span>
                              <Button className="bg-[#583D21] hover:bg-[#73512E] text-white font-medium px-5">
                                Trade
                              </Button>
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

        {/* Testimonials Section */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Creator Testimonials
          </h2>
          <p className="text-xl text-white/60 text-center mb-12 max-w-3xl mx-auto">
            Hear from token creators who&apos;ve launched with Clampify
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Clampify's supply locking gave investors confidence in our token from day one. We've seen 10x the engagement compared to our previous launch.",
                author: "Alex Chen",
                role: "Founder, MoonDAO",
                avatar: "😎",
              },
              {
                quote:
                  "The anti-rug safeguards literally saved our project. A malicious actor tried to drain liquidity but the protocol prevented it automatically.",
                author: "Sarah Johnson",
                role: "Lead Dev, PepeFi",
                avatar: "👩‍💻",
              },
              {
                quote:
                  "Our community loves the transparency that Clampify provides. The time-locked supply creates a much healthier growth pattern.",
                author: "Michael Thompson",
                role: "Creator, DogeMeme",
                avatar: "🧔",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-[#ffae5c]/5 backdrop-blur-sm rounded-xl p-8 border border-[#ffae5c]/20 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="absolute top-6 left-6 text-[#ffae5c] opacity-20 text-6xl font-serif">
                  &quot;
                </div>
                <div className="relative">
                  <p className="text-white/80 mb-6 text-lg leading-relaxed pt-4">
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ffae5c]/20 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {testimonial.author}
                      </div>
                      <div className="text-white/50 text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="rounded-xl bg-gradient-to-r from-[#ffae5c] to-[#4834D4] p-[1px] mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-12 relative overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(108,92,231,0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(108,92,231,0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(108,92,231,0.2) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <motion.div
              className="relative flex flex-col md:flex-row items-center justify-between gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready to Launch Your Rugproof Token?
                </h2>
                <p className="text-xl text-white/70 max-w-xl">
                  Create a token with built-in security that investors can
                  trust. No code required.
                </p>
              </div>

              <div className="flex gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/launch">
                    <Button
                      className=" md:h-14 px-4 md:px-8 bg-gradient-to-r from-[#ffae5c] to-[#4834D4] text-white hover:bg-white/90 
                        rounded-xl text-sm md:text-lg font-medium group"
                    >
                      Launch Token
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/docs">
                    <Button
                      className="md:h-14 px-4 md:px-8 bg-transparent border border-white/30 text-white
                        hover:bg-white/10 rounded-xl text-sm md:text-lg font-medium"
                    >
                      Read Docs
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
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
