import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();
    if (!mobile || mobile.length !== 10) {
      return NextResponse.json({ success: false, error: 'Invalid mobile number' }, { status: 400 });
    }

    const db = getDb();
    seedDatabase(); // Ensure DB is seeded

    // Generate real 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    db.prepare('DELETE FROM otp_codes WHERE mobile = ?').run(mobile);
    db.prepare('INSERT INTO otp_codes (mobile, code, expires_at) VALUES (?, ?, ?)').run(mobile, code, expiresAt);

    // Try to send via SMS Provider if keys exist
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    let smsSent = false;
    let provider = 'none';

    if (fast2smsKey) {
      // Fast2SMS Implementation
      provider = 'fast2sms';
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: `Your KisanSeva login OTP is ${code}. It is valid for 10 minutes.`,
          language: 'english',
          flash: 0,
          numbers: mobile
        })
      });
      if (res.ok) smsSent = true;
      else console.error('Fast2SMS failed', await res.text());
    } 
    else if (twilioSid && twilioToken && twilioPhone) {
      // Twilio Implementation (HTTP API without installing twilio library)
      provider = 'twilio';
      const params = new URLSearchParams({
        To: `+91${mobile}`,
        From: twilioPhone,
        Body: `Your KisanSeva login OTP is ${code}. It is valid for 10 minutes.`
      });
      
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      if (res.ok) smsSent = true;
      else console.error('Twilio failed', await res.text());
    }
    
    // In dev mode without keys, log the OTP to the server console
    if (!smsSent) {
      console.log(`\n================================`);
      console.log(`DEV MODE - SMS NOT SENT`);
      console.log(`Mobile: ${mobile}`);
      console.log(`OTP Code: ${code}`);
      console.log(`Add FAST2SMS_API_KEY or TWILIO credentials to .env.local to enable real SMS`);
      console.log(`================================\n`);
    }

    return NextResponse.json({ 
      success: true, 
      message: smsSent ? 'OTP sent via SMS' : 'OTP generated (Check console)', 
      provider,
      isDev: !smsSent 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
