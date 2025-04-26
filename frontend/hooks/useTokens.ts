import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/store";
import {
  fetchTokenThunk,
  fetchTokenDetailsThunk,
  createTokenThunk,
  fetchCreatorTokensThunk,
  fetchUserTokensThunk,
} from "../lib/redux/thunks/tokenThunks";
import { updateTokenPrice } from "../lib/redux/slices/tokensSlice";
import { useNetwork } from "@/components/NetworkSelector";

export function useTokens() {
  const dispatch = useAppDispatch();
  const { currentNetwork } = useNetwork();

  // Selectors
  const tokens = useAppSelector((state) => state.tokens.tokens);
  const allTokens = useAppSelector(
    (state) =>
      state.tokens.allTokens
        .map((id) => state.tokens.tokens[id])
        .filter((token) => token !== undefined) // Filter out undefined tokens
  );
  const featuredTokens = useAppSelector((state) =>
    state.tokens.featuredTokens
      .map((id) => state.tokens.tokens[id])
      .filter((token) => token !== undefined)
  );
  const trendingTokens = useAppSelector((state) =>
    state.tokens.trendingTokens
      .map((id) => state.tokens.tokens[id])
      .filter((token) => token !== undefined)
  );
  const newTokens = useAppSelector((state) =>
    state.tokens.newTokens
      .map((id) => state.tokens.tokens[id])
      .filter((token) => token !== undefined)
  );
  const userTokens = useAppSelector((state) =>
    state.tokens.userTokens
      .map((id) => state.tokens.tokens[id])
      .filter((token) => token !== undefined)
  );
  const currentToken = useAppSelector((state) => state.tokens.currentToken);
  const loading = useAppSelector((state) => state.tokens.loading);
  const error = useAppSelector((state) => state.tokens.error);
  const creationStatus = useAppSelector((state) => state.tokens.creationStatus);
  const creationError = useAppSelector((state) => state.tokens.creationError);

  // Action dispatchers
  const fetchAllTokens = useCallback(() => {
    return dispatch(fetchTokenThunk());
  }, [dispatch]);

  const fetchTokenById = useCallback(
    (tokenId: string) => {
      return dispatch(fetchTokenDetailsThunk(tokenId));
    },
    [dispatch]
  );

  const fetchCreatorTokens = useCallback(
    (address: string) => {
      return dispatch(fetchCreatorTokensThunk(address));
    },
    [dispatch]
  );

  const fetchUserTokenHoldings = useCallback(
    (address: string) => {
      return dispatch(fetchUserTokensThunk(address));
    },
    [dispatch]
  );

  const createToken = useCallback(
    (tokenData: {
      name: string;
      symbol: string;
      initialSupply: string;
      lockPercentage?: number;
      lockDuration?: number;
      buyTax?: string;
      sellTax?: string;
      description?: string;
      website?: string;
      twitter?: string;
      telegram?: string;
    }) => {
      return dispatch(createTokenThunk(tokenData));
    },
    [dispatch]
  );

  const updatePrice = useCallback(
    (tokenId: string, price: number) => {
      dispatch(updateTokenPrice({ tokenId, price }));
    },
    [dispatch]
  );

  const getTokenById = useCallback(
    (address: string) => {
      return tokens[address];
    },
    [tokens]
  );

  // New function to set current token based on chain ID
  const setCurrentTokenForChain = useCallback(async () => {
    if (!currentNetwork?.chainId) return null;

    // If tokens are empty or undefined, fetch them first
    if (allTokens.length === 0) {
      await dispatch(fetchTokenThunk());
      return null; // Return null initially, will be called again after fetch completes
    }

    // Find valid tokens that match the current chain ID
    const validTokensForChain = allTokens.filter(
      (token) => token && token.chainId === currentNetwork.chainId
    );

    // If no matching tokens found, return null
    if (validTokensForChain.length === 0) {
      return null;
    }

    // Use the first valid token
    const tokenForCurrentChain = validTokensForChain[0];

    // If a matching token is found, fetch its details
    if (tokenForCurrentChain) {
      dispatch(fetchTokenDetailsThunk(tokenForCurrentChain.id));
      return tokenForCurrentChain;
    }

    return null;
  }, [allTokens, currentNetwork?.chainId, dispatch]);

  return {
    // State
    tokens,
    allTokens,
    featuredTokens,
    trendingTokens,
    newTokens,
    userTokens,
    currentToken,
    loading,
    error,
    creationStatus,
    creationError,
    currentChainId: currentNetwork?.chainId,

    // Actions
    fetchAllTokens,
    fetchTokenById,
    fetchCreatorTokens,
    fetchUserTokenHoldings,
    createToken,
    updatePrice,
    getTokenById,
    setCurrentTokenForChain,
  };
}
