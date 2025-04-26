import { createAsyncThunk } from "@reduxjs/toolkit";
import { TokenData } from "../slices/tokensSlice";
import { apiService } from "@/services/api";

interface TokenCreationParams {
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
}

// Fetch all tokens
export const fetchTokenThunk = createAsyncThunk<
  TokenData[],
  void,
  { rejectValue: string }
>("tokens/fetchTokens", async (_, { rejectWithValue }) => {
  try {
    return await apiService.getAllTokens();
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching tokens";
    return rejectWithValue(errorMessage);
  }
});

// Fetch single token details
export const fetchTokenDetailsThunk = createAsyncThunk<
  TokenData | null,
  string,
  { rejectValue: string }
>("tokens/fetchTokenDetails", async (address, { rejectWithValue }) => {
  try {
    return await apiService.getTokenById(address);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching token details";
    return rejectWithValue(errorMessage);
  }
});

// Create new token
export const createTokenThunk = createAsyncThunk<
  TokenData | null,
  TokenCreationParams,
  { rejectValue: string }
>("tokens/createToken", async (tokenData, { rejectWithValue }) => {
  try {
    return await apiService.createToken(tokenData);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while creating the token";
    return rejectWithValue(errorMessage);
  }
});

// Fetch creator tokens
export const fetchCreatorTokensThunk = createAsyncThunk<
  TokenData[],
  string,
  { rejectValue: string }
>("tokens/fetchCreatorTokens", async (address, { rejectWithValue }) => {
  try {
    return await apiService.getCreatorTokens(address);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching creator tokens";
    return rejectWithValue(errorMessage);
  }
});

// Fetch user tokens (tokens owned by user)
export const fetchUserTokensThunk = createAsyncThunk<
  TokenData[],
  string,
  { rejectValue: string }
>("tokens/fetchUserTokens", async (address, { rejectWithValue }) => {
  try {
    return await apiService.getUserTokens(address);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching user tokens";
    return rejectWithValue(errorMessage);
  }
});
