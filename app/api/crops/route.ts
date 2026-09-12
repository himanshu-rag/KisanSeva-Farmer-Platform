import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const crops = db.prepare('SELECT * FROM crops WHERE is_active = 1 ORDER BY id').all();
    return NextResponse.json({ success: true, data: crops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
