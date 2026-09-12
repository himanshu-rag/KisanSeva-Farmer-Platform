import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET);
    if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Get all centres with queue and capacity
    const centres = db.prepare(`
      SELECT c.id, c.name, c.district, c.total_capacity as capacity,
             COUNT(t.id) as queue
      FROM procurement_centres c
      LEFT JOIN tokens t ON c.id = t.centre_id AND t.status IN ('BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED')
      LEFT JOIN slots s ON t.slot_id = s.id AND s.date = ?
      GROUP BY c.id
    `).all(today) as any[];

    // Format expected farmers (mock calculation)
    const formatted = centres.map(c => ({
      ...c,
      expected: Math.round(c.queue * 1.2), // mock forecast
      risk: c.queue > c.capacity * 0.9 ? 'CRITICAL' : c.queue > c.capacity * 0.7 ? 'BUSY' : 'NORMAL'
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
