import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Shield, Timer, Info } from "lucide-react";

export default function LaunchPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold gradient-text mb-6">Launch Your Token</h1>
        
        {/* Token Creation Form */}
        <div className="glass rounded-xl p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Token Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Token Name</label>
                <Input placeholder="e.g. My Awesome Token" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Token Symbol</label>
                <Input placeholder="e.g. $AWESOME" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Total Supply</label>
              <Input type="number" placeholder="1,000,000" />
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Security Settings</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
                <Lock className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h3 className="font-medium text-white">Creator Token Lock</h3>
                  <p className="text-sm text-white/70 mb-3">Minimum 30 days lock period required</p>
                  <Input type="number" placeholder="Lock period in days (min 30)" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
                <Shield className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h3 className="font-medium text-white">Maximum Sell Limit</h3>
                  <p className="text-sm text-white/70 mb-3">Maximum tokens that can be sold per day</p>
                  <Input type="number" placeholder="Max sell % per wallet per day" />
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
                <Timer className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h3 className="font-medium text-white">Liquidity Lock</h3>
                  <p className="text-sm text-white/70 mb-3">Minimum 180 days liquidity lock required</p>
                  <Input type="number" placeholder="Lock period in days (min 180)" />
                </div>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 h-14 text-lg"
          >
            Create Token
          </Button>

          <div className="bg-white/5 rounded-lg p-4 flex items-start gap-4">
            <Info className="w-5 h-5 text-orange-400 mt-1" />
            <div className="text-sm text-white/70">
              By creating a token, you agree to lock the specified amount of creator tokens and provide liquidity that will be locked for the specified period.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 