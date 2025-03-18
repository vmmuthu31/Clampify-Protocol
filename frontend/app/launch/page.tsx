import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Shield, Timer } from "lucide-react";

export default function LaunchPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0A041A]">
      <div className="container mx-auto px-4 pt-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Token Info */}
          <div className="rounded-[24px] bg-gradient-to-b from-[#FF3B691A] to-[#FF3B6900] p-[1px]">
            <div className="rounded-[24px] bg-[#130B1D] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FF3B69] flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h2 className="text-[#FF3B69] text-2xl font-bold">Token Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-[#FF3B69] text-base mb-3 block">Token Name</label>
                  <Input 
                    placeholder="e.g. COSMIC PEPE" 
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl" 
                  />
                </div>
                <div>
                  <label className="text-[#FF3B69] text-base mb-3 block">Token Symbol</label>
                  <Input 
                    placeholder="e.g. $CPEPE" 
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl" 
                  />
                </div>
                <div>
                  <label className="text-[#FF3B69] text-base mb-3 block">Total Supply</label>
                  <Input 
                    type="number" 
                    placeholder="1,000,000,000,000" 
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Security Settings */}
          <div className="rounded-[24px] bg-gradient-to-b from-[#FF3B691A] to-[#FF3B6900] p-[1px]">
            <div className="rounded-[24px] bg-[#130B1D] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#FF3B69] flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h2 className="text-[#FF3B69] text-2xl font-bold">Security</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#1C3B38]">
                      <Lock className="w-6 h-6 text-[#00FFA3]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Creator Lock</h3>
                      <p className="text-[#FF3B69]">Lock period (min 30 days)</p>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    placeholder="30"
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#1C1A45]">
                      <Shield className="w-6 h-6 text-[#618AFF]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Max Sell</h3>
                      <p className="text-[#FF3B69]">Max sell % per day</p>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    placeholder="3"
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#2E1C3B]">
                      <Timer className="w-6 h-6 text-[#FF3B69]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Liquidity Lock</h3>
                      <p className="text-[#FF3B69]">Lock period (min 180 days)</p>
                    </div>
                  </div>
                  <Input 
                    type="number"
                    placeholder="180"
                    className="h-[52px] bg-[#0A041A] border-[#ffffff1a] focus:border-[#FF3B69] text-white placeholder:text-white/20 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center mt-8">
          <Button 
            className="h-14 px-16 bg-gradient-to-r from-[#FF3B69] to-[#FF3E9C] 
              hover:opacity-90 rounded-xl text-lg font-semibold"
          >
            Launch Token
          </Button>
        </div>
      </div>
    </main>
  );
} 