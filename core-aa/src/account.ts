import { ethers, BigNumber, Contract, Wallet, utils } from "ethers";
import { AccountParams, CoreAAConfig, TransactionRequest } from "./types";

// ABI fragments
const ACCOUNT_FACTORY_ABI = [
  "function createAccount(address owner, uint256 salt) external returns (address)",
  "function getAddress(address owner, uint256 salt) external view returns (address)",
];

const SIMPLE_ACCOUNT_ABI = [
  "function owner() view returns (address)",
  "function execute(address dest, uint256 value, bytes calldata func) external",
  "function nonce() view returns (uint256)",
];

export class SimpleAccount {
  private provider: ethers.providers.JsonRpcProvider;
  private config: CoreAAConfig;
  private accountFactory: Contract;
  private accountContract: Contract | null = null;
  private accountAddress: string | null = null;

  constructor(config: CoreAAConfig, privateKey?: string) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    // Create contract instances
    this.accountFactory = new Contract(
      config.accountFactoryAddress,
      ACCOUNT_FACTORY_ABI,
      privateKey ? new Wallet(privateKey, this.provider) : this.provider
    );
  }

  /**
   * Get or create an account for a specific owner
   * @param params Account parameters
   * @returns The account address
   */
  async getAccount(params: AccountParams): Promise<string> {
    const { owner, index = 0, salt: customSalt } = params;

    // Generate a deterministic salt based on owner and index
    const salt =
      customSalt ||
      BigNumber.from(
        utils.keccak256(
          utils.defaultAbiCoder.encode(["address", "uint256"], [owner, index])
        )
      );

    // Check if account already exists
    try {
      this.accountAddress = await this.accountFactory.getAddress(owner, salt);

      // Check if the account is actually deployed
      const code = await this.provider.getCode(this.accountAddress || "");
      if (code === "0x") {
        // Account not deployed yet, deploy it
        const tx = await this.accountFactory.createAccount(owner, salt);
        await tx.wait();
      }

      // Initialize the account contract
      this.accountContract = new Contract(
        this.accountAddress || "",
        SIMPLE_ACCOUNT_ABI,
        this.provider
      );

      return this.accountAddress || "";
    } catch (error) {
      throw new Error(`Failed to get or create account: ${error.message}`);
    }
  }

  /**
   * Get the current account address
   * @returns The account address or null if no account is set
   */
  getAddress(): string | null {
    return this.accountAddress;
  }

  /**
   * Get the account nonce
   * @returns The account nonce
   */
  async getNonce(): Promise<BigNumber> {
    if (!this.accountContract) {
      throw new Error("Account not initialized. Call getAccount first.");
    }
    return await this.accountContract.nonce();
  }

  /**
   * Execute a transaction using the account
   * @param tx Transaction request
   * @param signer The signer to use (owner wallet)
   * @returns Transaction receipt
   */
  async execute(
    tx: TransactionRequest,
    signer: Wallet
  ): Promise<ethers.ContractReceipt> {
    if (!this.accountContract) {
      throw new Error("Account not initialized. Call getAccount first.");
    }

    // Connect with the signer
    const connectedAccount = this.accountContract.connect(signer);

    // Execute the transaction
    const txResponse = await connectedAccount.execute(
      tx.to,
      tx.value || 0,
      tx.data || "0x"
    );

    return await txResponse.wait();
  }
}
