import { BigNumber } from "ethers";
/**
 * User operation state
 */
export declare enum UserOperationState {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
/**
 * Paymaster configuration options
 */
export interface PaymasterConfig {
    paymasterAddress: string;
    entryPointAddress: string;
    chainId?: number;
}
/**
 * Account gas details
 */
export interface AccountGasDetails {
    isWhitelisted: boolean;
    gasLimit: BigNumber;
    gasUsed: BigNumber;
}
/**
 * User operation data structure (simplified)
 */
export interface UserOperation {
    sender: string;
    nonce: string;
    initCode: string;
    callData: string;
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    paymasterAndData: string;
    signature: string;
}
/**
 * Paymaster deposit information
 */
export interface PaymasterDepositInfo {
    balance: BigNumber;
    staked: boolean;
    stake: BigNumber;
    unstakeDelaySec: number;
    withdrawTime: number;
}
/**
 * Events that can be subscribed to
 */
export interface PaymasterEvents {
    AccountWhitelisted: (account: string, whitelisted: boolean) => void;
    AccountGasLimitSet: (account: string, gasLimit: BigNumber) => void;
    PaymasterDeposited: (sender: string, amount: BigNumber) => void;
    PaymasterWithdrawn: (recipient: string, amount: BigNumber) => void;
    GasPaymentMade: (account: string, gasAmount: BigNumber) => void;
}
/**
 * User operation status response
 */
export interface UserOperationStatus {
    state: UserOperationState;
    transactionHash?: string;
    blockNumber?: number;
    actualGasCost?: BigNumber;
    success?: boolean;
    error?: string;
}
/**
 * Events to listen for
 */
export type EventType = keyof PaymasterEvents;
