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
    
    // Get stats
    const today = new Date().toISOString().split('T')[0];
    
    const farmersCount = db.prepare('SELECT COUNT(*) as c FROM farmers').get() as any;
    
    // Tokens for today
    const tokensToday = db.prepare(`
      SELECT COUNT(*) as c FROM tokens t
      JOIN slots s ON t.slot_id = s.id
      WHERE s.date = ?
    `).get(today) as any;

    const procured = db.prepare(`
      SELECT SUM(t.quantity) as q FROM tokens t
      JOIN slots s ON t.slot_id = s.id
      WHERE s.date = ? AND t.status = 'PROCURED'
    `).get(today) as any;

    // Tokens by status today
    const statusCounts = db.prepare(`
      SELECT t.status, COUNT(*) as c FROM tokens t
      JOIN slots s ON t.slot_id = s.id
      WHERE s.date = ?
      GROUP BY t.status
    `).all(today) as any[];

    // Tokens by centre today
    const centreQueues = db.prepare(`
      SELECT c.name, COUNT(t.id) as queue
      FROM procurement_centres c
      LEFT JOIN tokens t ON c.id = t.centre_id AND t.status IN ('BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED')
      LEFT JOIN slots s ON t.slot_id = s.id AND s.date = ?
      GROUP BY c.id
    `).all(today) as any[];

    return NextResponse.json({ 
      success: true, 
      data: {
        farmers: farmersCount.c,
        tokensToday: tokensToday.c,
        procuredVol: procured.q || 0,
        statusCounts,
        centreQueues
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
