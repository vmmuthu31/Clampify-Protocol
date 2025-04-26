import { NextResponse } from "next/server";
import Token from "../../../models/Token";
import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";

export async function POST(req: Request) {
  try {
    // Connect to database
    await dbConnect();

    const body = await req.json();

    // Extract token parameters from request body
    const {
      address,
      chainId,
      chainName,
      name,
      symbol,
      creator,
      initialSupply,
      maxSupply,
      initialPrice,
      creatorLockupPeriod,
      lockLiquidity,
      liquidityLockPeriod,
      image,
    } = body;

    // Validate required fields
    if (!address || !chainId || !chainName || !name || !symbol || !creator) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if token already exists with same address and chainId
    const existingToken = await Token.findOne({
      address: address.toLowerCase(),
      chainId,
    });

    if (existingToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Token with this address already exists on this chain",
        },
        { status: 409 }
      );
    }

    // Create a new token document
    const newToken = new Token({
      address: address.toLowerCase(),
      chainId,
      chainName,
      name,
      symbol,
      creator: creator.toLowerCase(),
      initialSupply,
      maxSupply,
      initialPrice,
      creatorLockupPeriod,
      lockLiquidity,
      liquidityLockPeriod,
      image: image || "",
    });

    // Save token to database
    await newToken.save();

    return NextResponse.json({
      success: true,
      message: "Token created successfully",
      data: newToken,
    });
  } catch (error) {
    console.error("Error creating token:", error);

    // Handle MongoDB duplicate key error specifically
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error: " + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create token",
      },
      { status: 500 }
    );
  }
}
