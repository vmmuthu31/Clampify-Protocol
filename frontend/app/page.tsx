"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, TrendingUp, ChartBar, Sparkles, Shield, Rocket, Lock, Zap, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  // Client-side state
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fixed data instead of random
  const tokenData = [
    { id: 1, price: 0.0001, change: 12.5 },
    { id: 2, price: 0.0002, change: 15.7 },
    { id: 3, price: 0.0003, change: 8.3 },
    { id: 4, price: 0.0004, change: 21.2 },
    { id: 5, price: 0.0005, change: 17.8 },
    { id: 6, price: 0.0006, change: 9.4 },
    { id: 7, price: 0.0007, change: 14.6 },
    { id: 8, price: 0.0008, change: 11.9 },
  ];

  // Only render animations on client
  if (!isClient) {
    return null; // or a loading state
  }

  // Floating animation for background elements
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-20, 20, -20],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
   

      <Navbar />

      {/* Content */}
      <div className="container mx-auto px-4 pt-20">
        {/* Stats Bar with sparkle effect */}
        <motion.div 
          className="flex items-center justify-between mb-8 p-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, #FF3B69 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, #FF3B69 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, #FF3B69 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="flex items-center gap-2 text-white/60">
            <ChartBar className="w-4 h-4" />
            <span>24h Volume:</span>
            <motion.span 
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              $1.2M
            </motion.span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <TrendingUp className="w-4 h-4" />
            <span>Tokens Created:</span>
            <motion.span 
              className="text-white font-medium"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              1,234
            </motion.span>
          </div>
        </motion.div>

        {/* Token Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tokenData.map((token, i) => (
            <motion.div 
              key={token.id}
              className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#FF3B69]/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(0,0,0,0.3)"
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF3B69]/20 to-[#FF3E9C]/20 flex items-center justify-center">
                  <span className="text-white/80 font-medium">M{token.id}</span>
                </div>
                <div>
                  <div className="text-white font-medium">$MEME{token.id}</div>
                  <div className="text-white/40 text-sm">Core</div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-white/60 text-sm">Price</div>
                  <motion.div 
                    className="text-white font-bold text-lg"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    ${token.price.toFixed(4)}
                  </motion.div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[#00FFA3] font-medium">
                    +{token.change.toFixed(1)}%
                  </div>
                  <div className="text-white/40 text-sm">24h</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Launch Card */}
        <motion.div 
          className="bg-black/20 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-white/10 relative overflow-hidden mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, #FF3B69 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, #FF3B69 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, #FF3B69 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="relative flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <motion.div
                className="relative"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-7xl">🚀</span>
                <motion.div
                  className="absolute -bottom-2 -right-2 text-4xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.div>
              </motion.div>

              <motion.h1 
                className="text-5xl md:text-6xl font-bold mt-8 mb-6 gradient-text leading-tight"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Launch Your Token
              </motion.h1>

              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                Create your meme token with built-in rug pull protection in seconds
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/launch">
                  <Button 
                    className="h-14 px-8 bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] 
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
                    <span className="relative flex items-center">
                      Launch Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="space-y-4">
                {[
                  { 
                    title: "Anti-Rug Protection", 
                    desc: "Mathematically impossible to rug pull",
                    emoji: "🔒"
                  },
                  { 
                    title: "Instant Liquidity", 
                    desc: "Automatic market making",
                    emoji: "💧"
                  },
                  { 
                    title: "Supply Control", 
                    desc: "Advanced tokenomics built-in",
                    emoji: "⚡"
                  }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex gap-4 p-6 rounded-xl bg-black/20 hover:bg-black/30 transition-colors relative group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (i * 0.2) }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                  >
                    <motion.div 
                      className="text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {item.emoji}
                    </motion.div>
                    <div>
                      <div className="text-white font-medium text-lg">{item.title}</div>
                      <div className="text-white/60">{item.desc}</div>
                    </div>
                    <motion.div
                      className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] blur opacity-20" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* New Section: How It Works */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Connect Wallet",
                desc: "Connect your CoreDAO wallet to get started",
                icon: <Users className="w-6 h-6" />
              },
              {
                step: 2,
                title: "Configure Token",
                desc: "Set your token parameters and security features",
                icon: <Zap className="w-6 h-6" />
              },
              {
                step: 3,
                title: "Launch & Trade",
                desc: "Deploy your token and start trading instantly",
                icon: <Rocket className="w-6 h-6" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <motion.div
                  className="absolute -inset-4 rounded-xl bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] opacity-0 group-hover:opacity-20 blur"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative group">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-[#FF3B69] flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="text-2xl font-bold text-white mb-2">Step {item.step}</div>
                  <div className="text-xl font-medium text-white mb-2">{item.title}</div>
                  <div className="text-white/60">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Section: Statistics */}
        <motion.div 
          className="mb-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF3B69]/20 to-transparent rounded-xl blur-3xl" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "$12.5M", label: "Total Value Locked", icon: <Lock /> },
              { value: "1,234", label: "Tokens Created", icon: <Rocket /> },
              { value: "$5.8M", label: "Trading Volume", icon: <ChartBar /> },
              { value: "45.2K", label: "Active Users", icon: <Users /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div
                  className="text-[#FF3B69] mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div 
                  className="text-3xl font-bold text-white mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New Section: Call to Action */}
        <motion.div 
          className="rounded-xl bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] p-[1px] mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-black/90 backdrop-blur-sm rounded-xl p-12 relative overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(255,59,105,0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(255,59,105,0.2) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(255,59,105,0.2) 0%, transparent 50%)",
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Ready to Launch?</h2>
                <p className="text-xl text-white/60">Create your token with built-in security</p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/launch">
                  <Button 
                    className="h-14 px-8 bg-white text-[#FF3B69] hover:bg-white/90 
                      rounded-xl text-lg font-medium group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced mouse follower */}
      {mousePosition && (
        <motion.div 
          className="fixed pointer-events-none w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle at center, rgba(255,59,105,0.1) 0%, transparent 70%)`,
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
    </main>
  );
}
