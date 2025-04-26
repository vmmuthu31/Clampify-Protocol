import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchTokenThunk,
  fetchTokenDetailsThunk,
  createTokenThunk,
} from "../thunks/tokenThunks";

// Define types for token data
export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: string;
  circulatingSupply: string;
  holders: number;
  address: string;
  creator: string;
  image?: string;
  createdAt: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  buyTax?: string;
  sellTax?: string;
  chainId?: string;
  chainName?: string;
}

export interface TokenState {
  tokens: Record<string, TokenData>;
  allTokens: string[];
  featuredTokens: string[];
  trendingTokens: string[];
  newTokens: string[];
  userTokens: string[];
  currentToken: TokenData | null;
  loading: boolean;
  error: string | null;
  creationStatus: "idle" | "loading" | "success" | "failed";
  creationError: string | null;
}

const initialState: TokenState = {
  tokens: {},
  allTokens: [],
  featuredTokens: [],
  trendingTokens: [],
  newTokens: [],
  userTokens: [],
  currentToken: null,
  loading: false,
  error: null,
  creationStatus: "idle",
  creationError: null,
};

const tokensSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    clearCurrentToken: (state) => {
      state.currentToken = null;
    },
    updateTokenPrice: (
      state,
      action: PayloadAction<{ tokenId: string; price: number }>
    ) => {
      const { tokenId, price } = action.payload;
      if (state.tokens[tokenId]) {
        state.tokens[tokenId].price = price;
      }
      if (state.currentToken && state.currentToken.id === tokenId) {
        state.currentToken.price = price;
      }
    },
    resetCreationStatus: (state) => {
      state.creationStatus = "idle";
      state.creationError = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetching all tokens
    builder
      .addCase(fetchTokenThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Store tokens in a normalized way
        const tokens = action.payload;
        tokens.forEach((token: TokenData) => {
          state.tokens[token.id] = token;
          if (!state.allTokens.includes(token.id)) {
            state.allTokens.push(token.id);
          }
        });

        // We could add logic here to filter tokens into featured, trending, etc.
        // This would typically be done server-side, but we can do it here too
        state.newTokens = tokens
          .filter((token: TokenData) => {
            const createdDate = new Date(token.createdAt);
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            return createdDate > threeDaysAgo;
          })
          .map((token: TokenData) => token.id)
          .slice(0, 10);
      })
      .addCase(fetchTokenThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch tokens";
      })

      // Handle fetching a single token details
      .addCase(fetchTokenDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload;
        // Update the token in our store
        if (token) {
          state.tokens[token.id] = token;
          state.currentToken = token;
        }
      })
      .addCase(fetchTokenDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch token details";
      })

      // Handle token creation
      .addCase(createTokenThunk.pending, (state) => {
        state.creationStatus = "loading";
        state.creationError = null;
      })
      .addCase(createTokenThunk.fulfilled, (state, action) => {
        state.creationStatus = "success";
        const token = action.payload;
        // Add the new token to our store
        if (token) {
          state.tokens[token.id] = token;
          state.allTokens.push(token.id);
          state.newTokens.unshift(token.id);
          state.currentToken = token;

          // Add to user tokens if we're tracking those
          if (!state.userTokens.includes(token.id)) {
            state.userTokens.push(token.id);
          }
        }
      })
      .addCase(createTokenThunk.rejected, (state, action) => {
        state.creationStatus = "failed";
        state.creationError =
          (action.payload as string) || "Failed to create token";
      });
  },
});

export const { clearCurrentToken, updateTokenPrice, resetCreationStatus } =
  tokensSlice.actions;
export default tokensSlice.reducer;
