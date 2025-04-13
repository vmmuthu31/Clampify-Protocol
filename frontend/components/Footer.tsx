import Link from "next/link";

function Footer() {
  return (
    <footer className="bg-black py-8 pb-10 md:py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at center, rgba(20, 20, 20, 1) 0%, rgba(0, 0, 0, 1) 80%)",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with arrows */}
        <div className="flex items-center mb-8 md:mb-14 text-white/60 text-sm overflow-hidden">
          <span className="mr-2 md:mr-3 text-xs md:text-sm">{">>>>"}</span>
          <span className="mr-2 md:mr-3 text-xs md:text-sm">Footer</span>
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
          </div>
        </div>

        {/* Main footer content with 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 gap-y-10 md:gap-y-12 mb-12 md:mb-20">
          {/* Message */}
          <div className="md:col-span-6 md:pr-8">
            <p className="text-white text-lg md:text-xl leading-relaxed">
              clampify isn&apos;t just a token launcher—it&apos;s a movement. a
              secure, trustless protocol built to protect creators and holders
              alike. no rugs. no whales. no chaos. just code, community, and the
              next era of memecoins.
            </p>
          </div>

          {/* Navigation and Socials on mobile - side by side */}
          <div className="grid grid-cols-2 gap-8 md:hidden">
            <div>
              <h3 className="text-white text-lg font-medium mb-4">
                NAVIGATION
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-white hover:text-[#FFAE5C]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-white hover:text-[#FFAE5C]"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white hover:text-[#FFAE5C]"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">SOCIALS</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://medium.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#FFAE5C]"
                  >
                    Medium
                  </a>
                </li>
                <li>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#FFAE5C]"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#FFAE5C]"
                  >
                    Twitter (X)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation - Desktop Only */}
          <div className="hidden md:block md:col-span-3">
            <h3 className="text-white text-xl font-medium mb-6">NAVIGATION</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-white hover:text-[#FFAE5C]">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-white hover:text-[#FFAE5C]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-[#FFAE5C]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials - Desktop Only */}
          <div className="hidden md:block md:col-span-3">
            <h3 className="text-white text-xl font-medium mb-6">SOCIALS</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://medium.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FFAE5C]"
                >
                  Medium
                </a>
              </li>
              <li>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FFAE5C]"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FFAE5C]"
                >
                  Twitter (X)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Logo Section with L-shaped borders */}
        <div className="relative flex justify-center items-center py-10 md:py-16 mb-8 md:mb-10">
          {/* Box with L-shaped corners */}
          <div className="relative w-[95%] md:w-[90%] max-w-[900px] h-[120px] md:h-[180px] flex items-center justify-center">
            {/* Background glow effect */}
            <div
              className="absolute inset-0 opacity-40 rounded-[100%] blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255, 174, 92, 0.2) 0%, rgba(30, 20, 10, 0.1) 40%, transparent 70%)",
                width: "140%",
                height: "140%",
                left: "-20%",
                top: "-20%",
              }}
            ></div>

            {/* Additional inner glow */}
            <div
              className="absolute inset-0 opacity-25 rounded-[100%] blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255, 174, 92, 0.3) 0%, transparent 50%)",
                width: "100%",
                height: "100%",
              }}
            ></div>

            {/* L corners - visible only on larger screens */}
            <div className="hidden md:block">
              {/* Top-left L */}
              <div className="absolute top-0 left-0 w-[80px] h-[80px]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute top-0 left-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Top-right L */}
              <div className="absolute top-0 right-0 w-[80px] h-[80px]">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute top-0 right-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Bottom-left L */}
              <div className="absolute bottom-0 left-0 w-[80px] h-[80px]">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute bottom-0 left-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Bottom-right L */}
              <div className="absolute bottom-0 right-0 w-[80px] h-[80px]">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute bottom-0 right-0 h-full w-[1px] bg-white/60"></div>
              </div>
            </div>

            {/* L corners - smaller ones for mobile */}
            <div className="block md:hidden">
              {/* Top-left L */}
              <div className="absolute top-0 left-0 w-[40px] h-[40px]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute top-0 left-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Top-right L */}
              <div className="absolute top-0 right-0 w-[40px] h-[40px]">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute top-0 right-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Bottom-left L */}
              <div className="absolute bottom-0 left-0 w-[40px] h-[40px]">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute bottom-0 left-0 h-full w-[1px] bg-white/60"></div>
              </div>

              {/* Bottom-right L */}
              <div className="absolute bottom-0 right-0 w-[40px] h-[40px]">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white/60"></div>
                <div className="absolute bottom-0 right-0 h-full w-[1px] bg-white/60"></div>
              </div>
            </div>

            {/* Logo text */}
            <h1 className="text-[#FFAE5C] text-4xl md:text-8xl font-serif tracking-wide drop-shadow-lg relative z-10">
              CLAMPIFY.FUN
            </h1>
          </div>
        </div>

        {/* Single bottom separator line */}
        <div
          className="w-full h-[1px] mb-4"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.2) 80%, transparent 100%)",
          }}
        ></div>

        {/* Bottom links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 py-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-xs md:text-base">
            <Link href="/privacy" className="text-white/60 hover:text-white">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white">
              TERMS OF SERVICE
            </Link>
            <Link href="/disclaimer" className="text-white/60 hover:text-white">
              RISK DISCLAIMER
            </Link>
          </div>
          <div className="text-white/60 text-xs md:text-base text-center mt-4 md:mt-0">
            ©2025 CLAMPIFY™ // ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
