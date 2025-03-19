import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./global.css";
import ClientBody from "./ClientBody";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "ClampFi - Supply-Clamping Token Launchpad",
  description:
    "Launch and trade tokens on CoreDAO with mathematically impossible rug pulls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geist.variable} font-sans antialiased bg-[#0A0A0A] bg-mesh min-h-screen`}
      >
        
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
