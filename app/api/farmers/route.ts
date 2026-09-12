import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

function generateFarmerId(state: string, district: string, id: number) {
  const s = state ? state.substring(0, 2).toUpperCase() : 'XX';
  const d = district ? district.substring(0, 4).toUpperCase() : 'XXXX';
  return `${s}-${d}-${1000 + id}`;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const { name, village, state, district, mainCrop, typicalYield, govtId } = await req.json();
    const db = getDb();

    // Ensure defaults if not provided
    const crop = mainCrop || 'Wheat';
    const qty = typicalYield || 50;
    const st = state || 'Haryana';
    const dist = district || 'Karnal';

    // Check if farmer already exists
    const existing = db.prepare('SELECT id FROM farmers WHERE user_id = ?').get(userId) as any;
    if (existing) {
      // Update
      db.prepare(`UPDATE farmers SET name = ?, village = ?, state = ?, district = ?, primary_crop = ?, typical_qty = ?, govt_id = ? WHERE user_id = ?`)
        .run(name, village, st, dist, crop, qty, govtId, userId);
    } else {
      // Insert
      const result = db.prepare(`
        INSERT INTO farmers (user_id, name, village, state, district, primary_crop, typical_qty, govt_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, name, village, st, dist, crop, qty, govtId);
      
      const newId = Number(result.lastInsertRowid);
      const farmerIdStr = generateFarmerId(st, dist, newId);
      db.prepare(`UPDATE farmers SET farmer_id = ? WHERE id = ?`).run(farmerIdStr, newId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
