import Web3 from "web3";
import { ethers } from "ethers";
import abi from "../../deployments/ClampifyFactory.json";
import abi2 from "../../deployments/ClampifyToken.json";
const isBrowser = () => typeof window !== "undefined";

const { ethereum } = isBrowser();

if (ethereum) {
  isBrowser().web3 = new Web3(ethereum);
  isBrowser().web3 = new Web3(isBrowser().web3.currentProvider);
}

const contract_address = "0xB0E24F418A4A36B6F08947A949196e0F3FD09B67"; //factory


export const Mint = async (
    name,
    symbol,
    initialSupply,
    maxSupply,
    initialPrice,
    creatorLockupPeriod,
    lockLiquidity,
    liquidityLockPeriod
) => {
    try {
        const provider = window.ethereum != null 
            ? new ethers.providers.Web3Provider(window.ethereum) 
            : ethers.providers.getDefaultProvider();

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
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
                // gasLimit: 3000000
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
        
        



        // const tokenInfo = await contract.getTokenInfo(tokenAddress);




        
        
        

        return tokenInfo;
    } catch (error) {
        console.error("Detailed error:", error);
        throw error;
    }
}