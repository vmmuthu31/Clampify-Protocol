import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const token = await Token.create({
      address: body.address,
      name: body.name,
      symbol: body.symbol,
      creator: body.creator,
      initialSupply: body.initialSupply,
      maxSupply: body.maxSupply,
      initialPrice: body.initialPrice,
    });

    // Create a CREATE transaction record
    await Transaction.create({
      tokenAddress: body.address,
      userAddress: body.creator,
      type: "CREATE",
      price: body.initialPrice,
      txHash: body.txHash,
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create token" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const tokens = await Token.find();
    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
