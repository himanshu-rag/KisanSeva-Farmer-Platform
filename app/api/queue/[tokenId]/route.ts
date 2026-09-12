import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;
    const db = getDb();

    // In a real app we'd calculate exact queue position
    // For demo, we just mock based on token No
    
    return NextResponse.json({ 
      success: true, 
      data: {
        tokenNo: tokenId,
        serving: 'A113',
        ahead: 12,
        wait: 25,
        arriveBy: '09:50 AM'
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
