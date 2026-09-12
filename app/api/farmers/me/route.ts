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
    
    // Get farmer profile with mobile number
    const farmer = db.prepare(`
      SELECT f.*, u.mobile 
      FROM farmers f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.user_id = ?
    `).get(userId) as any;
    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });
    }

    // Check for active token
    const activeToken = db.prepare(`
      SELECT t.id, t.token_no as tokenNo, t.status, c.name as centre, s.slot_start || '–' || s.slot_end as slot
      FROM tokens t
      JOIN procurement_centres c ON t.centre_id = c.id
      JOIN slots s ON t.slot_id = s.id
      WHERE t.farmer_id = ? AND t.status IN ('BOOKED', 'ARRIVED', 'VERIFIED', 'WEIGHED')
      ORDER BY t.created_at DESC LIMIT 1
    `).get(farmer.id) as any;

    if (activeToken) {
      activeToken.ahead = 12; // Mock wait calculation
      activeToken.wait = 25;
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        farmer,
        activeToken: activeToken || null
      }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Unauthorized or Internal Error' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    const body = await req.json();
    const { profile_photo } = body;

    if (profile_photo === undefined) {
      return NextResponse.json({ success: false, error: 'Bad Request: profile_photo is required' }, { status: 400 });
    }

    const db = getDb();
    
    // First, verify the farmer exists for this user
    const farmer = db.prepare('SELECT id FROM farmers WHERE user_id = ?').get(userId) as any;
    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });
    }

    // Update the profile photo
    db.prepare('UPDATE farmers SET profile_photo = ?, updated_at = datetime("now") WHERE id = ?').run(profile_photo, farmer.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Unauthorized or Internal Error' }, { status: 401 });
  }
}

