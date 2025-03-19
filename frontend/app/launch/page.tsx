"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Lock, Shield, Rocket, Info, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define form field types
interface TokenForm {
  name: string;
  symbol: string;
  initialSupply: string;
  decimals: string;
  supplyLock: string;
  liquidityAmount: string;
}

// Define errors type
interface FormErrors {
  name?: string;
  symbol?: string;
  initialSupply?: string;
  decimals?: string;
  supplyLock?: string;
  liquidityAmount?: string;
}

export default function LaunchPage() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Form state
  const [tokenForm, setTokenForm] = useState<TokenForm>({
    name: "",
    symbol: "",
    initialSupply: "1000000000",
    decimals: "18",
    supplyLock: "70",
    liquidityAmount: "5",
  });

  // Validation
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!tokenForm.name.trim()) newErrors.name = "Token name is required";
    if (!tokenForm.symbol.trim()) newErrors.symbol = "Token symbol is required";
    if (tokenForm.symbol.length > 6)
      newErrors.symbol = "Symbol must be 6 characters or less";
    if (!tokenForm.initialSupply || parseInt(tokenForm.initialSupply) <= 0) {
      newErrors.initialSupply = "Initial supply must be greater than 0";
    }
    if (
      !tokenForm.liquidityAmount ||
      parseFloat(tokenForm.liquidityAmount) < 1
    ) {
      newErrors.liquidityAmount = "Minimum 1 CoreDAO required for liquidity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: keyof TokenForm, value: string) => {
    setTokenForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear the error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLaunch = () => {
    if (!validateForm()) return;

    setIsLaunching(true);

    // Simulate token creation
    setTimeout(() => {
      setIsLaunching(false);
      setLaunchSuccess(true);

      // Redirect after showing success popup
      setTimeout(() => {
        window.location.href = `/token/${tokenForm.symbol.toLowerCase()}`;
      }, 3000);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-[#0D0B15]">
      <Navbar />

      {/* Success Modal */}
      {launchSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
          <div className="bg-[#0D0B15] border border-[#6C5CE7]/30 rounded-xl max-w-md w-full p-6 relative">
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white"
              onClick={() => setLaunchSuccess(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-[#6C5CE7]" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-white/70 mb-4">
                Your token ${tokenForm.symbol} has been launched with rugproof
                protection
              </p>

              <p className="text-[#6C5CE7]">Redirecting to token page...</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLaunching && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#6C5CE7]/20 border-t-[#6C5CE7] animate-spin"></div>
            <p className="text-white">Launching your token...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Launch Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6C5CE7] to-[#4834D4]">
              Secure Token
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Create a rugproof token with built-in supply locking and anti-rug
            pull protection
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-md rounded-xl border border-[#6C5CE7]/20 p-6">
          <div className="flex items-center mb-6">
            <Rocket className="w-5 h-5 text-[#6C5CE7] mr-2" />
            <h2 className="text-2xl font-bold text-white">Token Details</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-white mb-2">
                Token Name <span className="text-[#6C5CE7]">*</span>
              </Label>
              <Input
                id="name"
                className={`w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="e.g. Clampify Token"
                value={tokenForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="symbol" className="text-white mb-2">
                Token Symbol <span className="text-[#6C5CE7]">*</span>
              </Label>
              <Input
                id="symbol"
                className={`w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white uppercase ${
                  errors.symbol ? "border-red-500" : ""
                }`}
                placeholder="e.g. CLAMP"
                maxLength={6}
                value={tokenForm.symbol}
                onChange={(e) =>
                  handleFormChange("symbol", e.target.value.toUpperCase())
                }
              />
              {errors.symbol && (
                <p className="mt-1 text-red-500 text-sm">{errors.symbol}</p>
              )}
              <p className="mt-1 text-white/50 text-sm">
                3-6 characters, uppercase letters only
              </p>
            </div>

            <div>
              <Label htmlFor="initialSupply" className="text-white mb-2">
                Initial Supply <span className="text-[#6C5CE7]">*</span>
              </Label>
              <Input
                id="initialSupply"
                className={`w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white ${
                  errors.initialSupply ? "border-red-500" : ""
                }`}
                type="number"
                placeholder="e.g. 1000000000"
                value={tokenForm.initialSupply}
                onChange={(e) =>
                  handleFormChange("initialSupply", e.target.value)
                }
              />
              {errors.initialSupply && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.initialSupply}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="decimals" className="text-white mb-2">
                Decimals
              </Label>
              <Select
                value={tokenForm.decimals}
                onValueChange={(value) => handleFormChange("decimals", value)}
              >
                <SelectTrigger
                  id="decimals"
                  className="w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white"
                >
                  <SelectValue placeholder="Select decimals" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-[#6C5CE7]/20 text-white">
                  <SelectItem value="6">6 decimals</SelectItem>
                  <SelectItem value="9">9 decimals</SelectItem>
                  <SelectItem value="18">18 decimals (standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="liquidityAmount" className="text-white mb-2">
                Initial Liquidity (CoreDAO){" "}
                <span className="text-[#6C5CE7]">*</span>
              </Label>
              <Input
                id="liquidityAmount"
                className={`w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white ${
                  errors.liquidityAmount ? "border-red-500" : ""
                }`}
                type="number"
                placeholder="e.g. 5"
                value={tokenForm.liquidityAmount}
                onChange={(e) =>
                  handleFormChange("liquidityAmount", e.target.value)
                }
              />
              {errors.liquidityAmount && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.liquidityAmount}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="supplyLock" className="text-white mb-2">
                Supply Lock Percentage <span className="text-[#6C5CE7]">*</span>
              </Label>
              <Select
                value={tokenForm.supplyLock}
                onValueChange={(value) => handleFormChange("supplyLock", value)}
              >
                <SelectTrigger
                  id="supplyLock"
                  className="w-full bg-black/30 border-[#6C5CE7]/20 focus:border-[#6C5CE7] text-white"
                >
                  <SelectValue placeholder="Select lock percentage" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-[#6C5CE7]/20 text-white">
                  <SelectItem value="50">50% locked</SelectItem>
                  <SelectItem value="70">70% locked</SelectItem>
                  <SelectItem value="80">80% locked</SelectItem>
                  <SelectItem value="90">90% locked</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-white/50 text-sm">
                Higher lock percentage provides more stability
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="rugProtection"
                defaultChecked={true}
                className="data-[state=checked]:bg-[#6C5CE7]"
              />
              <Label htmlFor="rugProtection" className="text-white">
                Enable Anti-Rug Protection
              </Label>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[#6C5CE7] mt-1 flex-shrink-0" />
              <div className="text-sm text-white/70">
                By launching this token, you agree to lock{" "}
                {tokenForm.supplyLock}% of the supply and enable anti-rug
                protection features. This process is irreversible.
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              className="bg-gradient-to-r from-[#6C5CE7] to-[#4834D4] hover:opacity-90 text-white px-8 py-2 rounded-xl"
              onClick={handleLaunch}
            >
              <Rocket className="mr-2 w-5 h-5" />
              Launch Token
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-3xl mx-auto mt-12 p-6 bg-black/20 backdrop-blur-md rounded-xl border border-[#6C5CE7]/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#6C5CE7]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Clampify Protection Features
              </h3>
              <p className="text-white/70">
                All tokens launched with Clampify include:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#6C5CE7] mt-1" />
              <div>
                <div className="text-white font-medium">Supply Locking</div>
                <div className="text-white/70 text-sm">
                  Prevents large dumps and stabilizes price
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#6C5CE7] mt-1" />
              <div>
                <div className="text-white font-medium">
                  Liquidity Protection
                </div>
                <div className="text-white/70 text-sm">
                  Automatically locks liquidity to prevent rug pulls
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#6C5CE7] mt-1" />
              <div>
                <div className="text-white font-medium">Wallet Limits</div>
                <div className="text-white/70 text-sm">
                  Prevents single wallets from owning too much supply
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Rocket className="w-5 h-5 text-[#6C5CE7] mt-1" />
              <div>
                <div className="text-white font-medium">Trading Safeguards</div>
                <div className="text-white/70 text-sm">
                  Transaction limits and anti-bot measures
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
