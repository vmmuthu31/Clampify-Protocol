import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    // Mock data
    const tokens = [
      {
        _id: "1",
        address: "0x123...",
        name: "User Test Token",
        symbol: "UTEST",
        creator: address,
        initialSupply: "1000000",
        maxSupply: "10000000",
        createdAt: new Date().toISOString(),
      }
    ];

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user tokens' },
      { status: 500 }
    );
  }
} 