"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlerClient = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
const ethers_1 = require("ethers");
/**
 * Client for interacting with ERC-4337 bundlers
 */
class BundlerClient {
    /**
     * Creates a new BundlerClient
     *
     * @param config - Bundler client configuration
     */
    constructor(config) {
        this.nextId = 1;
        this.config = {
            ...config,
            entryPointAddress: config.entryPointAddress || constants_1.DEFAULT_ENTRYPOINT_ADDRESS,
        };
        this.fetchFn = config.customFetch || fetch;
    }
    /**
     * Send a user operation to the bundler
     *
     * @param userOp - User operation to send
     * @returns The user operation hash
     */
    async sendUserOperation(userOp) {
        const response = await this._makeRpcCall("eth_sendUserOperation", [
            userOp,
            this.config.entryPointAddress,
        ]);
        return response;
    }
    /**
     * Get the status of a user operation
     *
     * @param userOpHash - User operation hash
     * @returns The operation status
     */
    async getUserOperationStatus(userOpHash) {
        try {
            const response = await this._makeRpcCall("eth_getUserOperationReceipt", [
                userOpHash,
            ]);
            if (!response) {
                return { state: types_1.UserOperationState.PENDING };
            }
            const receipt = response;
            return {
                state: types_1.UserOperationState.COMPLETED,
                transactionHash: receipt.transactionHash,
                blockNumber: parseInt(receipt.blockNumber, 16),
                actualGasCost: ethers_1.BigNumber.from(receipt.actualGasCost),
                success: receipt.success,
            };
        }
        catch (error) {
            return {
                state: types_1.UserOperationState.FAILED,
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
    async estimateUserOperationGas(userOp) {
        const response = await this._makeRpcCall("eth_estimateUserOperationGas", [
            userOp,
            this.config.entryPointAddress,
        ]);
        const result = response;
        return {
            preVerificationGas: ethers_1.BigNumber.from(result.preVerificationGas),
            verificationGas: ethers_1.BigNumber.from(result.verificationGas),
            callGasLimit: ethers_1.BigNumber.from(result.callGasLimit),
        };
    }
    /**
     * Get the supported entry points by the bundler
     *
     * @returns Array of supported entry point addresses
     */
    async getSupportedEntryPoints() {
        return this._makeRpcCall("eth_supportedEntryPoints", []);
    }
    /**
     * Check if the bundler supports a specific entry point
     *
     * @param entryPointAddress - Entry point address to check
     * @returns True if the entry point is supported
     */
    async isEntryPointSupported(entryPointAddress) {
        const supportedEntryPoints = await this.getSupportedEntryPoints();
        return supportedEntryPoints.some((ep) => ep.toLowerCase() === entryPointAddress.toLowerCase());
    }
    /**
     * Make an RPC call to the bundler
     *
     * @param method - RPC method
     * @param params - RPC parameters
     * @returns The RPC response
     * @private
     */
    async _makeRpcCall(method, params) {
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
            throw new Error(`Bundler error: ${data.error.message || JSON.stringify(data.error)}`);
        }
        return data.result;
    }
}
exports.BundlerClient = BundlerClient;
