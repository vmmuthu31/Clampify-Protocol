# Core Paymaster SDK

An SDK for interacting with the Core Paymaster contract on Core Testnet (Chain ID 1114). This SDK simplifies the process of managing and using a paymaster contract for ERC-4337 Account Abstraction.

## Features

- Manage paymaster whitelist and gas limits
- Deposit funds to the paymaster
- Withdraw funds from the paymaster
- Attach the paymaster to user operations
- Monitor paymaster events
- Interact with bundlers to send user operations

## Installation

```bash
npm install core-paymaster-sdk
```

## Quick Start

```typescript
import { ethers } from "ethers";
import { createPaymasterClient, createBundlerClient } from "core-paymaster-sdk";

// Create a provider for Core Testnet
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.test.btcs.network"
);

// Create a wallet for signing transactions
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Create the paymaster client
const paymasterClient = createPaymasterClient(wallet);

// Check paymaster balance
const balance = await paymasterClient.getBalance();
console.log(`Paymaster balance: ${ethers.utils.formatEther(balance)} ETH`);

// Whitelist a smart contract account
const tx = await paymasterClient.setWhitelistedAccount(
  "0xYourSmartContractAddress",
  true
);
await tx.wait();

// Set a gas limit for the account
await paymasterClient.setAccountGasLimit(
  "0xYourSmartContractAddress",
  ethers.utils.parseEther("0.01") // 0.01 ETH gas limit
);

// Listen for gas payment events
paymasterClient.on("GasPaymentMade", (account, gasAmount) => {
  console.log(
    `Gas payment made for ${account}: ${ethers.utils.formatEther(
      gasAmount
    )} ETH`
  );
});
```

## Using with a Bundler

```typescript
import { ethers } from "ethers";
import { createBundlerClient } from "core-paymaster-sdk";

// Create a bundler client (replace with your preferred bundler URL)
const bundlerClient = createBundlerClient("https://your-bundler-url");

// Send a user operation via the bundler
const userOp = {
  sender: "0xYourSmartContractAddress",
  nonce: "0x01",
  callData: "0xcallDataHex",
  // Other userOp fields...
  paymasterAndData: "0x9A5e0F8D2153c8391b098FfCB2404149D7e0b402", // The paymaster address
};

// Send the operation
const userOpHash = await bundlerClient.sendUserOperation(userOp);
console.log(`UserOperation hash: ${userOpHash}`);

// Monitor the status
const status = await bundlerClient.getUserOperationStatus(userOpHash);
console.log(`Status: ${status.state}`);
```

## Advanced Usage

See the [examples](./examples) directory for more advanced usage patterns.

## Configuration

The SDK can be customized with various configuration options:

```typescript
// Custom configuration
const paymasterClient = createPaymasterClient(wallet, {
  paymasterAddress: "0xCustomPaymasterAddress",
  entryPointAddress: "0xCustomEntryPointAddress",
  chainId: 1114, // Core Testnet
});
```

## API Reference

### PaymasterClient

A client for interacting with the paymaster contract.

#### Methods

- `deposit(amount)` - Deposit funds to the paymaster
- `withdraw(amount)` - Withdraw funds from the paymaster
- `getBalance()` - Get the current balance of the paymaster
- `isEnabled()` - Check if the paymaster is enabled
- `setEnabled(enabled)` - Enable or disable the paymaster
- `setWhitelistedAccount(account, whitelisted)` - Add or remove an account from the whitelist
- `setAccountGasLimit(account, gasLimit)` - Set a gas limit for an account
- `batchSetWhitelistedAccounts(accounts, whitelisted)` - Batch whitelist multiple accounts
- `resetAccountGasUsed(account)` - Reset the gas usage counter for an account
- `isAccountWhitelisted(account)` - Check if an account is whitelisted
- `getAccountGasLimit(account)` - Get account gas limit
- `getAccountGasUsed(account)` - Get account gas used
- `getAccountGasDetails(account)` - Get all gas details for an account
- `on(event, callback)` - Add an event listener
- `off(event, callback)` - Remove an event listener
- `attachToUserOperation(userOp, extraData)` - Attach the paymaster to a user operation

### BundlerClient

A client for interacting with ERC-4337 bundlers.

#### Methods

- `sendUserOperation(userOp)` - Send a user operation to the bundler
- `getUserOperationStatus(userOpHash)` - Get the status of a user operation
- `estimateUserOperationGas(userOp)` - Estimate gas for a user operation
- `getSupportedEntryPoints()` - Get the supported entry points by the bundler
- `isEntryPointSupported(entryPointAddress)` - Check if the bundler supports a specific entry point

## License

MIT
