"use client";

import { useEffect, useState } from "react";
import Atropos from "atropos/react";
import "atropos/css";
import Image from "next/image";

export default function Loader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cleanup function
    return () => {
      setMounted(false);
    };
  }, []);

  // Initial loading spinner before Atropos mounts
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="relative w-full max-w-md">
        <Atropos
          activeOffset={40}
          shadowScale={1.05}
          rotateXMax={15}
          rotateYMax={15}
          className="atropos-loader"
          highlight={true}
          shadow={true}
          shadowOffset={50}
        >
          <div className="atropos-scale">
            <div className="atropos-rotate">
              <div
                className="atropos-inner flex flex-col items-center p-10 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,20,46,0.9) 0%, rgba(61,18,89,0.9) 100%)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                }}
              >
                {/* Glowing effects in background */}
                <div
                  className="absolute -z-10 top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"
                  data-atropos-offset="-10"
                ></div>
                <div
                  className="absolute -z-10 bottom-1/4 right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-3xl"
                  data-atropos-offset="-8"
                ></div>

                {/* Logo with enhanced floating animation */}
                <div
                  className="w-32 h-32 mb-8 relative"
                  data-atropos-offset="15"
                >
                  <div
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl transform scale-90"
                    data-atropos-offset="5"
                  ></div>
                  <Image
                    src="/logo.svg"
                    alt="Clampify Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                    width={128}
                    height={128}
                    style={{
                      animation: "float 3s ease-in-out infinite",
                    }}
                  />
                </div>

                {/* Core and BTC with orbiting animation */}
                <div
                  className="relative w-48 h-48 mb-8"
                  data-atropos-offset="10"
                >
                  {/* Glow effects */}
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>

                  {/* Core image */}
                  <Image
                    src="/core.png"
                    alt="Core"
                    className="w-full h-full object-contain"
                    width={192}
                    height={192}
                    style={{
                      animation:
                        "pulse 2s ease-in-out infinite, spin 12s linear infinite",
                    }}
                    data-atropos-offset="8"
                  />

                  {/* Orbiting BTC */}
                  <div
                    className="absolute inset-0"
                    style={{ animation: "orbit 8s linear infinite" }}
                  >
                    <Image
                      src="/btc.png"
                      alt="Bitcoin"
                      className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                      width={64}
                      height={64}
                      data-atropos-offset="20"
                    />
                  </div>
                </div>

                {/* Clampify text with enhanced gradient */}
                <div
                  className="text-3xl font-bold tracking-wider"
                  style={{
                    background:
                      "linear-gradient(90deg, #60a5fa, #c084fc, #60a5fa)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "gradient 3s linear infinite",
                  }}
                  data-atropos-offset="12"
                >
                  CLAMPIFY
                </div>

                {/* Loading text */}
                <div
                  className="mt-2 text-sm text-blue-200 tracking-widest"
                  data-atropos-offset="6"
                  style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                >
                  LOADING...
                </div>

                {/* Enhanced progress bar */}
                <div
                  className="w-full mt-6 bg-black/30 rounded-full h-2.5 overflow-hidden"
                  data-atropos-offset="4"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                      backgroundSize: "200% auto",
                      animation:
                        "progressAnimation 2s linear infinite, gradient 3s linear infinite",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Atropos>
      </div>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes progressAnimation {
          0% {
            width: 5%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
}
