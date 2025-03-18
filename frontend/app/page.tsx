import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { 
  Sparkles, Trophy, Rocket, Flame, TrendingUp, 
  Lock, Shield, ChartBar, Timer, Zap
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] bg-grid pt-16 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-orange-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,94,0,0.1)_0%,transparent_65%)]" />
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Header */}
          <div className="flex flex-col items-center justify-center space-y-6 pt-20 text-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 animate-pulse blur-xl bg-orange-500/30 rounded-full" />
              <Flame className="w-20 h-20 text-orange-500 relative z-10" />
            </div>
            <h1 className="text-7xl font-bold gradient-text animate-glow tracking-tight">
              CLAMPFI
            </h1>
            <p className="text-2xl text-orange-500/80 max-w-[600px] font-medium">
              First Supply-Clamping Meme Token Launchpad on CoreDAO 🚀
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {[
                { icon: <Lock className="w-4 h-4" />, text: "Anti-Rug" },
                { icon: <Shield className="w-4 h-4" />, text: "Supply Clamping" },
                { icon: <Timer className="w-4 h-4" />, text: "Time Locks" },
                { icon: <ChartBar className="w-4 h-4" />, text: "Bonding Curve" },
              ].map((pill, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-500">
                  {pill.icon}
                  <span className="text-sm font-medium">{pill.text}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <Link href="/launch">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 text-lg h-14 px-8 animate-pulse rounded-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  Launch Token
                </Button>
              </Link>
              <Link href="/trade">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg h-14 px-8 border-orange-500/50 hover:bg-orange-500/10 rounded-xl"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Trade Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Hot Token Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="gradient-border rounded-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />
              <div className="bg-black/90 rounded-xl p-8 glass-effect">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-yellow-500 animate-pulse" />
                  <h2 className="text-3xl font-bold text-yellow-500">KING OF THE HILL</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-4xl font-bold gradient-text">$CORE</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-orange-500/80">
                        <span>Market Cap</span>
                        <span className="text-white">$1,234,567</span>
                      </div>
                      <div className="h-3 bg-orange-950/50 rounded-full overflow-hidden glow-shadow">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 w-[75%] animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="text-orange-500/80">24h Volume</span>
                      <span className="font-bold text-white">$345,678</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-orange-500/80">Supply Locked</span>
                      <span className="font-bold text-white">75.5%</span>
                    </div>
                    <Button className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 rounded-xl">
                      Trade Now 🚀
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Tokens */}
          <div className="mt-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold gradient-text flex items-center gap-3">
                <Flame className="w-8 h-8 animate-pulse" />
                Trending Launches
              </h2>
              <Button variant="outline" className="border-orange-500/50 hover:bg-orange-500/10">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} 
                  className="bg-black/50 rounded-xl border border-orange-500/20 p-6 hover:border-orange-500/50 transition-all hover:glow-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xl font-bold text-white flex items-center gap-2">
                        $TOKEN{i + 1}
                        <Lock className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-orange-500/80">MC: $123,456</div>
                    </div>
                    <Button variant="outline" size="sm" className="border-orange-500/50 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      Trade
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-500/80">Supply Locked</span>
                      <span className="text-white">89%</span>
                    </div>
                    <div className="h-2 bg-orange-950/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-1000" 
                        style={{width: `${60 + i * 15}%`}}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-500/80">Time Lock</span>
                      <span className="text-green-500">180 days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats with Glow Effect */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Launches", value: "1,234 🚀", icon: <Rocket className="w-6 h-6" /> },
                { label: "Total Locked Value", value: "$12.3M 🔒", icon: <Lock className="w-6 h-6" /> },
                { label: "Active Traders", value: "5,678 👥", icon: <Flame className="w-6 h-6" /> },
              ].map((stat, i) => (
                <div key={i} 
                  className="bg-black/50 rounded-xl border border-orange-500/20 p-6 text-center hover:glow-shadow transition-all group hover:border-orange-500/50"
                >
                  <div className="text-orange-500 mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-orange-500/80 text-sm mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
