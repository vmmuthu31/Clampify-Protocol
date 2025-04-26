import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTransactionsThunk,
  recordTransactionThunk,
} from "../thunks/transactionThunks";

// Define types for transaction data
export interface Transaction {
  id?: string;
  tokenId: string;
  userAddress: string;
  type: "BUY" | "SELL";
  amount: string;
  price: string;
  timestamp: string;
  txHash: string;
}

export interface TransactionState {
  transactions: Record<string, Transaction>;
  tokenTransactions: Record<string, string[]>; // tokenId -> array of transaction ids
  userTransactions: Record<string, string[]>; // userAddress -> array of transaction ids
  recentTransactions: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: {},
  tokenTransactions: {},
  userTransactions: {},
  recentTransactions: [],
  loading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = {};
      state.tokenTransactions = {};
      state.userTransactions = {};
      state.recentTransactions = [];
    },
  },
  extraReducers: (builder) => {
    // Handle fetching transactions
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { tokenId, transactions } = action.payload;

        // Normalize the transactions
        const transactionIds: string[] = [];

        transactions.forEach((transaction: Transaction) => {
          const id = transaction.id || transaction.txHash;
          state.transactions[id] = transaction;
          transactionIds.push(id);

          // Add to user transactions
          if (!state.userTransactions[transaction.userAddress]) {
            state.userTransactions[transaction.userAddress] = [];
          }
          if (!state.userTransactions[transaction.userAddress].includes(id)) {
            state.userTransactions[transaction.userAddress].push(id);
          }
        });

        // Set the token's transactions
        state.tokenTransactions[tokenId] = transactionIds;

        // Update recent transactions
        state.recentTransactions = [
          ...transactionIds,
          ...state.recentTransactions,
        ]
          .filter((id, index, self) => self.indexOf(id) === index)
          .slice(0, 50); // Keep only the most recent 50
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch transactions";
      })

      // Handle recording a new transaction
      .addCase(recordTransactionThunk.pending, () => {
        // We don't set the whole state to loading here, just handle it at the component level
      })
      .addCase(recordTransactionThunk.fulfilled, (state, action) => {
        const transaction = action.payload;
        if (transaction) {
          const id = transaction.id || transaction.txHash;

          // Add transaction to normalized store
          state.transactions[id] = transaction;

          // Add to token transactions
          if (!state.tokenTransactions[transaction.tokenId]) {
            state.tokenTransactions[transaction.tokenId] = [];
          }
          if (!state.tokenTransactions[transaction.tokenId].includes(id)) {
            state.tokenTransactions[transaction.tokenId].unshift(id);
          }

          // Add to user transactions
          if (!state.userTransactions[transaction.userAddress]) {
            state.userTransactions[transaction.userAddress] = [];
          }
          if (!state.userTransactions[transaction.userAddress].includes(id)) {
            state.userTransactions[transaction.userAddress].unshift(id);
          }

          // Add to recent transactions
          if (!state.recentTransactions.includes(id)) {
            state.recentTransactions.unshift(id);
            if (state.recentTransactions.length > 50) {
              state.recentTransactions = state.recentTransactions.slice(0, 50);
            }
          }
        }
      })
      .addCase(recordTransactionThunk.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to record transaction";
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
