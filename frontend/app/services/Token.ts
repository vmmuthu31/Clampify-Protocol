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

interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  balance: string;
}

export const TokenInfo = async (
   
    tokenAddress: string
): Promise<TokenInfo> => {
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
        
        const contract = new ethers.Contract(tokenAddress, abi2, signer);

       
        // Get creation fee from contract
        
    
        console.log("contract", contract);
        
        // Create token
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const decimals = await contract.decimals();
        const balance = await contract.balanceOf(userAddress);



 
   

        return {
            name,
            symbol,
            totalSupply,
            decimals,
            balance
        };
    } catch (error) {
        console.error("Detailed error:", error);
        throw error;
    }
}; 