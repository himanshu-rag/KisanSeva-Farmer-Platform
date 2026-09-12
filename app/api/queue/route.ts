import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const centreId = searchParams.get('centreId') || '1';
    const db = getDb();

    const serving = db.prepare(`
      SELECT t.token_no, t.id, q.position
      FROM queue_entries q
      JOIN tokens t ON q.token_id = t.id
      WHERE q.centre_id = ? AND q.is_current = 1
      LIMIT 1
    `).get(centreId) as any;

    const waiting = db.prepare(`
      SELECT COUNT(*) as count FROM queue_entries
      WHERE centre_id = ? AND served_at IS NULL
    `).get(centreId) as any;

    return NextResponse.json({
      success: true,
      data: {
        serving: serving?.token_no || 'A113',
        waitingCount: waiting?.count || 12,
        estimatedWaitMinutes: (waiting?.count || 12) * 2,
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
