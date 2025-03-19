// src/index.ts
import { ethers } from "ethers";
import { SimpleAccount } from "./account";
import { PaymasterService } from "./paymaster";
import { UserOpBuilder } from "./userOp";
import {
  CoreAAConfig,
  AccountParams,
  PaymasterParams,
  TransactionRequest,
  UserOperation,
} from "./types";

export class CoreAASDK {
  private config: CoreAAConfig;

  public account: SimpleAccount;
  public paymaster: PaymasterService;
  public userOpBuilder: UserOpBuilder;

  constructor(config: CoreAAConfig, privateKey?: string) {
    this.config = config;

    // Initialize components
    this.account = new SimpleAccount(config, privateKey);
    this.paymaster = new PaymasterService(config);
    this.userOpBuilder = new UserOpBuilder(config);
  }

  /**
   * Create and initialize an account
   * @param params Account parameters
   * @returns The account address
   */
  async createAccount(params: AccountParams): Promise<string> {
    return await this.account.getAccount(params);
  }

  /**
   * Send a UserOperation through a bundler
   * @param userOp The UserOperation to send
   * @param bundlerUrl URL of the ERC-4337 bundler
   * @returns The transaction hash
   */
  async sendUserOperation(
    userOp: UserOperation,
    bundlerUrl: string
  ): Promise<string> {
    // Connect to the bundler
    const provider = new ethers.providers.JsonRpcProvider(bundlerUrl);

    // Send the UserOperation
    const response = await provider.send("eth_sendUserOperation", [
      userOp,
      this.config.entryPointAddress,
    ]);

    return response;
  }

  /**
   * Execute a transaction using the account abstraction
   * @param request Transaction request
   * @param owner Account owner's private key
   * @param paymasterParams Optional paymaster parameters
   * @param bundlerUrl URL of the ERC-4337 bundler
   * @returns Transaction hash
   */
  async execTransaction(
    request: TransactionRequest,
    ownerPrivateKey: string,
    paymasterParams?: PaymasterParams,
    bundlerUrl?: string
  ): Promise<string> {
    // Create owner wallet
    const owner = new ethers.Wallet(ownerPrivateKey);

    // Get or create the account
    const accountAddress = await this.account.getAccount({
      owner: owner.address,
    });

    // Build basic UserOperation
    let userOp = await this.userOpBuilder.buildUserOp(accountAddress, request);

    // Add paymaster data if provided
    if (paymasterParams) {
      if (paymasterParams.type === "verifying") {
        // Get user operation hash
        const hash = this.userOpBuilder.getUserOpHash(userOp);

        // Add paymaster signature
        const paymasterSigner = new ethers.Wallet(ownerPrivateKey); // Ideally this should be a different key
        const paymasterData = await this.paymaster.signPaymasterData(
          hash,
          paymasterSigner
        );

        userOp = {
          ...userOp,
          paymasterAndData: paymasterData,
        };
      }
      // Add token paymaster implementation if needed
    }

    // Sign the UserOperation
    const signedUserOp = await this.userOpBuilder.signUserOp(userOp, owner);

    // If bundlerUrl provided, send through bundler
    if (bundlerUrl) {
      return await this.sendUserOperation(signedUserOp, bundlerUrl);
    }

    // Otherwise return the signed UserOperation
    return JSON.stringify(signedUserOp);
  }
}

// Export everything
export * from "./types";
export { SimpleAccount } from "./account";
export { PaymasterService } from "./paymaster";
export { UserOpBuilder } from "./userOp";
