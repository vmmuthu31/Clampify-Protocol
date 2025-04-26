import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import {
  fetchTransactionsThunk,
  recordTransactionThunk,
  fetchUserTransactionsThunk,
} from "../lib/redux/thunks/transactionThunks";
import {
  selectAllTransactions,
  selectRecentTransactions,
  selectTransactionsLoading,
  selectTransactionsError,
  selectTransactionsByToken,
  selectTransactionsByUser,
} from "../lib/redux/slices/transactionsSlice";
import { useNetwork } from "@/components/NetworkSelector";

export function useTransactions() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state);
  const { currentNetwork } = useNetwork();

  // Use memoized selectors to prevent unnecessary re-renders
  const transactions = useAppSelector(selectAllTransactions);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const loading = useAppSelector(selectTransactionsLoading);
  const error = useAppSelector(selectTransactionsError);

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
      type: "BUY" | "SELL" | "CREATE";
      amount: string;
      price: string;
      txHash: string;
      name: string;
      symbol: string;
      chainId?: string;
      chainName?: string;
      userAddress?: string;
    }) => {
      // Ensure chainId and chainName are included
      const completeData = {
        ...transactionData,
        chainId: transactionData.chainId || currentNetwork.chainId,
        chainName: transactionData.chainName || currentNetwork.name,
        userAddress: transactionData.userAddress || transactionData.creator,
      };

      return dispatch(recordTransactionThunk(completeData));
    },
    [dispatch, currentNetwork.chainId, currentNetwork.name]
  );

  // Use the cached state reference to avoid hooks-in-callbacks issue
  const getTransactionsByToken = useCallback(
    (tokenId: string) => {
      return selectTransactionsByToken(state, tokenId);
    },
    [state]
  );

  const getTransactionsByUser = useCallback(
    (userAddress: string) => {
      return selectTransactionsByUser(state, userAddress);
    },
    [state]
  );

  return {
    // State
    transactions,
    recentTransactions,
    loading,
    error,
    currentChainId: currentNetwork?.chainId,
    currentChainName: currentNetwork?.name,

    // Actions
    fetchTokenTransactions,
    fetchUserTransactions,
    recordTransaction,
    getTransactionsByToken,
    getTransactionsByUser,
  };
}
