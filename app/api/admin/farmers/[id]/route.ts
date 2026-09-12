import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: farmerIdStr } = await params;
    const db = getDb();
    
    // Get farmer profile with mobile number
    const farmer = db.prepare(`
      SELECT f.*, u.mobile 
      FROM farmers f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.farmer_id = ?
    `).get(farmerIdStr) as any;

    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });
    }

    // Get active tokens
    const activeTokens = db.prepare(`
      SELECT t.id, t.token_no as tokenNo, c.name as centre, s.slot_start || '–' || s.slot_end as slot, t.status, cr.name_en as crop_name, cr.msp_per_qt as msp
      FROM tokens t
      JOIN procurement_centres c ON t.centre_id = c.id
      JOIN slots s ON t.slot_id = s.id
      JOIN crops cr ON t.crop_id = cr.id
      WHERE t.farmer_id = ? AND t.status IN ('BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED')
      ORDER BY t.created_at DESC
    `).all(farmer.id) as any;

    // Get payment history (procured tokens)
    const historyTokens = db.prepare(`
      SELECT t.id, t.token_no as tokenNo, c.name as centre, s.slot_start || '–' || s.slot_end as slot, t.status, t.quantity, cr.name_en as crop_name, cr.msp_per_qt as msp
      FROM tokens t
      JOIN procurement_centres c ON t.centre_id = c.id
      JOIN slots s ON t.slot_id = s.id
      JOIN crops cr ON t.crop_id = cr.id
      WHERE t.farmer_id = ? AND t.status IN ('PROCURED', 'CANCELLED')
      ORDER BY t.created_at DESC
    `).all(farmer.id) as any;

    return NextResponse.json({ 
      success: true, 
      data: {
        farmer,
        activeTokens,
        historyTokens
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
