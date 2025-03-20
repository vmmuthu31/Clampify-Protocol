import {
  UserOperation,
  UserOperationStatus,
  UserOperationState,
} from "./types";
import { DEFAULT_ENTRYPOINT_ADDRESS } from "./constants";
import { BigNumber, ethers } from "ethers";

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
export class BundlerClient {
  private readonly config: BundlerClientConfig;
  private readonly fetchFn: typeof fetch;
  private nextId = 1;

  /**
   * Creates a new BundlerClient
   *
   * @param config - Bundler client configuration
   */
  constructor(config: BundlerClientConfig) {
    this.config = {
      ...config,
      entryPointAddress: config.entryPointAddress || DEFAULT_ENTRYPOINT_ADDRESS,
    };
    this.fetchFn = config.customFetch || fetch;
  }

  /**
   * Send a user operation to the bundler
   *
   * @param userOp - User operation to send
   * @returns The user operation hash
   */
  public async sendUserOperation(
    userOp: Partial<UserOperation>
  ): Promise<string> {
    const response = await this._makeRpcCall("eth_sendUserOperation", [
      userOp,
      this.config.entryPointAddress,
    ]);

    return response as string;
  }

  /**
   * Get the status of a user operation
   *
   * @param userOpHash - User operation hash
   * @returns The operation status
   */
  public async getUserOperationStatus(
    userOpHash: string
  ): Promise<UserOperationStatus> {
    try {
      const response = await this._makeRpcCall("eth_getUserOperationReceipt", [
        userOpHash,
      ]);

      if (!response) {
        return { state: UserOperationState.PENDING };
      }

      const receipt = response as any;
      return {
        state: UserOperationState.COMPLETED,
        transactionHash: receipt.transactionHash,
        blockNumber: parseInt(receipt.blockNumber, 16),
        actualGasCost: BigNumber.from(receipt.actualGasCost),
        success: receipt.success,
      };
    } catch (error: any) {
      return {
        state: UserOperationState.FAILED,
        error: error.message,
      };
    }
  }

  /**
   * Estimate gas for a user operation
   *
   * @param userOp - User operation to estimate gas for
   * @returns Gas estimates for the operation
   */
  public async estimateUserOperationGas(
    userOp: Partial<UserOperation>
  ): Promise<{
    preVerificationGas: BigNumber;
    verificationGas: BigNumber;
    callGasLimit: BigNumber;
  }> {
    const response = await this._makeRpcCall("eth_estimateUserOperationGas", [
      userOp,
      this.config.entryPointAddress,
    ]);

    const result = response as any;
    return {
      preVerificationGas: BigNumber.from(result.preVerificationGas),
      verificationGas: BigNumber.from(result.verificationGas),
      callGasLimit: BigNumber.from(result.callGasLimit),
    };
  }

  /**
   * Get the supported entry points by the bundler
   *
   * @returns Array of supported entry point addresses
   */
  public async getSupportedEntryPoints(): Promise<string[]> {
    return this._makeRpcCall("eth_supportedEntryPoints", []) as Promise<
      string[]
    >;
  }

  /**
   * Check if the bundler supports a specific entry point
   *
   * @param entryPointAddress - Entry point address to check
   * @returns True if the entry point is supported
   */
  public async isEntryPointSupported(
    entryPointAddress: string
  ): Promise<boolean> {
    const supportedEntryPoints = await this.getSupportedEntryPoints();
    return supportedEntryPoints.some(
      (ep) => ep.toLowerCase() === entryPointAddress.toLowerCase()
    );
  }

  /**
   * Make an RPC call to the bundler
   *
   * @param method - RPC method
   * @param params - RPC parameters
   * @returns The RPC response
   * @private
   */
  private async _makeRpcCall(method: string, params: any[]): Promise<any> {
    const response = await this.fetchFn(this.config.bundlerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: this.nextId++,
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(
        `Bundler error: ${data.error.message || JSON.stringify(data.error)}`
      );
    }

    return data.result;
  }
}
