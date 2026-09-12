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

    const tokenHeader = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(tokenHeader, JWT_SECRET);
    const userId = payload.userId as number;

    const { centreId, slotId, cropId, quantity } = await req.json();
    const db = getDb();

    const farmer = db.prepare('SELECT id FROM farmers WHERE user_id = ?').get(userId) as any;
    if (!farmer) return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });

    const farmerId = farmer.id;

    // Generate Token No
    const maxToken = db.prepare('SELECT MAX(id) as m FROM tokens').get() as any;
    const tokenNo = `A${100 + (maxToken?.m || 0) + 1}`;
    
    db.exec('BEGIN IMMEDIATE TRANSACTION');
    try {
      const tokenResult = db.prepare(`
        INSERT INTO tokens (token_no, farmer_id, centre_id, slot_id, crop_id, quantity, status, booked_at)
        VALUES (?, ?, ?, ?, ?, ?, 'BOOKED', CURRENT_TIMESTAMP)
      `).run(tokenNo, farmerId, centreId, slotId, cropId || 1, quantity);

      const tokenId = Number(tokenResult.lastInsertRowid);

      db.prepare(`
        UPDATE slots SET booked = booked + 1 WHERE id = ?
      `).run(slotId);

      const pos = db.prepare('SELECT MAX(position) as p FROM queue_entries WHERE centre_id = ?').get(centreId) as any;
      db.prepare(`
        INSERT INTO queue_entries (token_id, centre_id, position, is_current)
        VALUES (?, ?, ?, 0)
      `).run(tokenId, centreId, (pos?.p || 0) + 1);

      db.exec('COMMIT');
      return NextResponse.json({ success: true, token: { id: tokenId, tokenNo } });
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
