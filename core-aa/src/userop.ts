import { ethers, BigNumber, utils } from "ethers";
import { UserOperation, TransactionRequest, CoreAAConfig } from "./types";

export class UserOpBuilder {
  private provider: ethers.providers.JsonRpcProvider;
  private config: CoreAAConfig;

  constructor(config: CoreAAConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  }

  /**
   * Create a new UserOperation
   * @param sender The sender account address
   * @param request The transaction request
   * @param initCode Initialization code (if account not deployed yet)
   * @param paymasterAndData Paymaster data (optional)
   * @returns A UserOperation object
   */
  async buildUserOp(
    sender: string,
    request: TransactionRequest,
    initCode: string = "0x",
    paymasterAndData: string = "0x"
  ): Promise<UserOperation> {
    // Get current gas prices
    const feeData = await this.provider.getFeeData();

    // Get nonce from request or from account
    let nonce = request.nonce;
    if (!nonce) {
      try {
        // Try to get nonce from the account contract
        const accountContract = new ethers.Contract(
          sender,
          ["function nonce() view returns (uint256)"],
          this.provider
        );
        nonce = await accountContract.nonce();
      } catch (error) {
        // If account doesn't exist yet, nonce is 0
        nonce = BigNumber.from(0);
      }
    }

    // Encode calldata for the execute function
    const iface = new utils.Interface([
      "function execute(address dest, uint256 value, bytes calldata func) external",
    ]);
    const callData = iface.encodeFunctionData("execute", [
      request.to,
      request.value || 0,
      request.data || "0x",
    ]);

    // Gas estimation is complex and requires bundler support
    // For now, we use placeholder values that should be replaced with proper estimates
    const callGasLimit = BigNumber.from("100000"); // Placeholder
    const verificationGasLimit = BigNumber.from("100000"); // Placeholder
    const preVerificationGas = BigNumber.from("50000"); // Placeholder

    // Create the UserOperation
    const userOp: UserOperation = {
      sender,
      nonce: nonce || BigNumber.from(0),
      initCode: initCode,
      callData,
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      maxFeePerGas:
        request.maxFeePerGas ||
        feeData.maxFeePerGas ||
        BigNumber.from("1000000000"),
      maxPriorityFeePerGas:
        request.maxPriorityFeePerGas ||
        feeData.maxPriorityFeePerGas ||
        BigNumber.from("1000000000"),
      paymasterAndData,
      signature: "0x", // Placeholder, will be filled later
    };

    return userOp;
  }

  /**
   * Calculate the UserOperation hash for signing
   * @param userOp The UserOperation to hash
   * @returns The hash to sign
   */
  getUserOpHash(userOp: UserOperation): string {
    // According to ERC-4337 spec
    const userOpHash = utils.keccak256(
      utils.defaultAbiCoder.encode(
        [
          "address",
          "uint256",
          "bytes32",
          "bytes32",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "bytes32",
        ],
        [
          userOp.sender,
          userOp.nonce,
          utils.keccak256(userOp.initCode),
          utils.keccak256(userOp.callData),
          userOp.callGasLimit,
          userOp.verificationGasLimit,
          userOp.preVerificationGas,
          userOp.maxFeePerGas,
          userOp.maxPriorityFeePerGas,
          utils.keccak256(userOp.paymasterAndData),
        ]
      )
    );

    // Pack with EntryPoint address and chainId
    const { entryPointAddress, chainId } = this.config;
    const packed = utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint256"],
      [userOpHash, entryPointAddress, chainId]
    );

    return utils.keccak256(packed);
  }

  /**
   * Sign a UserOperation
   * @param userOp The UserOperation to sign
   * @param signer The signer (wallet)
   * @returns The signed UserOperation
   */
  async signUserOp(
    userOp: UserOperation,
    signer: ethers.Wallet
  ): Promise<UserOperation> {
    const hash = this.getUserOpHash(userOp);
    const signature = await signer.signMessage(ethers.utils.arrayify(hash));

    return {
      ...userOp,
      signature,
    };
  }
}
