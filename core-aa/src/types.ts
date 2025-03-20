import { BigNumber, BytesLike } from "ethers";

// UserOperation type according to ERC-4337
export interface UserOperation {
  sender: string;
  nonce: BigNumber;
  initCode: BytesLike;
  callData: BytesLike;
  callGasLimit: BigNumber;
  verificationGasLimit: BigNumber;
  preVerificationGas: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  paymasterAndData: BytesLike;
  signature: BytesLike;
}

// Configuration for the SDK
export interface CoreAAConfig {
  // Chain Information
  chainId: number;
  rpcUrl: string;

  // Contract Addresses
  entryPointAddress: string;
  accountFactoryAddress: string;

  // Optional Paymaster
  paymasterAddress?: string;
}

// Account creation parameters
export interface AccountParams {
  owner: string; // Owner's address (the one who can sign transactions)
  index?: number; // Optional index for creating multiple accounts for the same owner
  salt?: string; // Custom salt for account address derivation
}

// Paymaster usage parameters
export interface PaymasterParams {
  type: "verifying" | "token";
  token?: string; // If using token paymaster, which token to use
  gasToken?: string; // If using token paymaster, which token to pay gas with
  data?: BytesLike; // Additional data for custom paymasters
}

// Transaction request
export interface TransactionRequest {
  to: string;
  value?: BigNumber;
  data?: BytesLike;
  nonce?: BigNumber;
  gasLimit?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
}
