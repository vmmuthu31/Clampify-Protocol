import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse> => {
  try {
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const chainId = searchParams.get("chainId");

    await dbConnect();

    // Create query with required creator and optional chainId
    const query: { creator: string; chainId?: string } = { creator: address };
    if (chainId) {
      query.chainId = chainId;
    }

    // Find tokens where creator matches the address and optional chainId
    const tokens = await Token.find(query);

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user tokens" },
      { status: 500 }
    );
  }
};
