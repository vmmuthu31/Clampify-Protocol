import { ethers } from "ethers";
import ClampifyFactory from "../../deployments/ClampifyFactory.json";
import ClampifyToken from "../../deployments/ClampifyToken.json";

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

const contract_address: string = "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67"; // Clampify Factory Contract Address

// Add RPC URL for the network you're using (Core DAO testnet)
const RPC_URL = "https://rpc.test2.btcs.network/";

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  tokenAmount: string;
  contractAddress: string;
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
    const provider =
      ethereum != null
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(RPC_URL);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    const contract = new ethers.Contract(
      contract_address,
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

export const TokenReturnOnBuy = async (tokenAddress: string , amount: string): Promise<TokenInfo> => {
  console.log(tokenAddress, amount);
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

    const amountInWei = ethers.utils.parseEther(amount);
    const tokenAmount = await contract.calculatePurchaseReturn(amountInWei);

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

export const buyTokens = async (tokenAddress: string, amount: string): Promise<boolean> => {
  try {
    console.log(tokenAddress, amount);
    console.log("at buy tokens");
    
    const provider = ethereum != null
      ? new ethers.providers.Web3Provider(ethereum)
      : new ethers.providers.JsonRpcProvider(RPC_URL);

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    const amountInWei = ethers.utils.parseEther(amount);
    console.log(amountInWei);
    console.log(amountInWei);
    const contract = new ethers.Contract(tokenAddress, ClampifyToken, signer);
    
    console.log(contract);

    // Convert amount to Wei
    // const amountInWei = ethers.utils.parseEther("0.001");

    // Execute buy transaction
    const tx = await contract.buyTokens(amountInWei,{
      value: amountInWei    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Buy transaction confirmed:", receipt);

    return true;
  } catch (error) {
    console.error("Buy tokens error:", error);
    throw error;
  }
};
