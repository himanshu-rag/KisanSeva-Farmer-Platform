import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const todayStr = new Date().toISOString().split('T')[0];

    const slots = db.prepare(`
      SELECT * FROM slots WHERE centre_id = ? AND date = ? ORDER BY slot_start ASC
    `).all(id, todayStr) as any[];

    // Calculate AI Recommendation (lowest booked ratio in the afternoon)
    let recommendedId: number | string | null = null;
    let minUtil = 1.0;

    slots.forEach(s => {
      const startHour = parseInt(s.slot_start.split(':')[0]);
      if (startHour >= 12 && startHour <= 16 && s.status !== 'FULL') {
        const util = s.booked / s.capacity;
        if (util < minUtil) {
          minUtil = util;
          recommendedId = s.id;
        }
      }
    });

    const result = slots.map(s => {
      const isRecommended = s.id === recommendedId;
      return {
        id: s.id,
        label: `${parseInt(s.slot_start.split(':')[0]) > 12 ? parseInt(s.slot_start.split(':')[0]) - 12 : parseInt(s.slot_start.split(':')[0])}–${parseInt(s.slot_end.split(':')[0]) > 12 ? parseInt(s.slot_end.split(':')[0]) - 12 : parseInt(s.slot_end.split(':')[0])} ${parseInt(s.slot_start.split(':')[0]) >= 12 ? 'PM' : 'AM'}`,
        status: s.status === 'FULL' || s.booked >= s.capacity ? 'full' : isRecommended ? 'recommended' : 'available',
        booked: s.booked,
        cap: s.capacity,
        wait: isRecommended ? 10 : 25
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
