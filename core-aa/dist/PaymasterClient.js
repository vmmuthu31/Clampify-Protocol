"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymasterClient = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
/**
 * Main client for interacting with the paymaster contract
 */
class PaymasterClient {
    /**
     * Creates a new PaymasterClient
     *
     * @param provider - Ethers provider
     * @param config - Paymaster configuration
     * @param signer - Optional signer for transactions
     */
    constructor(provider, config, signer) {
        this.eventHandlers = new Map();
        this.provider = provider;
        this.signer = signer;
        // Set default config values if not provided
        this.config = {
            paymasterAddress: config?.paymasterAddress || constants_1.DEFAULT_PAYMASTER_ADDRESS,
            entryPointAddress: config?.entryPointAddress || constants_1.DEFAULT_ENTRYPOINT_ADDRESS,
            chainId: config?.chainId,
        };
        // Create contract instances
        this.paymasterContract = new ethers_1.ethers.Contract(this.config.paymasterAddress, constants_1.PAYMASTER_ABI, signer || provider);
        this.entryPointContract = new ethers_1.ethers.Contract(this.config.entryPointAddress, constants_1.ENTRYPOINT_ABI, signer || provider);
        // Initialize event listeners
        this._setupEventListeners();
    }
    /**
     * Set a new signer for the client
     *
     * @param signer - New signer
     */
    setSigner(signer) {
        this.signer = signer;
        this.paymasterContract = new ethers_1.ethers.Contract(this.config.paymasterAddress, constants_1.PAYMASTER_ABI, signer);
        this.entryPointContract = new ethers_1.ethers.Contract(this.config.entryPointAddress, constants_1.ENTRYPOINT_ABI, signer);
    }
    /**
     * Get the current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Deposit funds to the paymaster
     *
     * @param amount - Amount to deposit (in wei)
     * @returns Transaction response
     */
    async deposit(amount) {
        this._requireSigner();
        return this.paymasterContract.deposit({ value: amount });
    }
    /**
     * Withdraw funds from the paymaster (owner only)
     *
     * @param amount - Amount to withdraw (in wei)
     * @returns Transaction response
     */
    async withdraw(amount) {
        this._requireSigner();
        return this.paymasterContract.withdraw(amount);
    }
    /**
     * Get the current balance of the paymaster
     *
     * @returns Balance in wei
     */
    async getBalance() {
        return this.paymasterContract.getBalance();
    }
    /**
     * Check if the paymaster is enabled
     *
     * @returns True if enabled
     */
    async isEnabled() {
        return this.paymasterContract.isEnabled();
    }
    /**
     * Enable or disable the paymaster
     *
     * @param enabled - True to enable, false to disable
     * @returns Transaction response
     */
    async setEnabled(enabled) {
        this._requireSigner();
        return this.paymasterContract.setEnabled(enabled);
    }
    /**
     * Add or remove an account from the whitelist
     *
     * @param account - Account address
     * @param whitelisted - Whether to whitelist the account
     * @returns Transaction response
     */
    async setWhitelistedAccount(account, whitelisted) {
        this._requireSigner();
        return this.paymasterContract.setWhitelistedAccount(account, whitelisted);
    }
    /**
     * Set a gas limit for an account
     *
     * @param account - Account address
     * @param gasLimit - Gas limit in wei (0 for unlimited)
     * @returns Transaction response
     */
    async setAccountGasLimit(account, gasLimit) {
        this._requireSigner();
        return this.paymasterContract.setAccountGasLimit(account, gasLimit);
    }
    /**
     * Batch whitelist multiple accounts
     *
     * @param accounts - Array of account addresses
     * @param whitelisted - Whether to whitelist the accounts
     * @returns Transaction response
     */
    async batchSetWhitelistedAccounts(accounts, whitelisted) {
        this._requireSigner();
        return this.paymasterContract.batchSetWhitelistedAccounts(accounts, whitelisted);
    }
    /**
     * Reset the gas usage counter for an account
     *
     * @param account - Account address
     * @returns Transaction response
     */
    async resetAccountGasUsed(account) {
        this._requireSigner();
        return this.paymasterContract.resetAccountGasUsed(account);
    }
    /**
     * Check if an account is whitelisted
     *
     * @param account - Account address
     * @returns True if whitelisted
     */
    async isAccountWhitelisted(account) {
        return this.paymasterContract.whitelistedAccounts(account);
    }
    /**
     * Get account gas limit
     *
     * @param account - Account address
     * @returns Gas limit in wei
     */
    async getAccountGasLimit(account) {
        return this.paymasterContract.accountGasLimits(account);
    }
    /**
     * Get account gas used
     *
     * @param account - Account address
     * @returns Gas used in wei
     */
    async getAccountGasUsed(account) {
        return this.paymasterContract.accountGasUsed(account);
    }
    /**
     * Get all gas details for an account
     *
     * @param account - Account address
     * @returns Object with gas details
     */
    async getAccountGasDetails(account) {
        const [isWhitelisted, gasLimit, gasUsed] = await Promise.all([
            this.isAccountWhitelisted(account),
            this.getAccountGasLimit(account),
            this.getAccountGasUsed(account),
        ]);
        return {
            isWhitelisted,
            gasLimit,
            gasUsed,
        };
    }
    /**
     * Add an event listener
     *
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event, callback) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(callback);
    }
    /**
     * Remove an event listener
     *
     * @param event - Event name
     * @param callback - Callback function
     */
    off(event, callback) {
        if (!this.eventHandlers.has(event))
            return;
        const handlers = this.eventHandlers.get(event);
        const index = handlers.findIndex((h) => h === callback);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }
    /**
     * Attach the paymaster to a user operation
     *
     * @param userOp - User operation to attach the paymaster to
     * @param extraData - Optional extra data for the paymaster
     * @returns Modified user operation
     */
    attachToUserOperation(userOp, extraData = "0x") {
        // If extraData is just 0x, we don't need to append anything
        const paymasterAndData = extraData === "0x"
            ? this.config.paymasterAddress
            : this.config.paymasterAddress + extraData.slice(2); // Remove '0x' prefix from extraData
        return {
            ...userOp,
            paymasterAndData,
        };
    }
    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners() {
        // AccountWhitelisted event
        this.paymasterContract.on("AccountWhitelisted", (account, whitelisted) => {
            this._triggerEvent("AccountWhitelisted", account, whitelisted);
        });
        // AccountGasLimitSet event
        this.paymasterContract.on("AccountGasLimitSet", (account, gasLimit) => {
            this._triggerEvent("AccountGasLimitSet", account, gasLimit);
        });
        // PaymasterDeposited event
        this.paymasterContract.on("PaymasterDeposited", (sender, amount) => {
            this._triggerEvent("PaymasterDeposited", sender, amount);
        });
        // PaymasterWithdrawn event
        this.paymasterContract.on("PaymasterWithdrawn", (recipient, amount) => {
            this._triggerEvent("PaymasterWithdrawn", recipient, amount);
        });
        // GasPaymentMade event
        this.paymasterContract.on("GasPaymentMade", (account, gasAmount) => {
            this._triggerEvent("GasPaymentMade", account, gasAmount);
        });
    }
    /**
     * Trigger an event
     *
     * @param event - Event name
     * @param args - Event arguments
     * @private
     */
    _triggerEvent(event, ...args) {
        if (!this.eventHandlers.has(event))
            return;
        const handlers = this.eventHandlers.get(event);
        for (const handler of handlers) {
            try {
                handler(...args);
            }
            catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        }
    }
    /**
     * Check if a signer is available, throw error if not
     * @private
     */
    _requireSigner() {
        if (!this.signer) {
            throw new Error("Signer is required for this operation");
        }
    }
}
exports.PaymasterClient = PaymasterClient;
