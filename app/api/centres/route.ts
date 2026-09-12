import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    const db = getDb();
    seedDatabase();

    const todayStr = new Date().toISOString().split('T')[0];

    const centres = db.prepare(`
      SELECT c.*, 
             IFNULL(cc.booked, 0) as booked,
             IFNULL(cc.total_slots, 0) as capacity
      FROM procurement_centres c
      LEFT JOIN centre_capacity cc ON c.id = cc.centre_id AND cc.date = ?
      WHERE c.is_active = 1
    `).all(todayStr) as any[];

    const result = centres.map(c => {
      const util = c.capacity ? (c.booked / c.capacity) * 100 : 0;
      let crowd = 'low';
      let crowdLabel = '🟢 कम भीड़';
      if (util >= 70) { crowd = 'high'; crowdLabel = '🔴 ज्यादा भीड़'; }
      else if (util >= 30) { crowd = 'medium'; crowdLabel = '🟡 थोड़ी भीड़'; }

      return {
        id: c.id,
        name: c.name_hi || c.name,
        nameEn: c.name,
        district: c.district,
        dist: '4.2 किमी', // Mock distance
        slots: Math.max(0, c.capacity - c.booked),
        crowd,
        crowdLabel
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
