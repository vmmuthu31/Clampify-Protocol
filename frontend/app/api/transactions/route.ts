import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Ensure correct network naming
    let tokenName = body.name;
    if (tokenName) {
      // Extract base name without network label if present
      if (tokenName.includes("Testnet") || tokenName.includes("Mainnet")) {
        tokenName = tokenName.replace(/(Testnet|Mainnet)/g, "").trim();
      }

      // Add correct network label based on chainId/chainName
      const isTestnet =
        body.chainName?.toLowerCase().includes("test") ||
        body.chainId === "1114";
      const networkLabel = isTestnet ? "Testnet" : "Mainnet";
      tokenName = `${tokenName} ${networkLabel}`;
    }

    // Ensure userAddress is set, fall back to creator if not provided
    const userAddress = body.userAddress || body.creator;
    if (!userAddress) {
      throw new Error("userAddress or creator is required");
    }

    const transaction = await Transaction.create({
      tokenAddress: body.address,
      chainId: body.chainId,
      chainName: body.chainName,
      userAddress: userAddress, // Use the fallback value
      type: body.type, // For token creation
      amount: body.amount,
      price: body.price,
      txHash: body.txHash,
      name: tokenName, // Use the corrected name
      symbol: body.symbol,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tokenAddress =
      searchParams.get("tokenAddress") || searchParams.get("tokenId");
    const chainId = searchParams.get("chainId");

    console.log(
      `Fetching transactions with tokenAddress: ${tokenAddress}, chainId: ${chainId}`
    );

    // Create query with optional tokenAddress and chainId
    const query: { tokenAddress?: string; chainId?: string } = {};
    if (tokenAddress) {
      // Use exact match for the specific token address
      query.tokenAddress = tokenAddress;
      console.log(`Filtering by tokenAddress: ${tokenAddress}`);
    }
    if (chainId) {
      query.chainId = chainId;
      console.log(`Filtering by chainId: ${chainId}`);
    }

    // Log the final query for debugging
    console.log("MongoDB query:", JSON.stringify(query));

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(10);

    console.log(`Found ${transactions.length} transactions matching query`);

    // Ensure token names have the correct network suffix based on chainId
    const correctedTransactions = transactions.map((tx) => {
      // Make a copy of the transaction that's safe to modify
      const txObject = tx.toObject();

      // Correct token name if needed
      if (txObject.name && txObject.chainId) {
        const isTestnet = txObject.chainName?.toLowerCase().includes("test");
        const correctNetworkName = isTestnet ? "Testnet" : "Mainnet";

        if (
          txObject.name.includes("Mainnet") ||
          txObject.name.includes("Testnet")
        ) {
          const baseName = txObject.name
            .replace(/(Mainnet|Testnet)/g, "")
            .trim();
          txObject.name = `${baseName} ${correctNetworkName}`;
        }
      }

      return txObject;
    });

    return NextResponse.json({
      success: true,
      transactions: correctedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
