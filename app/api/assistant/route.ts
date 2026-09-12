import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jwtVerify } from 'jose';
import Groq from 'groq-sdk';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'kisanseva-secret-2026');
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(req: NextRequest) {
  try {
    let userId: number | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET);
        userId = payload.userId as number;
      } catch { /* invalid token — treat as guest */ }
    }

    const db = getDb();
    const farmer = userId ? db.prepare('SELECT id, name FROM farmers WHERE user_id = ?').get(userId) as any : null;
    const farmerId = farmer?.id;
    const farmerName = farmer?.name || 'Farmer';

    const { message, language } = await req.json();
    const isEn = language === 'en';
    let response = '';
    
    // Fetch user context for the prompt
    let userContext = `User Name: ${farmerName}.`;
    if (farmerId) {
      const activeToken = db.prepare(`SELECT token_no, c.name as centre, s.slot_start || '–' || s.slot_end as slot FROM tokens t JOIN procurement_centres c ON t.centre_id = c.id JOIN slots s ON t.slot_id = s.id WHERE t.farmer_id = ? ORDER BY t.id DESC LIMIT 1`).get(farmerId) as any;
      if (activeToken) {
        userContext += ` Active Token: ${activeToken.token_no} at ${activeToken.centre} between ${activeToken.slot}. Queue: 12 farmers ahead. Wait time: ~25 mins.`;
      }
      userContext += ` Recent Payment: ₹1,13,750 (Processing).`;
    }

    // Fallback logic function
    const getFallbackResponse = () => {
      const lowerMsg = message.toLowerCase();
      let intent = 'GENERAL';
      let fbResponse = isEn ? "Sorry, I am having trouble connecting to the AI server. Here is some general info." : 'माफ़ करें, AI सर्वर से जुड़ने में समस्या हो रही है। यहाँ कुछ सामान्य जानकारी है।';

      if (lowerMsg.includes('टोकन') || lowerMsg.includes('token')) intent = 'TOKEN_QUERY';
      else if (lowerMsg.includes('भीड़') || lowerMsg.includes('crowd') || lowerMsg.includes('queue') || lowerMsg.includes('कम')) intent = 'CROWD_QUERY';
      else if (lowerMsg.includes('पेमेंट') || lowerMsg.includes('payment') || lowerMsg.includes('पैसा') || lowerMsg.includes('पैसे') || lowerMsg.includes('भुगतान')) intent = 'PAYMENT_QUERY';

      if (intent === 'TOKEN_QUERY' && farmerId) {
        fbResponse = isEn ? `Your token is A125. At Karnal Mandi, today 10:00–11:00 AM. 12 farmers ahead of you.` : `आपका टोकन A125 है। Karnal Mandi पर आज सुबह 10:00–11:00 बजे। 12 किसान आपसे आगे हैं।`;
      } else if (intent === 'CROWD_QUERY') {
        fbResponse = isEn ? 'Hisar Mandi and Rohtak Mandi have the lowest crowd today.' : 'आज Hisar Mandi और Rohtak Mandi पर सबसे कम भीड़ है।';
      } else if (intent === 'PAYMENT_QUERY') {
        fbResponse = isEn ? 'Your payment of ₹1,13,750 is processing and will arrive in your bank account in 24-48 hours.' : 'आपका ₹1,13,750 का भुगतान प्रक्रिया में है। 24-48 घंटे में आपके बैंक खाते में आ जाएगा।';
      }
      return fbResponse;
    };

    if (groq) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are KisanSeva AI, a helpful virtual assistant for farmers in India selling their crops at government procurement centres. Keep responses short (1-3 sentences) and highly relevant. Speak strictly in ${isEn ? 'English' : 'Hindi'}. Context: ${userContext}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.5,
          max_tokens: 150
        });
        response = chatCompletion.choices[0]?.message?.content || (isEn ? 'Error connecting to AI.' : 'AI से जुड़ने में त्रुटि।');
      } catch (e) {
        console.error('Groq error:', e);
        response = getFallbackResponse();
      }
    } else {
      response = getFallbackResponse();
    }

    return NextResponse.json({ success: true, data: { reply: response } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
