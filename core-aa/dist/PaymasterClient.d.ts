import { BigNumber, BigNumberish, ethers } from "ethers";
import { PaymasterConfig, AccountGasDetails, UserOperation, EventType, PaymasterEvents } from "./types";
/**
 * Main client for interacting with the paymaster contract
 */
export declare class PaymasterClient {
    private readonly provider;
    private readonly config;
    private signer?;
    private paymasterContract;
    private entryPointContract;
    private eventHandlers;
    /**
     * Creates a new PaymasterClient
     *
     * @param provider - Ethers provider
     * @param config - Paymaster configuration
     * @param signer - Optional signer for transactions
     */
    constructor(provider: ethers.providers.Provider, config?: Partial<PaymasterConfig>, signer?: ethers.Signer);
    /**
     * Set a new signer for the client
     *
     * @param signer - New signer
     */
    setSigner(signer: ethers.Signer): void;
    /**
     * Get the current configuration
     */
    getConfig(): PaymasterConfig;
    /**
     * Deposit funds to the paymaster
     *
     * @param amount - Amount to deposit (in wei)
     * @returns Transaction response
     */
    deposit(amount: BigNumberish): Promise<ethers.providers.TransactionResponse>;
    /**
     * Withdraw funds from the paymaster (owner only)
     *
     * @param amount - Amount to withdraw (in wei)
     * @returns Transaction response
     */
    withdraw(amount: BigNumberish): Promise<ethers.providers.TransactionResponse>;
    /**
     * Get the current balance of the paymaster
     *
     * @returns Balance in wei
     */
    getBalance(): Promise<BigNumber>;
    /**
     * Check if the paymaster is enabled
     *
     * @returns True if enabled
     */
    isEnabled(): Promise<boolean>;
    /**
     * Enable or disable the paymaster
     *
     * @param enabled - True to enable, false to disable
     * @returns Transaction response
     */
    setEnabled(enabled: boolean): Promise<ethers.providers.TransactionResponse>;
    /**
     * Add or remove an account from the whitelist
     *
     * @param account - Account address
     * @param whitelisted - Whether to whitelist the account
     * @returns Transaction response
     */
    setWhitelistedAccount(account: string, whitelisted: boolean): Promise<ethers.providers.TransactionResponse>;
    /**
     * Set a gas limit for an account
     *
     * @param account - Account address
     * @param gasLimit - Gas limit in wei (0 for unlimited)
     * @returns Transaction response
     */
    setAccountGasLimit(account: string, gasLimit: BigNumberish): Promise<ethers.providers.TransactionResponse>;
    /**
     * Batch whitelist multiple accounts
     *
     * @param accounts - Array of account addresses
     * @param whitelisted - Whether to whitelist the accounts
     * @returns Transaction response
     */
    batchSetWhitelistedAccounts(accounts: string[], whitelisted: boolean): Promise<ethers.providers.TransactionResponse>;
    /**
     * Reset the gas usage counter for an account
     *
     * @param account - Account address
     * @returns Transaction response
     */
    resetAccountGasUsed(account: string): Promise<ethers.providers.TransactionResponse>;
    /**
     * Check if an account is whitelisted
     *
     * @param account - Account address
     * @returns True if whitelisted
     */
    isAccountWhitelisted(account: string): Promise<boolean>;
    /**
     * Get account gas limit
     *
     * @param account - Account address
     * @returns Gas limit in wei
     */
    getAccountGasLimit(account: string): Promise<BigNumber>;
    /**
     * Get account gas used
     *
     * @param account - Account address
     * @returns Gas used in wei
     */
    getAccountGasUsed(account: string): Promise<BigNumber>;
    /**
     * Get all gas details for an account
     *
     * @param account - Account address
     * @returns Object with gas details
     */
    getAccountGasDetails(account: string): Promise<AccountGasDetails>;
    /**
     * Add an event listener
     *
     * @param event - Event name
     * @param callback - Callback function
     */
    on<E extends EventType>(event: E, callback: PaymasterEvents[E]): void;
    /**
     * Remove an event listener
     *
     * @param event - Event name
     * @param callback - Callback function
     */
    off<E extends EventType>(event: E, callback: PaymasterEvents[E]): void;
    /**
     * Attach the paymaster to a user operation
     *
     * @param userOp - User operation to attach the paymaster to
     * @param extraData - Optional extra data for the paymaster
     * @returns Modified user operation
     */
    attachToUserOperation(userOp: Partial<UserOperation>, extraData?: string): Partial<UserOperation>;
    /**
     * Set up event listeners
     * @private
     */
    private _setupEventListeners;
    /**
     * Trigger an event
     *
     * @param event - Event name
     * @param args - Event arguments
     * @private
     */
    private _triggerEvent;
    /**
     * Check if a signer is available, throw error if not
     * @private
     */
    private _requireSigner;
}
