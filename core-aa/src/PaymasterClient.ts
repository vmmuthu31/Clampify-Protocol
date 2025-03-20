import { Contract, BigNumber, BigNumberish, ethers } from "ethers";
import {
  PAYMASTER_ABI,
  ENTRYPOINT_ABI,
  DEFAULT_PAYMASTER_ADDRESS,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "./constants";
import {
  PaymasterConfig,
  AccountGasDetails,
  PaymasterDepositInfo,
  UserOperation,
  EventType,
  PaymasterEvents,
} from "./types";

/**
 * Main client for interacting with the paymaster contract
 */
export class PaymasterClient {
  private readonly provider: ethers.providers.Provider;
  private readonly config: PaymasterConfig;
  private signer?: ethers.Signer;
  private paymasterContract: Contract;
  private entryPointContract: Contract;
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Creates a new PaymasterClient
   *
   * @param provider - Ethers provider
   * @param config - Paymaster configuration
   * @param signer - Optional signer for transactions
   */
  constructor(
    provider: ethers.providers.Provider,
    config?: Partial<PaymasterConfig>,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;

    // Set default config values if not provided
    this.config = {
      paymasterAddress: config?.paymasterAddress || DEFAULT_PAYMASTER_ADDRESS,
      entryPointAddress:
        config?.entryPointAddress || DEFAULT_ENTRYPOINT_ADDRESS,
      chainId: config?.chainId,
    };

    // Create contract instances
    this.paymasterContract = new ethers.Contract(
      this.config.paymasterAddress,
      PAYMASTER_ABI,
      signer || provider
    );

    this.entryPointContract = new ethers.Contract(
      this.config.entryPointAddress,
      ENTRYPOINT_ABI,
      signer || provider
    );

    // Initialize event listeners
    this._setupEventListeners();
  }

  /**
   * Set a new signer for the client
   *
   * @param signer - New signer
   */
  public setSigner(signer: ethers.Signer): void {
    this.signer = signer;
    this.paymasterContract = new ethers.Contract(
      this.config.paymasterAddress,
      PAYMASTER_ABI,
      signer
    );
    this.entryPointContract = new ethers.Contract(
      this.config.entryPointAddress,
      ENTRYPOINT_ABI,
      signer
    );
  }

  /**
   * Get the current configuration
   */
  public getConfig(): PaymasterConfig {
    return { ...this.config };
  }

  /**
   * Deposit funds to the paymaster
   *
   * @param amount - Amount to deposit (in wei)
   * @returns Transaction response
   */
  public async deposit(
    amount: BigNumberish
  ): Promise<ethers.providers.TransactionResponse> {
    this._requireSigner();
    return this.paymasterContract.deposit({ value: amount });
  }

  /**
   * Withdraw funds from the paymaster (owner only)
   *
   * @param amount - Amount to withdraw (in wei)
   * @returns Transaction response
   */
  public async withdraw(
    amount: BigNumberish
  ): Promise<ethers.providers.TransactionResponse> {
    this._requireSigner();
    return this.paymasterContract.withdraw(amount);
  }

  /**
   * Get the current balance of the paymaster
   *
   * @returns Balance in wei
   */
  public async getBalance(): Promise<BigNumber> {
    return this.paymasterContract.getBalance();
  }

  /**
   * Check if the paymaster is enabled
   *
   * @returns True if enabled
   */
  public async isEnabled(): Promise<boolean> {
    return this.paymasterContract.isEnabled();
  }

  /**
   * Enable or disable the paymaster
   *
   * @param enabled - True to enable, false to disable
   * @returns Transaction response
   */
  public async setEnabled(
    enabled: boolean
  ): Promise<ethers.providers.TransactionResponse> {
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
  public async setWhitelistedAccount(
    account: string,
    whitelisted: boolean
  ): Promise<ethers.providers.TransactionResponse> {
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
  public async setAccountGasLimit(
    account: string,
    gasLimit: BigNumberish
  ): Promise<ethers.providers.TransactionResponse> {
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
  public async batchSetWhitelistedAccounts(
    accounts: string[],
    whitelisted: boolean
  ): Promise<ethers.providers.TransactionResponse> {
    this._requireSigner();
    return this.paymasterContract.batchSetWhitelistedAccounts(
      accounts,
      whitelisted
    );
  }

  /**
   * Reset the gas usage counter for an account
   *
   * @param account - Account address
   * @returns Transaction response
   */
  public async resetAccountGasUsed(
    account: string
  ): Promise<ethers.providers.TransactionResponse> {
    this._requireSigner();
    return this.paymasterContract.resetAccountGasUsed(account);
  }

  /**
   * Check if an account is whitelisted
   *
   * @param account - Account address
   * @returns True if whitelisted
   */
  public async isAccountWhitelisted(account: string): Promise<boolean> {
    return this.paymasterContract.whitelistedAccounts(account);
  }

  /**
   * Get account gas limit
   *
   * @param account - Account address
   * @returns Gas limit in wei
   */
  public async getAccountGasLimit(account: string): Promise<BigNumber> {
    return this.paymasterContract.accountGasLimits(account);
  }

  /**
   * Get account gas used
   *
   * @param account - Account address
   * @returns Gas used in wei
   */
  public async getAccountGasUsed(account: string): Promise<BigNumber> {
    return this.paymasterContract.accountGasUsed(account);
  }

  /**
   * Get all gas details for an account
   *
   * @param account - Account address
   * @returns Object with gas details
   */
  public async getAccountGasDetails(
    account: string
  ): Promise<AccountGasDetails> {
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
  public on<E extends EventType>(event: E, callback: PaymasterEvents[E]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback as Function);
  }

  /**
   * Remove an event listener
   *
   * @param event - Event name
   * @param callback - Callback function
   */
  public off<E extends EventType>(
    event: E,
    callback: PaymasterEvents[E]
  ): void {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event)!;
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
  public attachToUserOperation(
    userOp: Partial<UserOperation>,
    extraData: string = "0x"
  ): Partial<UserOperation> {
    // If extraData is just 0x, we don't need to append anything
    const paymasterAndData =
      extraData === "0x"
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
  private _setupEventListeners(): void {
    // AccountWhitelisted event
    this.paymasterContract.on(
      "AccountWhitelisted",
      (account: string, whitelisted: boolean) => {
        this._triggerEvent("AccountWhitelisted", account, whitelisted);
      }
    );

    // AccountGasLimitSet event
    this.paymasterContract.on(
      "AccountGasLimitSet",
      (account: string, gasLimit: BigNumber) => {
        this._triggerEvent("AccountGasLimitSet", account, gasLimit);
      }
    );

    // PaymasterDeposited event
    this.paymasterContract.on(
      "PaymasterDeposited",
      (sender: string, amount: BigNumber) => {
        this._triggerEvent("PaymasterDeposited", sender, amount);
      }
    );

    // PaymasterWithdrawn event
    this.paymasterContract.on(
      "PaymasterWithdrawn",
      (recipient: string, amount: BigNumber) => {
        this._triggerEvent("PaymasterWithdrawn", recipient, amount);
      }
    );

    // GasPaymentMade event
    this.paymasterContract.on(
      "GasPaymentMade",
      (account: string, gasAmount: BigNumber) => {
        this._triggerEvent("GasPaymentMade", account, gasAmount);
      }
    );
  }

  /**
   * Trigger an event
   *
   * @param event - Event name
   * @param args - Event arguments
   * @private
   */
  private _triggerEvent(event: string, ...args: any[]): void {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event)!;
    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }
  }

  /**
   * Check if a signer is available, throw error if not
   * @private
   */
  private _requireSigner(): void {
    if (!this.signer) {
      throw new Error("Signer is required for this operation");
    }
  }
}
