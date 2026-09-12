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
    if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const centreId = searchParams.get('centreId');
    const date = searchParams.get('date');

    const db = getDb();
    
    let query = `
      SELECT t.id, t.token_no, f.name as farmer_name, f.farmer_id as farmer_uid, u.mobile,
             c.name as centre, s.slot_start || '–' || s.slot_end as slot, s.date as slot_date,
             cr.name_en as crop_name, t.quantity, t.status, t.booked_at
      FROM tokens t
      JOIN farmers f ON t.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      JOIN procurement_centres c ON t.centre_id = c.id
      JOIN slots s ON t.slot_id = s.id
      JOIN crops cr ON t.crop_id = cr.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (centreId) {
      query += ` AND t.centre_id = ?`;
      params.push(centreId);
    }
    if (date) {
      query += ` AND s.date = ?`;
      params.push(date);
    }

    query += ` ORDER BY t.created_at DESC LIMIT 100`;

    const tokens = db.prepare(query).all(...params) as any;

    return NextResponse.json({ success: true, data: tokens });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
