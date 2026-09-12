import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const db = getDb();
    
    const farmer = db.prepare('SELECT id FROM farmers WHERE user_id = ?').get(userId) as any;
    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });
    }

    // Get all past tokens (Procured/Cancelled)
    const history = db.prepare(`
      SELECT 
        t.id, t.token_no, t.status, t.quantity, 
        c.name as centre, 
        s.date as date_str, s.slot_start || '–' || s.slot_end as time_str,
        cr.name_en as crop_name, cr.msp_per_qt as msp,
        t.procured_at, t.created_at
      FROM tokens t
      JOIN procurement_centres c ON t.centre_id = c.id
      JOIN slots s ON t.slot_id = s.id
      JOIN crops cr ON t.crop_id = cr.id
      WHERE t.farmer_id = ? AND t.status IN ('PROCURED', 'CANCELLED', 'BOOKED')
      ORDER BY t.created_at DESC
    `).all(farmer.id);

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
