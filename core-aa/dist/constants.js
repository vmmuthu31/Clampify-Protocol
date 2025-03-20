"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_OPERATION_ABI = exports.ENTRYPOINT_ABI = exports.PAYMASTER_ABI = exports.DEFAULT_ENTRYPOINT_ADDRESS = exports.DEFAULT_PAYMASTER_ADDRESS = exports.CORE_TESTNET_EXPLORER_URL = exports.CORE_TESTNET_RPC_URL = exports.CORE_TESTNET_CHAIN_ID = void 0;
/**
 * Core Testnet Chain ID
 */
exports.CORE_TESTNET_CHAIN_ID = 1114;
/**
 * Core Network RPC URL
 */
exports.CORE_TESTNET_RPC_URL = "https://rpc.test2.btcs.network";
/**
 * Core Network Explorer URL
 */
exports.CORE_TESTNET_EXPLORER_URL = "https://scan.test2.btcs.network";
/**
 * Deployed Paymaster address
 */
exports.DEFAULT_PAYMASTER_ADDRESS = "0x9A5e0F8D2153c8391b098FfCB2404149D7e0b402";
/**
 * Deployed EntryPoint address
 */
exports.DEFAULT_ENTRYPOINT_ADDRESS = "0x6136Bed7B15ebc86830c642500F6aeA304A6aa95";
/**
 * SimplePaymaster ABI
 */
exports.PAYMASTER_ABI = [
    // Read functions
    "function entryPoint() external view returns (address)",
    "function whitelistedAccounts(address) external view returns (bool)",
    "function accountGasLimits(address) external view returns (uint256)",
    "function accountGasUsed(address) external view returns (uint256)",
    "function isEnabled() external view returns (bool)",
    "function getBalance() external view returns (uint256)",
    // Write functions
    "function deposit() external payable",
    "function withdraw(uint256 amount) external",
    "function setEnabled(bool _enabled) external",
    "function setWhitelistedAccount(address account, bool whitelisted) external",
    "function setAccountGasLimit(address account, uint256 gasLimit) external",
    "function batchSetWhitelistedAccounts(address[] calldata accounts, bool whitelisted) external",
    "function resetAccountGasUsed(address account) external",
    // Events
    "event AccountWhitelisted(address indexed account, bool whitelisted)",
    "event AccountGasLimitSet(address indexed account, uint256 gasLimit)",
    "event PaymasterDeposited(address indexed sender, uint256 amount)",
    "event PaymasterWithdrawn(address indexed recipient, uint256 amount)",
    "event GasPaymentMade(address indexed account, uint256 gasAmount)",
];
/**
 * EntryPoint ABI (simplified, only methods needed for the Paymaster)
 */
exports.ENTRYPOINT_ABI = [
    "function depositTo(address account) external payable",
    "function getDepositInfo(address account) external view returns (tuple(uint112 deposit, bool staked, uint112 stake, uint32 unstakeDelaySec, uint64 withdrawTime))",
    "function withdrawTo(address payable withdrawAddress, uint256 amount) external",
];
/**
 * User Operation ABI
 */
exports.USER_OPERATION_ABI = [
    "function sender() external view returns (address)",
    "function nonce() external view returns (uint256)",
    "function initCode() external view returns (bytes)",
    "function callData() external view returns (bytes)",
    "function callGasLimit() external view returns (uint256)",
    "function verificationGasLimit() external view returns (uint256)",
    "function preVerificationGas() external view returns (uint256)",
    "function maxFeePerGas() external view returns (uint256)",
    "function maxPriorityFeePerGas() external view returns (uint256)",
    "function paymasterAndData() external view returns (bytes)",
    "function signature() external view returns (bytes)",
];
