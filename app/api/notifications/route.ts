import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    const notifications = [
      { id: 1, type: 'TOKEN', title: 'टोकन पक्का हुआ', body: 'आपका टोकन A125 बन गया। Karnal Mandi, आज 10:00–11:00 AM।', time: '2 घंटे पहले', read: false },
      { id: 2, type: 'ALERT', title: 'भीड़ की चेतावनी', body: 'Karnal Mandi पर आज भीड़ ज्यादा है। 2 बजे के बाद आएं।', time: '3 घंटे पहले', read: false },
    ];
    
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
