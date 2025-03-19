import { ethers } from "ethers";
import ClampifyFactory from "../../deployments/ClampifyFactory.json";
import ClampifyToken from "../../deployments/ClampifyToken.json";

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

const contract_address: string = "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67"; // Clampify Factory Contract Address

// Add RPC URL for the network you're using (Core DAO testnet)
const RPC_URL = "https://rpc.test2.btcs.network/";

// Create a read-only provider
const readProvider = new ethers.providers.JsonRpcProvider(RPC_URL);

let cachedProvider: ethers.providers.Web3Provider | null = null;
let cachedSigner: ethers.Signer | null = null;

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
}

// Initialize wallet connection
const initializeWallet = async () => {
  if (!ethereum || cachedProvider) return;

  try {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      cachedProvider = new ethers.providers.Web3Provider(ethereum);
      cachedSigner = cachedProvider.getSigner();
    }
  } catch (error) {
    console.error("Failed to initialize wallet:", error);
  }
};

// Only get signer when needed for transactions
const getSigner = async (forceConnect = false) => {
  if (!ethereum) {
    throw new Error("No wallet detected");
  }

  if (cachedSigner && !forceConnect) {
    return cachedSigner;
  }

  const provider = new ethers.providers.Web3Provider(ethereum);

  if (forceConnect) {
    await ethereum.request({ method: "eth_requestAccounts" });
  }

  cachedProvider = provider;
  cachedSigner = provider.getSigner();
  return cachedSigner;
};

// Initialize wallet on module load
if (isBrowser()) {
  initializeWallet();
}

export const Mint = async (
  signer: ethers.Signer,
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
    const contract = new ethers.Contract(
      contract_address,
      ClampifyFactory,
      signer
    );
    const initialPriceWei = ethers.utils.parseEther(initialPrice);
    const depositAmount = ethers.utils.parseEther("0.01");

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
    return tokenCreatedEvent.address;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export const TokenInfo = async (
  tokenAddress: string,
  signer?: ethers.Signer
): Promise<TokenInfo> => {
  try {
    const contract = new ethers.Contract(
      tokenAddress,
      ClampifyToken,
      readProvider
    );

    const [
      name,
      symbol,
      totalSupply,
      decimals,
      initialSupply,
      initialPrice,
      creatorLockupPeriod,
    ] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.decimals(),
      contract.initialSupply(),
      contract.initialPrice(),
      contract.creatorLockupPeriod(),
    ]);

    let balance = "0";
    if (signer) {
      const userAddress = await signer.getAddress();
      balance = (await contract.balanceOf(userAddress)).toString();
    }

    return {
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      decimals,
      balance,
      creatorLockupPeriod: creatorLockupPeriod.toString(),
      initialSupply: initialSupply.toString(),
      initialPrice: initialPrice.toString(),
      contractAddress: tokenAddress,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

// Export connect function for explicit wallet connections
export const connectWallet = async () => {
  return getSigner(true);
};
