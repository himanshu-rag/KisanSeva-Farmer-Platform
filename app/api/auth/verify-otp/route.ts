import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

export async function POST(req: NextRequest) {
  try {
    const { mobile, code } = await req.json();
    const db = getDb();

    // Verify OTP (with master bypass for presentation)
    const nowStr = new Date().toISOString();
    const otpRecord = db.prepare('SELECT * FROM otp_codes WHERE mobile = ? AND code = ? AND expires_at > ?').get(mobile, code, nowStr);

    if (!otpRecord && code !== '123456') {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(mobile) as any;
    let isNewUser = false;

    if (!user) {
      const res = db.prepare('INSERT INTO users (mobile, role) VALUES (?, ?)').run(mobile, 'FARMER');
      user = { id: res.lastInsertRowid, mobile, role: 'FARMER' };
      isNewUser = true;
    } else {
      const farmer = db.prepare('SELECT * FROM farmers WHERE user_id = ?').get(user.id);
      if (!farmer) isNewUser = true;
    }

    // Create JWT
    const token = await new SignJWT({ userId: user.id, mobile: user.mobile, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    // Delete OTP
    db.prepare('DELETE FROM otp_codes WHERE mobile = ?').run(mobile);

    return NextResponse.json({ success: true, token, user: { id: user.id, mobile: user.mobile, role: user.role }, isNewUser });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
