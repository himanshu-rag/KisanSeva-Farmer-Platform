import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function GET() {
  try {
    const db = getDb();
    const locations = db.prepare('SELECT * FROM service_locations WHERE is_active = 1 ORDER BY state, district, village').all();
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET);
    if (payload.role !== 'ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { state, district, village } = await req.json();
    const db = getDb();
    db.prepare('INSERT INTO service_locations (state, district, village) VALUES (?, ?, ?)').run(state, district, village);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
