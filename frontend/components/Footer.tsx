import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-[#6C5CE7]/20 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Lock className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-white text-xl font-bold">Clampify</span>
            </div>
            <p className="text-white/60">The rugproof token platform</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-medium mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/launch"
                    className="text-white/60 hover:text-white"
                  >
                    Token Launch
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="text-white/60 hover:text-white"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white/60 hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#6C5CE7]/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 mb-4 md:mb-0">
            © 2025 Clampify Protocol. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <Link
              target="_blank"
              href="https://x.com/Clampifydotfun"
              className="text-white/50 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full border border-[#6C5CE7]/20 flex items-center justify-center">
                <span className="text-lg">𝕏</span>
              </div>
            </Link>
            <Link
              target="_blank"
              href="https://www.clampify.fun/"
              className="text-white/50 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full border border-[#6C5CE7]/20 flex items-center justify-center">
                <span className="text-lg">🌐</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
