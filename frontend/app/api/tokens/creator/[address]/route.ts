import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const creator = (await params).address;
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId");

    await dbConnect();

    // Create query with required creator and optional chainId
    const query: { creator: string; chainId?: string } = { creator };
    if (chainId) {
      query.chainId = chainId;
    }

    const tokens = await Token.find(query);

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
