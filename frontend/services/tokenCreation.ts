import { ethers } from "ethers";
import ClampifyFactory from "../deployments/ClampifyFactory.json";
import ClampifyGovernance from "../deployments/ClampifyGovernance.json";
import ClampifyToken from "../deployments/ClampifyToken.json";

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

interface NetworkConfig {
  factoryAddress: string;
  governanceAddress: string;
  rpcUrl: string;
}

export const NETWORK_CONFIG: { [key: string]: NetworkConfig } = {
  // core Mainnet with proxy
  // "1116": {
  //   factoryAddress: "0x472Bd08194e7AFF981FaC9990af780b328D9cE0b",
  //   governanceAddress: "0x699bf4037D72107142D4600b8B2F18940e06dBB2",
  //   rpcUrl: "https://rpc.coredao.org",
  // },
  // // Soneium
  // "1868": {
  //   factoryAddress: "0x13F4795fFc6A5D75c09F42b06c037ffbe69D0E32",
  //   governanceAddress: "0x49C2646ca0737Cc603599DeBa191143d94E35026",
  //   rpcUrl: "https://rpc.soneium.org",
  // },
  // Holesky
  "17000": {
    factoryAddress: "0x2B65Eba61bac37Ae872bEFf9d1932129B0ed24ee",
    governanceAddress: "0x653c13Fb7C1E5d855448af2A385F2D97a623384E",
    rpcUrl: "https://1rpc.io/holesky",
  },
  // BNB Testnet
  "97": {
    factoryAddress: "0x7b63Cb427e32dBE0E24b818DafBA8196Dc2C74ca",
    governanceAddress: "0xEf9715f165219ce6E4BA020882B4564E79f620e6",
    rpcUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
  },
  // Core DAO Testnet with non proxy
  "1114": {
    factoryAddress: "0xfBFe5E3b50355bC76718E48e118c48f4167954B0",
    governanceAddress: "0xc02Ced956D028F567cdd293F235F2f51955De8aB",
    rpcUrl: "https://rpc.test2.btcs.network",
  },
  // Polygon Amoy Testnet with proxy
  "80002": {
    factoryAddress: "0x36CeB484d0e74135c1D2790dfCc2B27ED8f5992B",
    governanceAddress: "0x94f1d9F568f6eED939942c6ab2048B57fda46ebe",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
};

const getNetworkConfig = async (): Promise<NetworkConfig> => {
  if (!ethereum) {
    // Default to Core DAO Mainnet if no wallet is connected
    return NETWORK_CONFIG["1114"];
  }

  const provider = new ethers.providers.Web3Provider(ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();

  if (!NETWORK_CONFIG[chainId]) {
    throw new Error(`Network with chain ID ${chainId} is not supported`);
  }

  return NETWORK_CONFIG[chainId];
};

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  balance: string;
  creatorLockupPeriod: string;
  initialSupply: string;
  initialPrice: string;
  contractAddress: string;
  marketCap: string;
  volume24h: string;
}

export const Mint = async (
  name: string,
  symbol: string,
  initialSupply: string,
  maxSupply: string,
  initialPrice: string,
  creatorLockupPeriod: string,
  lockLiquidity: boolean,
  liquidityLockPeriod: string
): Promise<string> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    const contract = new ethers.Contract(
      networkConfig.factoryAddress,
      ClampifyFactory,
      signer
    );
    const initialPriceWei = ethers.utils.parseEther(initialPrice);
    const depositAmount = ethers.utils.parseEther("0.01");

    // Create token with higher gas limit to handle mainnet's EVM differences
    const tx = await contract.createToken(
      name,
      symbol,
      initialSupply,
      maxSupply,
      initialPriceWei,
      creatorLockupPeriod,
      lockLiquidity,
      liquidityLockPeriod,
      {
        value: depositAmount,
      }
    );

    const receipt = await tx.wait();

    const tokenCreatedEvent = receipt.events[0];
    const tokenAddress = tokenCreatedEvent.address;
    return tokenAddress;
  } catch (error) {
    console.error("Detailed error:", error);

    if (error instanceof Error) {
      // Handle MCOPY error specifically
      if (error.message.includes("invalid opcode: MCOPY")) {
        throw new Error(
          "This contract requires Solidity ≤0.8.17 and is not compatible with Core Mainnet currently. Please try using Core Testnet."
        );
      }

      // Handle transaction failure
      if (
        error.message.includes("transaction failed") ||
        error.message.includes("CALL_EXCEPTION")
      ) {
        throw new Error(
          "Transaction failed. Please check that you have enough CORE for gas and the contract deposit (0.01 CORE). The contract may also have requirements that weren't met."
        );
      }
    }

    throw error;
  }
};

export const TokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
  try {
    // Get network config to ensure we're using the correct RPC
    const networkConfig = await getNetworkConfig();

    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    console.log(`TokenInfo called for address: ${tokenAddress}`);

    const userAddress: string = await signer.getAddress();
    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);

    // Add try/catch blocks around each call to prevent one failure from failing everything
    let name,
      symbol,
      totalSupply,
      decimals,
      initialSupply,
      initialPrice,
      creatorLockupPeriod,
      marketCap,
      volume24h,
      balance;

    try {
      name = await contract.name();
    } catch (error) {
      console.error("Failed to get name:", error);
      name = "Clampify";
    }

    try {
      symbol = await contract.symbol();
    } catch (error) {
      console.error("Failed to get symbol:", error);
      symbol = "CLM";
    }

    try {
      totalSupply = await contract.totalSupply();
    } catch (error) {
      console.error("Failed to get totalSupply:", error);
      totalSupply = ethers.BigNumber.from(0);
    }

    try {
      decimals = await contract.decimals();
    } catch (error) {
      console.error("Failed to get decimals:", error);
      decimals = 18;
    }

    try {
      initialSupply = await contract.initialSupply();
    } catch (error) {
      console.error("Failed to get initialSupply:", error);
      initialSupply = ethers.BigNumber.from(0);
    }

    try {
      initialPrice = await contract.getCurrentPrice();
    } catch (error) {
      console.error("Failed to get initialPrice:", error);
      initialPrice = ethers.BigNumber.from(0);
    }

    try {
      creatorLockupPeriod = await contract.creatorLockupPeriod();
    } catch (error) {
      console.error("Failed to get creatorLockupPeriod:", error);
      creatorLockupPeriod = ethers.BigNumber.from(0);
    }

    try {
      marketCap = await contract.marketCap();
    } catch (error) {
      console.error("Failed to get marketCap:", error);
      marketCap = ethers.BigNumber.from(0);
    }

    try {
      volume24h = await contract.totalVolume();
    } catch (error) {
      console.error("Failed to get volume24h:", error);
      volume24h = ethers.BigNumber.from(0);
    }

    try {
      balance = await contract.balanceOf(userAddress);
    } catch (error) {
      console.error("Failed to get balance:", error);
      balance = ethers.BigNumber.from(0);
    }

    return {
      name,
      symbol,
      totalSupply: formatSafely(totalSupply),
      decimals,
      balance: formatSafely(balance),
      creatorLockupPeriod: formatSafely(creatorLockupPeriod),
      initialSupply: formatSafely(initialSupply),
      initialPrice: formatSafely(initialPrice),
      contractAddress: tokenAddress, // Always use the address that was requested
      marketCap: formatSafely(marketCap),
      volume24h: formatSafely(volume24h),
    };
  } catch (error) {
    console.error("Critical error in TokenInfo:", error);

    // Return default values on error rather than throwing
    return {
      name: "Clampify",
      symbol: "CLM",
      totalSupply: "0",
      decimals: 18,
      balance: "0",
      creatorLockupPeriod: "0",
      initialSupply: "0",
      initialPrice: "0",
      contractAddress: tokenAddress,
      marketCap: "0",
      volume24h: "0",
    };
  }
};

// Helper function to safely format a value that might already be in decimal format
const formatSafely = (value: string | number | ethers.BigNumber): string => {
  if (!value) return "0";

  // If it's already a string with a decimal point, return it as is
  if (typeof value === "string" && value.includes(".")) {
    return value;
  }

  try {
    return ethers.utils.formatEther(value.toString());
  } catch (error) {
    console.error("Error formatting value:", error);
    return "0";
  }
};

type GovernanceTokenInfo = {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  proposalThreshold: string;
  quorum: number;
  votingPeriod: number;
  activeProposals: number;
  isGovernanceActive: boolean;
};

export const GovernanceTokenInfo = async (
  tokenAddress: string
): Promise<GovernanceTokenInfo> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    // Get governance info for the token
    const governanceInfo = await contract.tokenGovernance(tokenAddress);

    // Check if governance info exists and is active
    const isGovernanceActive = governanceInfo?.isActive || false;

    if (!governanceInfo) {
      // Return default values if governance is not set up
      return {
        address: tokenAddress,
        name: "Unknown",
        symbol: "Unknown",
        balance: "0",
        proposalThreshold: "0",
        quorum: 0,
        votingPeriod: 0,
        activeProposals: 0,
        isGovernanceActive: false,
      };
    }

    // Get token contract to fetch name and symbol
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ClampifyToken,
      signer
    );
    const [name, symbol] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      balance: governanceInfo.balance?.toString() || "0",
      proposalThreshold: governanceInfo.proposalThreshold?.toString() || "0",
      quorum: governanceInfo.quorum?.toNumber() || 0,
      votingPeriod: governanceInfo.votingPeriod?.toNumber() || 0,
      activeProposals: governanceInfo.activeProposals?.toNumber() || 0,
      isGovernanceActive,
    };
  } catch (error) {
    console.error("Error fetching governance info:", error);
    // Return default values on error
    return {
      address: tokenAddress,
      name: "Error",
      symbol: "Error",
      balance: "0",
      proposalThreshold: "0",
      quorum: 0,
      votingPeriod: 0,
      activeProposals: 0,
      isGovernanceActive: false,
    };
  }
};

export const UserCreatedTokens = async (
  userAddress: string
): Promise<GovernanceTokenInfo> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    const userCreatedTokens = await contract.getGovernanceTokens(userAddress);

    return userCreatedTokens;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export interface IGovernanceProposalInfo {
  id: number;
  title: string;
  description: string;
  targetContract: string;
  callData: string;
  proposer: string;
  createdAt: number;
  votingEndsAt: number;
  executed: boolean;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
}

export const GovernanceProposalCount = async (
  userAddress: string
): Promise<number> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    const proposalCount = await contract.proposalCount(userAddress);

    return proposalCount;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export const GovernanceProposalInfo = async (
  tokenAddress: string | undefined,
  proposalId: number
): Promise<IGovernanceProposalInfo> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    const proposalDetails = await contract.getProposalDetails(
      tokenAddress,
      proposalId
    );

    return proposalDetails;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export const hasVoted = async (
  tokenAddress: string,
  proposalId: number,
  voterAddress: string
): Promise<boolean> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    const voted = await contract.hasVoted(
      tokenAddress,
      proposalId,
      voterAddress
    );
    return voted;
  } catch (error) {
    console.error("Error checking vote status:", error);
    throw error;
  }
};

export const createProposal = async (
  tokenAddress: string,
  title: string,
  description: string,
  targetContract: string,
  callData: string
): Promise<number> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    const proposalId = await contract.createProposal(
      tokenAddress,
      title,
      description,
      targetContract,
      callData
    );

    return proposalId;
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

export const castVote = async (
  tokenAddress: string,
  proposalId: number,
  support: boolean
): Promise<void> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    await contract.castVote(tokenAddress, proposalId, support);
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
};

export const executeProposal = async (
  tokenAddress: string,
  proposalId: number
): Promise<void> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );

    await contract.executeProposal(tokenAddress, proposalId);
  } catch (error) {
    console.error("Error executing proposal:", error);
    throw error;
  }
};

// Add this new function to activate governance
export const activateGovernance = async (
  tokenAddress: string,
  proposalThreshold: number,
  quorum: number,
  votingPeriod: number
): Promise<void> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }

    const contract = new ethers.Contract(
      networkConfig.governanceAddress,
      ClampifyGovernance,
      signer
    );
    console.log(tokenAddress, proposalThreshold, quorum, votingPeriod);
    // Error activating governance: Error: cannot estimate gas; transaction may fail or may require manual
    // Activate governance
    const tx = await contract.activateGovernance(
      tokenAddress,
      50,
      50, // percentage (e.g., 51 for 51%)
      1000, // in seconds
      {
        gasLimit: 1000000,
      }
    );

    await tx.wait();

    return tx;
  } catch (error) {
    console.error("Error activating governance:", error);
    throw error;
  }
};
