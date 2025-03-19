import Web3 from "web3";
import { ethers } from "ethers";
import abi from "../../deployments/ClampifyFactory.json";
import abi2 from "../../deployments/ClampifyToken.json";

interface Window {
  ethereum?: any;
  web3?: any;
}

declare const window: Window;

const isBrowser = (): boolean => typeof window !== "undefined";

const { ethereum } = isBrowser() ? window : { ethereum: null };

if (ethereum) {
  window.web3 = new Web3(ethereum);
  window.web3 = new Web3(window.web3.currentProvider);
}

const contract_address: string = "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67"; //factory

interface MintParams {
  name: string;
  symbol: string;
  initialSupply: string;
  maxSupply: string;
  initialPrice: string;
  creatorLockupPeriod: string;
  lockLiquidity: boolean;
  liquidityLockPeriod: string;
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
        const provider = window.ethereum != null 
            ? new ethers.providers.Web3Provider(window.ethereum) 
            : new ethers.providers.JsonRpcProvider();

        const signer = window.ethereum != null 
            ? provider.getSigner() 
            : null;

        if (!signer) {
            throw new Error("No wallet connected");
        }

        const userAddress: string = await signer.getAddress();
        
        const contract = new ethers.Contract(contract_address, abi, signer);

        // Convert values to appropriate format
        const initialSupplyWei = ethers.utils.parseEther(initialSupply.toString());
        const maxSupplyWei = ethers.utils.parseEther(maxSupply.toString());
        const initialPriceWei = ethers.utils.parseEther(initialPrice.toString());
        
        // Get creation fee from contract
        const creationFee = await contract.creationFee();
        
        console.log("Debug Info:", {
            userAddress,
            name,
            symbol,
            initialSupply: ethers.utils.formatEther(initialSupplyWei),
            maxSupply: ethers.utils.formatEther(maxSupplyWei),
            initialPrice: ethers.utils.formatEther(initialPriceWei),
            creatorLockupPeriod,
            lockLiquidity,
            liquidityLockPeriod,
            creationFee: ethers.utils.formatEther(creationFee)
        });

        console.log("contract", contract);
        
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