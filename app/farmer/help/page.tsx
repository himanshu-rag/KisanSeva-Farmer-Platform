'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, Send, SquareSquare } from 'lucide-react';
import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

type Message = { role: 'user' | 'bot'; text: string };

export default function HelpPage() {
  const { lang, isEn } = useFarmerLang();

  const INITIAL_MESSAGES: Message[] = [
    { role: 'user', text: isEn ? 'When is my token?' : 'मेरा टोकन कब है?' },
    { role: 'bot', text: isEn ? 'Your token is A125. At Karnal Mandi, today 10:00–11:00 AM. 12 farmers ahead of you, wait time is around 25 mins.' : 'आपका टोकन A125 है। Karnal Mandi पर आज सुबह 10:00–11:00 बजे। 12 किसान आपसे आगे हैं, लगभग 25 मिनट का इंतज़ार है।' },
    { role: 'user', text: isEn ? 'When will I get paid?' : 'पेमेंट कब आएगा?' },
    { role: 'bot', text: isEn ? 'Your payment of ₹1,13,750 is processing. It will arrive in your bank account in 24-48 hours.' : 'आपका ₹1,13,750 का भुगतान प्रक्रिया में है। 24-48 घंटे में आपके बैंक खाते में आ जाएगा।' },
  ];
  
  const SUGGESTIONS = isEn ? ['My token?', 'Lowest crowd?', 'Payment status?', 'When to arrive?'] : ['मेरा टोकन?', 'भीड़ कहाँ कम?', 'पेमेंट कब?', 'कब जाऊँ?'];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('kisanseva_token') ? { Authorization: `Bearer ${localStorage.getItem('kisanseva_token')}` } : {})
        },
        body: JSON.stringify({ message: text, language: lang })
      });
      const data = await res.json();
      if (data.success && data.data?.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: isEn ? 'Something went wrong.' : 'कुछ गलत हो गया।' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: isEn ? 'Network error.' : 'नेटवर्क समस्या।' }]);
    }
    setIsTyping(false);
  };

  const toggleListen = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert(isEn ? 'Voice input is not supported on this browser.' : 'आपके ब्राउज़र में बोलकर लिखना समर्थित नहीं है।');
      return;
    }
    if (isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = isEn ? 'en-IN' : 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div style={{ background: '#FDFCF7', height: '100dvh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A2E1A', margin: 0 }}>🌾 {isEn ? 'Assistant' : 'सहायक'}</h1>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>KisanSeva AI</p>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', fontSize: '16px', lineHeight: 1.4,
              background: m.role === 'user' ? '#2A7A3B' : 'white',
              color: m.role === 'user' ? 'white' : '#1A2E1A',
              border: m.role === 'bot' ? '1px solid #E5E7EB' : 'none',
              borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: m.role === 'bot' ? '4px' : '16px',
              boxShadow: m.role === 'bot' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
              <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '10px' }}></div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} style={{ flexShrink: 0, padding: '8px 16px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '20px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={toggleListen} style={{
            width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isListening ? '#DCFCE7' : '#E8F5EC',
            color: '#2A7A3B', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isListening ? '0 0 0 4px rgba(42,122,59,0.2)' : 'none',
            transition: 'all 0.2s', flexShrink: 0
          }} className={isListening ? 'animate-pulse-green' : ''}>
            <Mic size={24} />
          </button>
          
          <div style={{ flex: 1, display: 'flex', background: '#F3F4F6', borderRadius: '28px', padding: '4px 4px 4px 16px', alignItems: 'center' }}>
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder={isEn ? "Ask something..." : "लिखकर पूछें..."}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#1A2E1A' }}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: input.trim() ? '#2A7A3B' : '#E5E7EB', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>{isEn ? 'Ask by voice or text' : 'बोलकर या लिखकर सवाल पूछें'}</div>
      </div>
    </div>
  );
}
