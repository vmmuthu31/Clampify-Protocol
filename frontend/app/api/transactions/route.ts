import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const transaction = await Transaction.create({
      tokenAddress: body.address,
      chainId: body.chainId,
      chainName: body.chainName,
      userAddress: body.creator,
      type: body.type, // For token creation
      amount: body.amount,
      price: body.price,
      txHash: body.txHash,
      name: body.name,
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
    const tokenAddress = searchParams.get("tokenAddress");
    const chainId = searchParams.get("chainId");

    // Create query with optional tokenAddress and chainId
    const query: { tokenAddress?: string; chainId?: string } = {};
    if (tokenAddress) {
      query.tokenAddress = tokenAddress;
    }
    if (chainId) {
      query.chainId = chainId;
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(10);

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
