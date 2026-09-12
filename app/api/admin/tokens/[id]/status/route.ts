import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET);
    if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { status } = await req.json(); // expected: ARRIVED, VERIFIED, WEIGHED, PROCURED
    
    if (!['ARRIVED', 'VERIFIED', 'WEIGHED', 'PROCURED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();
    
    db.prepare('UPDATE tokens SET status = ? WHERE id = ?').run(status, id);

    // If completed, update slots booked ? (Optional, slots track total booked regardless of completion)
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
