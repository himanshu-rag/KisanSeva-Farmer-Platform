import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET);
    if (payload.role !== 'ADMIN' && payload.role !== 'OPERATOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Centre details
    const centre = db.prepare('SELECT id, name, district, total_capacity as capacity FROM procurement_centres WHERE id = ?').get(id) as any;
    if (!centre) return NextResponse.json({ success: false, error: 'Centre not found' }, { status: 404 });

    // Live tokens for today at this centre
    const tokens = db.prepare(`
      SELECT t.id, t.token_no, f.name as farmer_name, t.status,
             s.slot_start || '–' || s.slot_end as slot, s.date as slot_date
      FROM tokens t
      JOIN farmers f ON t.farmer_id = f.id
      JOIN slots s ON t.slot_id = s.id
      WHERE t.centre_id = ? AND s.date = ?
      ORDER BY t.created_at ASC
    `).all(id, today) as any[];

    // Metrics
    const queue = tokens.filter(t => ['BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED'].includes(t.status)).length;
    const completed = tokens.filter(t => t.status === 'PROCURED').length;

    return NextResponse.json({ 
      success: true, 
      data: {
        centre: {
          ...centre,
          queue,
          completed,
          risk: queue > centre.capacity * 0.9 ? 'CRITICAL' : queue > centre.capacity * 0.7 ? 'BUSY' : 'NORMAL'
        },
        tokens
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
