import { ethers, BigNumber, Contract, Wallet, utils } from "ethers";
import { CoreAAConfig } from "./types";

// ABI fragments
const VERIFYING_PAYMASTER_ABI = [
  "function getHash(address sender, uint256 nonce, bytes calldata initCode, bytes calldata callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas) external view returns (bytes32)",
  "function owner() view returns (address)",
];

const TOKEN_PAYMASTER_ABI = [
  "function getTokenValueOfEth(uint256 ethAmount) external view returns (uint256)",
  "function token() view returns (address)",
];

export class PaymasterService {
  private provider: ethers.providers.JsonRpcProvider;
  private config: CoreAAConfig;
  private verifyingPaymaster: Contract | null = null;
  private tokenPaymaster: Contract | null = null;

  constructor(config: CoreAAConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

    // Initialize paymaster contract if available
    if (config.paymasterAddress) {
      // Note: We start with verifying paymaster ABI, but it might be a token paymaster
      this.verifyingPaymaster = new Contract(
        config.paymasterAddress,
        VERIFYING_PAYMASTER_ABI,
        this.provider
      );
    }
  }

  /**
   * Set up a verifying paymaster for sponsored transactions
   * @param paymasterAddress The address of the verifying paymaster contract
   */
  setVerifyingPaymaster(paymasterAddress: string): void {
    this.verifyingPaymaster = new Contract(
      paymasterAddress,
      VERIFYING_PAYMASTER_ABI,
      this.provider
    );
  }

  /**
   * Set up a token paymaster for token-based fee payment
   * @param paymasterAddress The address of the token paymaster contract
   */
  setTokenPaymaster(paymasterAddress: string): void {
    this.tokenPaymaster = new Contract(
      paymasterAddress,
      TOKEN_PAYMASTER_ABI,
      this.provider
    );
  }

  /**
   * Get the token exchange rate for a token paymaster
   * @param ethAmount Amount of ETH to convert
   * @returns Amount of tokens needed
   */
  async getTokenAmount(ethAmount: BigNumber): Promise<BigNumber> {
    if (!this.tokenPaymaster) {
      throw new Error(
        "Token paymaster not initialized. Call setTokenPaymaster first."
      );
    }

    return await this.tokenPaymaster.getTokenValueOfEth(ethAmount);
  }

  /**
   * Get the token address used by the token paymaster
   * @returns The token address
   */
  async getTokenAddress(): Promise<string> {
    if (!this.tokenPaymaster) {
      throw new Error(
        "Token paymaster not initialized. Call setTokenPaymaster first."
      );
    }

    return await this.tokenPaymaster.token();
  }

  /**
   * Generate a signed paymaster data for a verifying paymaster
   * @param userOpHash Hash of the UserOperation
   * @param signer Signer with permission to sign for the paymaster
   * @returns Signed paymaster data
   */
  async signPaymasterData(userOpHash: string, signer: Wallet): Promise<string> {
    if (!this.verifyingPaymaster) {
      throw new Error(
        "Verifying paymaster not initialized. Call setVerifyingPaymaster first."
      );
    }

    // Sign the hash
    const signature = await signer.signMessage(
      ethers.utils.arrayify(userOpHash)
    );

    // Return paymaster data: paymaster address + signature
    return utils.hexConcat([this.verifyingPaymaster.address, signature]);
  }
}
