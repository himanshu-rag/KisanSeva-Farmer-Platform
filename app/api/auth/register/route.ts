import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const { name, village, primaryCrop, quantity, farmerId } = await req.json();
    const db = getDb();

    // Check if farmer already exists
    const existing = db.prepare('SELECT id FROM farmers WHERE user_id = ?').get(userId);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Farmer already registered' }, { status: 400 });
    }

    const res = db.prepare(`
      INSERT INTO farmers (user_id, name, village, primary_crop, typical_qty, farmer_id, language)
      VALUES (?, ?, ?, ?, ?, ?, 'hi')
    `).run(userId, name, village, primaryCrop, quantity, farmerId || null);

    return NextResponse.json({ success: true, farmerId: res.lastInsertRowid });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Unauthorized or Internal Server Error' }, { status: 500 });
  }
}
