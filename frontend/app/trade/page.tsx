import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Settings } from "lucide-react";

export default function TradePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0A041A]">
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-xl mx-auto">
          <h1 className="text-5xl font-bold gradient-text mb-4 text-center">Trade</h1>
          <p className="text-orange-500/80 text-center mb-12">Swap tokens with built-in rug-pull protection</p>

          {/* Swap Interface */}
          <div className="rounded-[24px] bg-gradient-to-b from-[#FF3B691A] to-[#FF3B6900] p-[1px]">
            <div className="rounded-[24px] bg-[#130B1D] p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[#FF3B69] text-2xl font-bold">Swap</h2>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              {/* From Token */}
              <div className="space-y-4">
                <div className="bg-[#0A041A] rounded-xl p-4 border border-[#ffffff1a]">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">From</span>
                    <span className="text-white/60">Balance: 0.00</span>
                  </div>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      placeholder="0.0" 
                      className="text-2xl bg-transparent border-none text-white placeholder:text-white/20" 
                    />
                    <Button variant="outline" className="min-w-[120px] border-[#ffffff1a] hover:bg-[#FF3B691A] text-white">
                      Select
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center -my-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl bg-[#130B1D] border border-[#ffffff1a] hover:bg-[#FF3B691A]"
                  >
                    <ArrowDownUp className="w-4 h-4 text-[#FF3B69]" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="bg-[#0A041A] rounded-xl p-4 border border-[#ffffff1a]">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60">To</span>
                    <span className="text-white/60">Balance: 0.00</span>
                  </div>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      placeholder="0.0" 
                      className="text-2xl bg-transparent border-none text-white placeholder:text-white/20" 
                    />
                    <Button variant="outline" className="min-w-[120px] border-[#ffffff1a] hover:bg-[#FF3B691A] text-white">
                      Select
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="mt-4 p-3 bg-[#0A041A] rounded-xl border border-[#ffffff1a]">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Price Impact</span>
                  <span className="text-[#00FFA3]">{"<0.01%"}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 h-14 bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] 
                  hover:opacity-90 rounded-xl text-lg font-semibold"
              >
                Connect Wallet
              </Button>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 rounded-xl bg-[#130B1D] p-4 flex items-start gap-4 border border-[#ffffff1a]">
            <div className="text-sm text-white/60">
              All tokens traded on ClampFi have supply clamping enabled, making rug pulls mathematically impossible.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 