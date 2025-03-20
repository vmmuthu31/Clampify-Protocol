import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await dbConnect();
    const address = params.address;
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );
    }

    const tokens = await Token.find({ 
      creator: address.toLowerCase() 
    });

    return NextResponse.json({ 
      success: true, 
      tokens 
    });
  } catch (error) {
    console.error("Error fetching creator tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch creator tokens" },
      { status: 500 }
    );
  }
} 