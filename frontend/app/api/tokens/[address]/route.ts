import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
): Promise<NextResponse> => {
  try {
    await dbConnect();
    const { address } = await params;
    const { searchParams } = new URL(req.url);
    const chainId = searchParams.get("chainId");

    // Create query with required address and optional chainId
    const query: { address: string; chainId?: string } = { address };
    if (chainId) {
      query.chainId = chainId;
    }

    const token = await Token.findOne(query);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch token" },
      { status: 500 }
    );
  }
};
