import { ethers } from "ethers";
import abi from "../../deployments/ClampifyFactory.json";
import abi2 from "../../deployments/ClampifyToken.json";

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

const contract_address: string = "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67"; // Clampify Factory Contract Address

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
        : new ethers.providers.JsonRpcProvider();

    const signer = ethereum != null ? provider.getSigner() : null;

    if (!signer) {
      throw new Error("No wallet connected");
    }
    const contract = new ethers.Contract(contract_address, abi, signer);

    // Create token
    const tx = await contract.createToken(
      name,
      symbol,
      initialSupply,
      maxSupply,
      initialPrice,
      creatorLockupPeriod,
      lockLiquidity,
      liquidityLockPeriod,
      {
        value: ethers.utils.parseEther("0.01"),
      }
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    const tokenCreatedEvent = receipt.events[0];
    const tokenAddress = tokenCreatedEvent.address;
    console.log("Token created at address:", tokenAddress);

    const tokenContract = new ethers.Contract(tokenAddress, abi2, signer);

    const tokenInfo = await tokenContract.name();
    console.log("Token info:", tokenInfo);

    const tokenSymbol = await tokenContract.symbol();
    console.log("Token symbol:", tokenSymbol);

    const tokenSupply = await tokenContract.totalSupply();
    console.log("Token supply:", tokenSupply);

    return tokenAddress;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};
