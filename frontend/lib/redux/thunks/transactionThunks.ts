import { createAsyncThunk } from "@reduxjs/toolkit";
import { Transaction } from "../slices/transactionsSlice";

interface TransactionApiResponse {
  transactions?: Transaction[];
  transaction?: Transaction;
  error?: string;
}

interface RecordTransactionParams {
  address: string;
  creator: string;
  type: "BUY" | "SELL" | "CREATE";
  amount: string;
  price: string;
  txHash: string;
  name: string;
  symbol: string;
  chainId: string;
  chainName: string;
  userAddress?: string; // Optional since creator is used as userAddress if not provided
}

// Fetch transactions for a specific token
export const fetchTransactionsThunk = createAsyncThunk<
  { tokenId: string; transactions: Transaction[] },
  string,
  { rejectValue: string }
>("transactions/fetchTransactions", async (tokenId, { rejectWithValue }) => {
  try {
    // Use tokenAddress parameter since we're passing a contract address
    const response = await fetch(`/api/transactions?tokenAddress=${tokenId}`);

    console.log(`Thunk: Fetching transactions for token address: ${tokenId}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: TransactionApiResponse = await response.json();

    console.log(
      `Thunk: Received ${
        data.transactions?.length || 0
      } transactions for token ${tokenId}`
    );

    if (data.error) {
      return rejectWithValue(data.error);
    }

    return {
      tokenId,
      transactions: data.transactions || [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching transactions";
    return rejectWithValue(errorMessage);
  }
});

// Record a new transaction
export const recordTransactionThunk = createAsyncThunk<
  Transaction | null,
  RecordTransactionParams,
  { rejectValue: string }
>(
  "transactions/recordTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      // Ensure userAddress is set (use creator if not explicitly provided)
      const dataToSend = {
        ...transactionData,
        userAddress: transactionData.userAddress || transactionData.creator,
      };

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: TransactionApiResponse = await response.json();

      if (data.error) {
        return rejectWithValue(data.error);
      }

      // Create a properly formatted transaction
      const result = data.transaction;

      if (!result) {
        return null;
      }

      return {
        ...result,
        tokenId: transactionData.address, // Ensure tokenId is set
        timestamp: result.timestamp || new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error recording transaction:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while recording the transaction";
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch user transactions
export const fetchUserTransactionsThunk = createAsyncThunk<
  { userAddress: string; transactions: Transaction[] },
  string,
  { rejectValue: string }
>(
  "transactions/fetchUserTransactions",
  async (userAddress, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/transactions?userAddress=${userAddress}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: TransactionApiResponse = await response.json();

      if (data.error) {
        return rejectWithValue(data.error);
      }

      return {
        userAddress,
        transactions: data.transactions || [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching user transactions";
      return rejectWithValue(errorMessage);
    }
  }
);
