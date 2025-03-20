import { ethers } from "ethers";
import { createPaymasterClient, createCoreProvider } from "../src";

async function main() {
  try {
    console.log("Paymaster Management Example");
    console.log("---------------------------");

    // Create a provider
    const provider = createCoreProvider();

    // Get private key (in production, you'd use a secure method)
    const privateKey =
      process.env.PRIVATE_KEY ||
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create the paymaster client
    const paymasterClient = createPaymasterClient(wallet);

    // Get user input for amount to deposit (This would come from your UI)
    const depositAmount = ethers.utils.parseEther("0.1"); // Example: 0.1 ETH

    // Deposit funds to the paymaster
    console.log(
      `Depositing ${ethers.utils.formatEther(
        depositAmount
      )} ETH to the paymaster...`
    );
    const depositTx = await paymasterClient.deposit(depositAmount);
    await depositTx.wait();
    console.log(`Deposit successful! TX: ${depositTx.hash}`);

    // Check updated balance
    const newBalance = await paymasterClient.getBalance();
    console.log(
      `New paymaster balance: ${ethers.utils.formatEther(newBalance)} ETH`
    );

    // Get user's smart contract account address (This would come from your UI)
    const userSmartAccountAddress = "0xUserSmartContractAccountAddress"; // Replace with actual user's smart account

    // Whitelist the user's smart contract account
    console.log(
      `Whitelisting user's smart account ${userSmartAccountAddress}...`
    );
    const whitelistTx = await paymasterClient.setWhitelistedAccount(
      userSmartAccountAddress,
      true
    );
    await whitelistTx.wait();
    console.log(`Account whitelisted successfully! TX: ${whitelistTx.hash}`);

    // Set a gas limit for the user's account (how much you're willing to pay for them)
    const gasLimit = ethers.utils.parseEther("0.05"); // 0.05 ETH gas limit
    const gasLimitTx = await paymasterClient.setAccountGasLimit(
      userSmartAccountAddress,
      gasLimit
    );
    await gasLimitTx.wait();
    console.log(
      `Gas limit set to ${ethers.utils.formatEther(gasLimit)} ETH. TX: ${
        gasLimitTx.hash
      }`
    );

    console.log(
      "\nPaymaster setup complete! The user can now use your paymaster for gas-free transactions."
    );
    console.log(
      `Tell the user to set paymasterAndData to: ${
        paymasterClient.getConfig().paymasterAddress
      } in their UserOperations`
    );
  } catch (error: any) {
    console.error(`An error occurred: ${error.message}`);
  }
}

export { main };
