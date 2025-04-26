import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Validate required fields
    if (
      !body.address ||
      !body.chainId ||
      !body.chainName ||
      !body.name ||
      !body.symbol ||
      !body.creator
    ) {
      console.error("Missing required fields:", {
        address: !!body.address,
        chainId: !!body.chainId,
        chainName: !!body.chainName,
        name: !!body.name,
        symbol: !!body.symbol,
        creator: !!body.creator,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const token = await Token.create({
      address: body.address,
      chainId: body.chainId,
      chainName: body.chainName,
      name: body.name,
      symbol: body.symbol,
      creator: body.creator,
      initialSupply: body.initialSupply,
      maxSupply: body.maxSupply,
      initialPrice: body.initialPrice,
      creatorLockupPeriod: body.creatorLockupPeriod,
      lockLiquidity: body.lockLiquidity,
      liquidityLockPeriod: body.liquidityLockPeriod,
      image: body.image,
    });

    return NextResponse.json({ success: true, token });
  } catch (error: unknown) {
    console.error("Error creating token:", error);
    // Check if it's a mongoose duplicate key error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Token with this address and chainId already exists",
        },
        { status: 409 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create token",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const chainId = searchParams.get("chainId");

    // If chainId is provided, filter by it
    const query = chainId ? { chainId } : {};
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
