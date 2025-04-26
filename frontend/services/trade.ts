import { ethers } from "ethers";
import ClampifyFactory from "../deployments/ClampifyFactory.json";
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

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  tokenAmount: string;
  contractAddress: string;
}

const getNetworkConfig = async (): Promise<NetworkConfig> => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();

  if (!NETWORK_CONFIG[chainId]) {
    throw new Error(`Network with chain ID ${chainId} is not supported`);
  }

  return NETWORK_CONFIG[chainId];
};

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
export const TokenReturnOnBuy = async (
  tokenAddress: string,
  amount: string
): Promise<TokenInfo> => {
  try {
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    await signer.getAddress();

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();

    // Add gas limit to prevent out of gas error
    const tokenAmount = await contract.calculatePurchaseReturn(amount);

    return {
      name,
      symbol,
      totalSupply,
      tokenAmount,
      contractAddress: tokenAddress,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export const buyTokens = async (
  tokenAddress: string,
  amount: string,
  tokenAmount: string
): Promise<{ hash: string }> => {
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
    const amountInWei = ethers.utils.parseEther(amount);

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);
    const tokenAmountInWei = ethers.utils.parseEther(tokenAmount);

    // Convert amount to Wei
    // const amountInWei = ethers.utils.parseEther("0.001");

    // Execute buy transaction
    const tx = await contract.buyTokens(amountInWei, {
      value: tokenAmountInWei,
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return { hash: receipt.transactionHash };
  } catch (error) {
    console.error("Buy tokens error:", error);
    throw error;
  }
};

export const getRecentTransactions = async (
  tokenAddress: string,
  count: number
) => {
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

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);

    const transactions = await contract.getRecentTransactions(count);

    return {
      accounts: transactions[0],
      isBuys: transactions[1],
      tokenAmounts: transactions[2],
      ethAmounts: transactions[3],
      prices: transactions[4],
      timestamps: transactions[5],
    };
  } catch (error) {
    console.error("Get recent transactions error:", error);
    throw error;
  }
};

export const getTokenBalance = async (tokenAddress: string) => {
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

    const userAddress = await signer.getAddress();
    const contract = new ethers.Contract(tokenAddress, ClampifyToken, provider);

    const balance = await contract.balanceOf(userAddress);

    return balance.toString();
  } catch (error) {
    console.error("Get token balance error:", error);
    throw error;
  }
};

export const TokenReturnOnSell = async (
  tokenAddress: string,
  amount: string
) => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, provider);

    const ethAmount = await contract.calculateSaleReturn(
      ethers.utils.parseEther(amount)
    );

    return {
      ethAmount: ethers.utils.formatEther(ethAmount),
    };
  } catch (error) {
    console.error("Calculate sale return error:", error);
    throw error;
  }
};

export const sellTokens = async (tokenAddress: string, amount: string) => {
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

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);

    const amountInWei = ethers.utils.parseEther(amount);

    const tx = await contract.sellTokens(amountInWei);

    const receipt = await tx.wait();

    return { hash: receipt.transactionHash };
  } catch (error) {
    console.error("Sell tokens error:", error);
    throw error;
  }
};

export const getTokenPrice = async (tokenAddress: string): Promise<string> => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, provider);

    const price = await contract.getCurrentPrice();
    return ethers.utils.formatEther(price);
  } catch (error) {
    console.error("Get token price error:", error);
    throw error;
  }
};

export const getTopHolders = async (tokenAddress: string) => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, provider);

    const [holders, balances, percentages] = await contract.getTopHolders();

    console.log(holders, balances, percentages);

    return holders.length;
  } catch (error) {
    console.error("Get top holders error:", error);
    throw error;
  }
};

export const getCandleData = async (
  tokenAddress: string,
  count: number = 24
) => {
  try {
    const networkConfig = await getNetworkConfig();
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);

    const contract = new ethers.Contract(tokenAddress, ClampifyToken, provider);

    const [timestamps, opens, highs, lows, closes, volumes] =
      await contract.getCandleData(count);

    // Format the data for TradingView
    const candleData = timestamps.map(
      (timestamp: ethers.BigNumber, i: number) => ({
        time: Number(timestamp) * 1000,
        open: parseFloat(ethers.utils.formatEther(opens[i])),
        high: parseFloat(ethers.utils.formatEther(highs[i])),
        low: parseFloat(ethers.utils.formatEther(lows[i])),
        close: parseFloat(ethers.utils.formatEther(closes[i])),
        volume: parseFloat(ethers.utils.formatEther(volumes[i])),
      })
    );

    return candleData;
  } catch (error) {
    console.error("Get candle data error:", error);
    throw error;
  }
};
