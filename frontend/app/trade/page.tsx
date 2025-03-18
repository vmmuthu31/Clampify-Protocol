import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Settings, Info, Lock } from "lucide-react";

export default function TradePage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-xl mx-auto">
        {/* Swap Interface */}
        <div className="glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Trade</h2>
            <Button variant="ghost" size="icon" className="text-white/70">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* From Token */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">From</span>
                <span className="text-sm text-white/70">Balance: 0.00</span>
              </div>
              <div className="flex gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  className="text-2xl bg-transparent border-none" 
                />
                <Button variant="outline" className="min-w-[120px] border-white/10">
                  Select
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white/5 hover:bg-white/10"
              >
                <ArrowDownUp className="w-4 h-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/70">To</span>
                <span className="text-sm text-white/70">Balance: 0.00</span>
              </div>
              <div className="flex gap-4">
                <Input 
                  type="number" 
                  placeholder="0.0" 
                  className="text-2xl bg-transparent border-none" 
                />
                <Button variant="outline" className="min-w-[120px] border-white/10">
                  Select
                </Button>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex justify-between text-sm text-white/70">
              <span>Price Impact</span>
              <span>{"<0.01%"}</span>
            </div>
          </div>

          <Button 
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 h-12"
          >
            Connect Wallet
          </Button>
        </div>

        {/* Security Info */}
        <div className="mt-6 bg-white/5 rounded-lg p-4 flex items-start gap-4">
          <Lock className="w-5 h-5 text-green-400 mt-1" />
          <div className="text-sm text-white/70">
            All tokens traded on ClampFi have supply clamping enabled, making rug pulls mathematically impossible.
          </div>
        </div>
      </div>
    </div>
  );
} 