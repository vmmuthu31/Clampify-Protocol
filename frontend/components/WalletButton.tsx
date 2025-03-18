import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  Wallet,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function WalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [copied, setCopied] = useState(false);

  const smartWallet = user?.linkedAccounts.find(
    (account) => account.type === "smart_wallet" || account.type === "wallet"
  );

  const address = smartWallet?.address || "";
  const truncatedAddress = address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "";

  // Handle copy address
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state when not ready
  if (!ready) {
    return (
      <Button
        variant="outline"
        className="cursor-not-allowed opacity-70"
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Not authenticated - Connect wallet button
  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  // Authenticated - Wallet info and dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 text-indigo-700 hover:text-indigo-800 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100"
        >
          <div className="h-6 w-6 rounded-full bg-indigo-100 mr-2 flex items-center justify-center">
            <Wallet className="h-3 w-3 text-indigo-700" />
          </div>
          <span className="font-medium">{truncatedAddress}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-gray-500">Connected Wallet</p>
            <p className="font-mono text-xs truncate">{address}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <TooltipProvider>
          <Tooltip open={copied}>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={copyAddress}
                className="cursor-pointer"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                <span>{copied ? "Copied!" : "Copy Address"}</span>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Copied to clipboard!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuItem className="cursor-pointer" asChild>
          <a
            href={`https://scan.test2.btcs.network/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="text-red-600 cursor-pointer hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WalletButton;
