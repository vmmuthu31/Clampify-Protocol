"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlerClient = exports.PaymasterClient = void 0;
exports.createPaymasterClient = createPaymasterClient;
exports.createBundlerClient = createBundlerClient;
exports.createCoreProvider = createCoreProvider;
// Export main clients
var PaymasterClient_1 = require("./PaymasterClient");
Object.defineProperty(exports, "PaymasterClient", { enumerable: true, get: function () { return PaymasterClient_1.PaymasterClient; } });
var BundlerClient_1 = require("./BundlerClient");
Object.defineProperty(exports, "BundlerClient", { enumerable: true, get: function () { return BundlerClient_1.BundlerClient; } });
// Export constants
__exportStar(require("./constants"), exports);
// Export types
__exportStar(require("./types"), exports);
// Export a convenience function to create a new PaymasterClient
const ethers_1 = require("ethers");
const PaymasterClient_2 = require("./PaymasterClient");
const BundlerClient_2 = require("./BundlerClient");
const constants_1 = require("./constants");
/**
 * Creates a PaymasterClient with the default configuration for Core Testnet
 *
 * @param providerOrSigner - Provider or signer to use
 * @param config - Custom configuration (optional)
 * @returns A new PaymasterClient
 */
function createPaymasterClient(providerOrSigner, config) {
    let provider;
    let signer;
    if ("provider" in providerOrSigner) {
        // It's a signer
        signer = providerOrSigner;
        provider = signer.provider;
    }
    else {
        // It's a provider
        provider = providerOrSigner;
    }
    return new PaymasterClient_2.PaymasterClient(provider, {
        paymasterAddress: config?.paymasterAddress || constants_1.DEFAULT_PAYMASTER_ADDRESS,
        entryPointAddress: config?.entryPointAddress || constants_1.DEFAULT_ENTRYPOINT_ADDRESS,
        chainId: config?.chainId,
    }, signer);
}
/**
 * Creates a BundlerClient with the given bundler URL
 *
 * @param bundlerUrl - URL of the bundler API
 * @param entryPointAddress - Custom entry point address (optional)
 * @returns A new BundlerClient
 */
function createBundlerClient(bundlerUrl, entryPointAddress) {
    return new BundlerClient_2.BundlerClient({
        bundlerUrl,
        entryPointAddress: entryPointAddress || constants_1.DEFAULT_ENTRYPOINT_ADDRESS,
    });
}
/**
 * Create a provider for Core Testnet
 *
 * @param rpcUrl - Custom RPC URL (optional)
 * @returns JsonRpcProvider for Core Testnet
 */
function createCoreProvider(rpcUrl) {
    return new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl || constants_1.CORE_TESTNET_RPC_URL);
}
