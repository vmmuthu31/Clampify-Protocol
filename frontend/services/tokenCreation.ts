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

const NETWORK_CONFIG: { [key: string]: NetworkConfig } = {
  // core Mainnet
  "1116": {
    factoryAddress: "0x13F4795fFc6A5D75c09F42b06c037ffbe69D0E32",
    governanceAddress: "0x49C2646ca0737Cc603599DeBa191143d94E35026",
    rpcUrl: "https://rpc.ankr.com/core",
  },

  // Soneium
  "1868": {
    factoryAddress: "0x13F4795fFc6A5D75c09F42b06c037ffbe69D0E32",
    governanceAddress: "0x49C2646ca0737Cc603599DeBa191143d94E35026",
    rpcUrl: "https://rpc.soneium.org",
  },

  // Core DAO Testnet
  "1114": {
    factoryAddress: "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67",
    governanceAddress: "0xE383A8EFDC5D0E7a5474da69EBA775ac506953ef",
    rpcUrl: "https://rpc.test2.btcs.network/",
  },
  // Polygon Amoy Testnet
  "80002": {
    factoryAddress: "0x73B4c3eC50D7740Bd789EAe1D2e8Fa461fcBAd70",
    governanceAddress: "0x4ffC9a8Ca69Ce79E989c1b5556bE1d8D3f6a6C94",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
};

const getNetworkConfig = async (): Promise<NetworkConfig> => {
  if (!ethereum) {
    // Default to Core DAO Mainnet if no wallet is connected
    return NETWORK_CONFIG["1116"];
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

    // Create token
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
    throw error;
  }
};

export const TokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
  try {
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    const userAddress: string = await signer.getAddress();
    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const initialSupply = await contract.initialSupply();
    const initialPrice = await contract.getCurrentPrice();
    const creatorLockupPeriod = await contract.creatorLockupPeriod();
    const marketCap = await contract.marketCap();
    const volume24h = await contract.totalVolume();
    const balance = await contract.balanceOf(userAddress);

    return {
      name,
      symbol,
      totalSupply: ethers.utils.formatEther(totalSupply),
      decimals,
      balance,
      creatorLockupPeriod,
      initialSupply,
      initialPrice,
      contractAddress: tokenAddress,
      marketCap,
      volume24h,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
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
    console.log(tokenAddress, title, description, targetContract, callData);
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
