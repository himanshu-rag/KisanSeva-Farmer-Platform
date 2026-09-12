const fs = require('fs');
const file = 'app/farmer/register/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add states
content = content.replace(
  '  const [name, setName] = useState(\'\');',
  `  const [name, setName] = useState('');\n  const [locations, setLocations] = useState<any[]>([]);\n  const [selectedState, setSelectedState] = useState('');\n  const [selectedDistrict, setSelectedDistrict] = useState('');\n  useEffect(() => {\n    fetch('/api/locations').then(r => r.json()).then(d => { if(d.success) setLocations(d.data); }).catch(()=>{});\n  }, []);`
);

// Add useEffect import
if (!content.includes('useEffect')) {
  content = content.replace('import { useState }', 'import { useState, useEffect }');
}

// Replace Step 2
const oldStep2 = `{step === 2 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Your Village Name?' : 'आपके गाँव का नाम?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '32px', fontSize: '16px' }}>Your village name</p>
            <input
              autoFocus type="text" value={village} onChange={e => setVillage(e.target.value)}
              placeholder={isEn ? "e.g., Sirsali" : "जैसे: सिरसली"}
              style={{ width: '100%', fontSize: '22px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', color: '#1A2E1A', background: 'white', marginBottom: '24px' }}
              onFocus={e => e.target.style.borderColor = '#2A7A3B'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button className="btn-farmer-primary" onClick={next} disabled={!village.trim()}>{isEn ? 'Next →' : 'आगे →'}</button>
          </div>
        )}`;

const states = `Array.from(new Set(locations.map(l => l.state)))`;
const districts = `Array.from(new Set(locations.filter(l => l.state === selectedState).map(l => l.district)))`;
const villagesList = `locations.filter(l => l.state === selectedState && l.district === selectedDistrict).map(l => l.village)`;

const newStep2 = `{step === 2 && (
          <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1A2E1A', marginBottom: '8px' }}>{isEn ? 'Your Location?' : 'आपका स्थान?'}</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '16px' }}>{isEn ? 'Where is your farm?' : 'आपका खेत कहाँ है?'}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setVillage(''); }} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select State --' : '-- राज्य चुनें --'}</option>
                {Array.from(new Set(locations.map(l => l.state))).map((s: any) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select disabled={!selectedState} value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setVillage(''); }} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: !selectedState ? '#F3F4F6' : 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select District --' : '-- जिला चुनें --'}</option>
                {Array.from(new Set(locations.filter(l => l.state === selectedState).map(l => l.district))).map((d: any) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select disabled={!selectedDistrict} value={village} onChange={e => setVillage(e.target.value)} style={{ width: '100%', fontSize: '18px', padding: '16px', border: '2px solid #E5E7EB', borderRadius: '12px', outline: 'none', background: !selectedDistrict ? '#F3F4F6' : 'white', color: '#1A2E1A' }}>
                <option value="">{isEn ? '-- Select Village --' : '-- गाँव चुनें --'}</option>
                {locations.filter(l => l.state === selectedState && l.district === selectedDistrict).map((v: any) => <option key={v.village} value={v.village}>{v.village}</option>)}
              </select>
            </div>

            <button className="btn-farmer-primary" onClick={next} disabled={!village.trim()}>{isEn ? 'Next →' : 'आगे →'}</button>
          </div>
        )}`;

content = content.replace(oldStep2, newStep2);
fs.writeFileSync(file, content);
console.log('Fixed');
