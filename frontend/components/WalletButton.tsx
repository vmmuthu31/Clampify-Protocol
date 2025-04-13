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
        className="cursor-not-allowed opacity-70 rounded-xl h-10 px-4 bg-black/5 border border-gray-200 dark:border-gray-800"
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
        className="bg-black text-white hover:bg-black/90 rounded-xl h-10 px-4 shadow-sm transition-all"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-black text-white hover:bg-black/90 rounded-xl border-none h-10 px-4 shadow-sm transition-all"
        >
          <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center mr-2">
            <Wallet className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-medium">{truncatedAddress}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0 border-0 rounded-xl overflow-hidden shadow-lg bg-black text-white"
      >
        <div className="flex flex-col p-4 bg-white/5">
          <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
          <p className="font-mono text-sm truncate">{address}</p>
        </div>

        <div className="p-1">
          <TooltipProvider>
            <Tooltip open={copied}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={copyAddress}
                  className="cursor-pointer flex items-center py-2.5 rounded-lg transition-colors hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-black text-white border-gray-800"
              >
                <p>Copied to clipboard!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuItem
            className="cursor-pointer py-2.5 rounded-lg transition-colors hover:bg-white/10"
            asChild
          >
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

          <DropdownMenuItem
            onClick={logout}
            className="cursor-pointer py-2.5 rounded-lg transition-colors hover:bg-red-900/30 text-red-400 mt-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WalletButton;
