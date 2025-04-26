import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import {
  fetchTransactionsThunk,
  recordTransactionThunk,
  fetchUserTransactionsThunk,
} from "../lib/redux/thunks/transactionThunks";

export function useTransactions() {
  const dispatch = useAppDispatch();

  // Selectors
  const transactions = useAppSelector(
    (state) => state.transactions.transactions
  );
  const tokenTransactions = useAppSelector(
    (state) => state.transactions.tokenTransactions
  );
  const userTransactions = useAppSelector(
    (state) => state.transactions.userTransactions
  );
  const recentTransactions = useAppSelector((state) =>
    state.transactions.recentTransactions.map(
      (id) => state.transactions.transactions[id]
    )
  );
  const loading = useAppSelector((state) => state.transactions.loading);
  const error = useAppSelector((state) => state.transactions.error);

  // Action dispatchers
  const fetchTokenTransactions = useCallback(
    (tokenId: string) => {
      return dispatch(fetchTransactionsThunk(tokenId));
    },
    [dispatch]
  );

  const fetchUserTransactions = useCallback(
    (userAddress: string) => {
      return dispatch(fetchUserTransactionsThunk(userAddress));
    },
    [dispatch]
  );

  const recordTransaction = useCallback(
    (transactionData: {
      address: string;
      creator: string;
      type: "BUY" | "SELL";
      amount: string;
      price: string;
      txHash: string;
      name: string;
      symbol: string;
    }) => {
      return dispatch(recordTransactionThunk(transactionData));
    },
    [dispatch]
  );

  const getTransactionsByToken = useCallback(
    (tokenId: string) => {
      const transactionIds = tokenTransactions[tokenId] || [];
      return transactionIds.map((id) => transactions[id]);
    },
    [transactions, tokenTransactions]
  );

  const getTransactionsByUser = useCallback(
    (userAddress: string) => {
      const transactionIds = userTransactions[userAddress] || [];
      return transactionIds.map((id) => transactions[id]);
    },
    [transactions, userTransactions]
  );

  return {
    // State
    transactions,
    recentTransactions,
    loading,
    error,

    // Actions
    fetchTokenTransactions,
    fetchUserTransactions,
    recordTransaction,
    getTransactionsByToken,
    getTransactionsByUser,
  };
}
