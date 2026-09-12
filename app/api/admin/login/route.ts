import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');

// Simple credential-based admin login
const ADMIN_CREDENTIALS: Record<string, { role: string; userId: number }> = {
  'admin@sih.gov.in:admin123': { role: 'ADMIN', userId: 1 },
  'operator@sih.gov.in:op123': { role: 'OPERATOR', userId: 2 },
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const key = `${email}:${password}`;
    const admin = ADMIN_CREDENTIALS[key];

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await new SignJWT({ userId: admin.userId, email, role: admin.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return NextResponse.json({ success: true, token, role: admin.role });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
