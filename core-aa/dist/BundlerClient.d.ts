import { UserOperation, UserOperationStatus } from "./types";
import { BigNumber } from "ethers";
/**
 * Bundler client configuration
 */
export interface BundlerClientConfig {
    /**
     * Bundler RPC URL
     */
    bundlerUrl: string;
    /**
     * EntryPoint address
     */
    entryPointAddress?: string;
    /**
     * Chain ID
     */
    chainId?: number;
    /**
     * Custom fetch function (for environments like React Native)
     */
    customFetch?: typeof fetch;
}
/**
 * Client for interacting with ERC-4337 bundlers
 */
export declare class BundlerClient {
    private readonly config;
    private readonly fetchFn;
    private nextId;
    /**
     * Creates a new BundlerClient
     *
     * @param config - Bundler client configuration
     */
    constructor(config: BundlerClientConfig);
    /**
     * Send a user operation to the bundler
     *
     * @param userOp - User operation to send
     * @returns The user operation hash
     */
    sendUserOperation(userOp: Partial<UserOperation>): Promise<string>;
    /**
     * Get the status of a user operation
     *
     * @param userOpHash - User operation hash
     * @returns The operation status
     */
    getUserOperationStatus(userOpHash: string): Promise<UserOperationStatus>;
    /**
     * Estimate gas for a user operation
     *
     * @param userOp - User operation to estimate gas for
     * @returns Gas estimates for the operation
     */
    estimateUserOperationGas(userOp: Partial<UserOperation>): Promise<{
        preVerificationGas: BigNumber;
        verificationGas: BigNumber;
        callGasLimit: BigNumber;
    }>;
    /**
     * Get the supported entry points by the bundler
     *
     * @returns Array of supported entry point addresses
     */
    getSupportedEntryPoints(): Promise<string[]>;
    /**
     * Check if the bundler supports a specific entry point
     *
     * @param entryPointAddress - Entry point address to check
     * @returns True if the entry point is supported
     */
    isEntryPointSupported(entryPointAddress: string): Promise<boolean>;
    /**
     * Make an RPC call to the bundler
     *
     * @param method - RPC method
     * @param params - RPC parameters
     * @returns The RPC response
     * @private
     */
    private _makeRpcCall;
}
