import { useNetwork } from "@/components/NetworkSelector";
import * as api from "@/services/api";
import { useCallback } from "react";

export function useNetworkApi() {
  const { currentNetwork } = useNetwork();

  // Use useCallback to memoize API functions and prevent recreation on each render
  const createToken = useCallback(
    async (
      tokenData: Omit<
        Parameters<typeof api.createTokenRecord>[0],
        "chainId" | "chainName"
      >
    ) => {
      try {
        const result = await api.createTokenRecord({
          ...tokenData,
        });

        return result;
      } catch (error) {
        console.error("Error in createToken:", error);
        throw error;
      }
    },
    [currentNetwork.chainId, currentNetwork.name]
  );

  const getTokens = useCallback(async () => {
    try {
      const result = await api.getAllTokens(currentNetwork.chainId);

      return result;
    } catch (error) {
      console.error("Error in getTokens:", error);
      throw error;
    }
  }, [currentNetwork.chainId]);

  const getTokenDetails = useCallback(
    async (address: string) => {
      try {
        const result = await api.getTokenDetails(
          address,
          currentNetwork.chainId
        );

        return result;
      } catch (error) {
        console.error("Error in getTokenDetails:", error);
        throw error;
      }
    },
    [currentNetwork.chainId]
  );

  const getUserTokens = useCallback(
    async (address: string) => {
      try {
        const result = await api.getUserTokens(address, currentNetwork.chainId);

        return result;
      } catch (error) {
        console.error("Error in getUserTokens:", error);
        throw error;
      }
    },
    [currentNetwork.chainId]
  );

  const recordTransaction = useCallback(
    async (
      transactionData: Omit<
        Parameters<typeof api.recordTransaction>[0],
        "chainId" | "chainName"
      >
    ) => {
      try {
        const result = await api.recordTransaction({
          ...transactionData,
          chainId: currentNetwork.chainId,
          chainName: currentNetwork.name,
        });

        return result;
      } catch (error) {
        console.error("Error in recordTransaction:", error);
        throw error;
      }
    },
    [currentNetwork.chainId, currentNetwork.name]
  );

  const getTokenTransactions = useCallback(
    async (tokenAddress: string) => {
      try {
        const result = await api.getTokenTransactions(tokenAddress);

        return result;
      } catch (error) {
        console.error("Error in getTokenTransactions:", error);
        throw error;
      }
    },
    [currentNetwork.chainId]
  );

  // Return memoized functions to prevent unnecessary re-renders
  return {
    createToken,
    getTokens,
    getTokenDetails,
    getUserTokens,
    recordTransaction,
    getTokenTransactions,
    getCurrentNetwork: useCallback(() => currentNetwork, [currentNetwork]),
  };
}
