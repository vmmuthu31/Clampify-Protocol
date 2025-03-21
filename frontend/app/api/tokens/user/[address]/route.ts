import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Token from "@/models/Token";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    
    await dbConnect();
    // Find tokens where creator matches the address
    const tokens = await Token.find({ creator: address });

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user tokens' },
      { status: 500 }
    );
  }
} 