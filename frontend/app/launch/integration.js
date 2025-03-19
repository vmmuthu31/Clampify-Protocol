import Web3 from "web3";
import { ethers } from "ethers";
import abi from "../../deployments/Clampify.json";

const isBrowser = () => typeof window !== "undefined";

const {ethereum } = isBrowser();

if (ethereum){
    isBrowser().web3 = new Web3(ethereum);
    isBrowser().web3 = new Web3(isBrowser().web3.currentProvider);
}

const contract_address = "0x86E47CBf56d01C842AC036A56C8ea2fE0168a2D1";
const platform_token_address = "0x2B65Eba61bac37Ae872bEFf9d1932129B0ed24ee";

// Full ERC20 ABI
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export const Mint = async (name, symbol, totalSupply, creatorLockPercentage, creatorLockDuration, initialLiquidityAmount, initialPrice, enableStability, useBondingCurve) => {
    try {
        const provider = window.ethereum != null ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
        const network = await provider.getNetwork();
        if (network.chainId !== 1114) {
            throw new Error("Please connect to CoreDAO Testnet (Chain ID: 1114)");
        }

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const contract = new ethers.Contract(contract_address, abi, signer);
        const platformToken = new ethers.Contract(platform_token_address, ERC20_ABI, signer);

        // Convert values to wei format - use much smaller values for testing
        const initialPriceInWei = ethers.utils.parseEther("0.000001"); // Very small initial price
        const totalSupplyBN = ethers.utils.parseUnits("10", "ether"); // Small total supply
        const liquidityAmountInWei = ethers.utils.parseEther("0.001"); // Small liquidity amount

        // Calculate creation fee (2% of total supply)
        const creationFee = totalSupplyBN.mul(200).div(10000);
        
        console.log("Debug Info:", {
            userAddress,
            initialPrice: ethers.utils.formatEther(initialPriceInWei),
            totalSupply: ethers.utils.formatEther(totalSupplyBN),
            liquidityAmount: ethers.utils.formatEther(liquidityAmountInWei),
            creationFee: ethers.utils.formatEther(creationFee)
        });

        // Check platform token balance
        const balance = await platformToken.balanceOf(userAddress);
        console.log("Platform Token Balance:", ethers.utils.formatEther(balance), "tokens");
        
        // Check CoreDAO balance
        const coreBalance = await provider.getBalance(userAddress);
        console.log("CoreDAO Balance:", ethers.utils.formatEther(coreBalance), "CORE");

        // First approve platform tokens
        console.log("Approving platform tokens...");
        const approveTx = await platformToken.approve(contract_address, creationFee);
        await approveTx.wait();
        console.log("Platform tokens approved");

        // Verify approval
        const allowance = await platformToken.allowance(userAddress, contract_address);
        console.log("New allowance:", ethers.utils.formatEther(allowance), "tokens");

        // Create token with lower values
        console.log("Creating token...");
        const tx = await contract.createMemeToken(
            name,
            symbol, 
            totalSupplyBN,
            creatorLockPercentage,
            creatorLockDuration,
            liquidityAmountInWei,
            initialPriceInWei,
            enableStability,
            useBondingCurve,
            { 
                gasLimit: 3000000,
                value: liquidityAmountInWei
            }
        );

        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return tx;
    } catch (error) {
        console.error("Detailed error:", error);
        throw error;
    }
}