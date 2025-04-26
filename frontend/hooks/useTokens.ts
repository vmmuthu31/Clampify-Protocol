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

export function useTokens() {
  const dispatch = useAppDispatch();

  // Selectors
  const tokens = useAppSelector((state) => state.tokens.tokens);
  const allTokens = useAppSelector((state) =>
    state.tokens.allTokens.map((id) => state.tokens.tokens[id])
  );
  const featuredTokens = useAppSelector((state) =>
    state.tokens.featuredTokens.map((id) => state.tokens.tokens[id])
  );
  const trendingTokens = useAppSelector((state) =>
    state.tokens.trendingTokens.map((id) => state.tokens.tokens[id])
  );
  const newTokens = useAppSelector((state) =>
    state.tokens.newTokens.map((id) => state.tokens.tokens[id])
  );
  const userTokens = useAppSelector((state) =>
    state.tokens.userTokens.map((id) => state.tokens.tokens[id])
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
    (tokenId: string) => {
      return tokens[tokenId];
    },
    [tokens]
  );

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

    // Actions
    fetchAllTokens,
    fetchTokenById,
    fetchCreatorTokens,
    fetchUserTokenHoldings,
    createToken,
    updatePrice,
    getTokenById,
  };
}
