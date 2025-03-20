// Export main clients
export { PaymasterClient } from "./PaymasterClient";
export { BundlerClient } from "./BundlerClient";

// Export constants
export * from "./constants";

// Export types
export * from "./types";

// Export a convenience function to create a new PaymasterClient
import { ethers } from "ethers";
import { PaymasterClient } from "./PaymasterClient";
import { BundlerClient } from "./BundlerClient";
import { PaymasterConfig } from "./types";
import {
  CORE_TESTNET_RPC_URL,
  DEFAULT_PAYMASTER_ADDRESS,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "./constants";

/**
 * Creates a PaymasterClient with the default configuration for Core Testnet
 *
 * @param providerOrSigner - Provider or signer to use
 * @param config - Custom configuration (optional)
 * @returns A new PaymasterClient
 */
export function createPaymasterClient(
  providerOrSigner: ethers.providers.Provider | ethers.Signer,
  config?: Partial<PaymasterConfig>
): PaymasterClient {
  let provider: ethers.providers.Provider;
  let signer: ethers.Signer | undefined;

  if ("provider" in providerOrSigner) {
    // It's a signer
    signer = providerOrSigner as ethers.Signer;
    provider = signer.provider as ethers.providers.Provider;
  } else {
    // It's a provider
    provider = providerOrSigner as ethers.providers.Provider;
  }

  return new PaymasterClient(
    provider,
    {
      paymasterAddress: config?.paymasterAddress || DEFAULT_PAYMASTER_ADDRESS,
      entryPointAddress:
        config?.entryPointAddress || DEFAULT_ENTRYPOINT_ADDRESS,
      chainId: config?.chainId,
    },
    signer
  );
}

/**
 * Creates a BundlerClient with the given bundler URL
 *
 * @param bundlerUrl - URL of the bundler API
 * @param entryPointAddress - Custom entry point address (optional)
 * @returns A new BundlerClient
 */
export function createBundlerClient(
  bundlerUrl: string,
  entryPointAddress?: string
): BundlerClient {
  return new BundlerClient({
    bundlerUrl,
    entryPointAddress: entryPointAddress || DEFAULT_ENTRYPOINT_ADDRESS,
  });
}

/**
 * Create a provider for Core Testnet
 *
 * @param rpcUrl - Custom RPC URL (optional)
 * @returns JsonRpcProvider for Core Testnet
 */
export function createCoreProvider(
  rpcUrl?: string
): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(rpcUrl || CORE_TESTNET_RPC_URL);
}
