export { PaymasterClient } from "./PaymasterClient";
export { BundlerClient } from "./BundlerClient";
export * from "./constants";
export * from "./types";
import { ethers } from "ethers";
import { PaymasterClient } from "./PaymasterClient";
import { BundlerClient } from "./BundlerClient";
import { PaymasterConfig } from "./types";
/**
 * Creates a PaymasterClient with the default configuration for Core Testnet
 *
 * @param providerOrSigner - Provider or signer to use
 * @param config - Custom configuration (optional)
 * @returns A new PaymasterClient
 */
export declare function createPaymasterClient(providerOrSigner: ethers.providers.Provider | ethers.Signer, config?: Partial<PaymasterConfig>): PaymasterClient;
/**
 * Creates a BundlerClient with the given bundler URL
 *
 * @param bundlerUrl - URL of the bundler API
 * @param entryPointAddress - Custom entry point address (optional)
 * @returns A new BundlerClient
 */
export declare function createBundlerClient(bundlerUrl: string, entryPointAddress?: string): BundlerClient;
/**
 * Create a provider for Core Testnet
 *
 * @param rpcUrl - Custom RPC URL (optional)
 * @returns JsonRpcProvider for Core Testnet
 */
export declare function createCoreProvider(rpcUrl?: string): ethers.providers.JsonRpcProvider;
