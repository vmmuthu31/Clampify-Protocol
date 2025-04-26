import { TokenData } from "@/lib/redux/slices/tokensSlice";
import { Transaction } from "@/lib/redux/slices/transactionsSlice";

interface TokenRecord {
  address: string;
  timestamp?: string;
  id?: string;
  type?: string;
  amount?: string;
  price?: string;
  txHash?: string;
  name?: string;
  symbol?: string;
}

// Type for token creation
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

interface TransactionRecord {
  address: string;
  chainId: string;
  chainName: string;
  creator: string;
  type: "BUY" | "SELL" | "CREATE";
  amount?: string;
  price?: string;
  txHash?: string;
  name?: string;
  symbol?: string;
}

/**
 * Centralized API service for all token and transaction related API calls
 */
class ApiService {
  // Base API URL
  private baseUrl = "/api";

  // Token related API calls
  async getAllTokens(): Promise<TokenData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error("Error fetching tokens:", error);
      throw error;
    }
  }

  async getTokenById(tokenId: string): Promise<TokenData> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${tokenId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error(`Error fetching token ${tokenId}:`, error);
      throw error;
    }
  }

  async getCreatorTokens(address: string): Promise<TokenData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/creator/${address}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error(`Error fetching creator tokens for ${address}:`, error);
      throw error;
    }
  }

  async getUserTokens(address: string): Promise<TokenData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/user/${address}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error(`Error fetching user tokens for ${address}:`, error);
      throw error;
    }
  }

  async createToken(tokenData: TokenCreationParams): Promise<TokenData> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenData),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  }

  // Transaction related API calls
  async getTokenTransactions(tokenId: string): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?tokenId=${tokenId}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error(`Error fetching transactions for token ${tokenId}:`, error);
      throw error;
    }
  }

  async getUserTransactions(userAddress: string): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?userAddress=${userAddress}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error(
        `Error fetching transactions for user ${userAddress}:`,
        error
      );
      throw error;
    }
  }

  async recordTransaction(transactionData: {
    address: string;
    creator: string;
    type: "BUY" | "SELL";
    amount: string;
    price: string;
    txHash: string;
    name: string;
    symbol: string;
  }): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.transaction;
    } catch (error) {
      console.error("Error recording transaction:", error);
      throw error;
    }
  }
}

// Export a single instance of the API service
export const apiService = new ApiService();

// For backwards compatibility with existing code
export const getTokenTransactions = async (tokenId: string) => {
  const transactions = await apiService.getTokenTransactions(tokenId);
  return { transactions };
};

export const createTokenRecord = async (tokenData: TokenRecord) => {
  try {
    const response = await fetch("/api/transactions ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      throw new Error("Failed to create token record");
    }

    return {
      success: true,
      data: await response.json(),
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const recordTransaction = async (transactionData: TransactionRecord) => {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transaction API error:", response.status, errorText);
      throw new Error(
        `Failed to record transaction: ${response.status} ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }
};

export const getTokenDetails = async (address: string, chainId?: string) => {
  let url = `/api/tokens?address=${address}`;
  if (chainId) {
    url += `&chainId=${chainId}`;
  }
  const response = await fetch(url);
  return response.json();
};

export const getAllTokens = async (chainId?: string) => {
  try {
    let url = "/api/tokens";
    if (chainId) {
      url += `?chainId=${chainId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch tokens");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
};

export const getUserTokens = async (address: string, chainId?: string) => {
  try {
    let url = `/api/tokens/user/${address}`;
    if (chainId) {
      url += `?chainId=${chainId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch user tokens");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    throw error;
  }
};
