import { ethers } from "ethers";
import abi2 from "../../deployments/ClampifyToken.json";

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

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
    const contract = new ethers.Contract(tokenAddress, abi2, signer);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const decimals = await contract.decimals();
    const initialSupply = await contract.initialSupply();
    const initialPrice = await contract.initialPrice();
    const creatorLockupPeriod = await contract.creatorLockupPeriod();
    const balance = await contract.balanceOf(userAddress);

    return {
      name,
      symbol,
      totalSupply,
      decimals,
      balance,
      creatorLockupPeriod,
      initialSupply,
      initialPrice,
      contractAddress: tokenAddress,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};
