const fs = require('fs');
const file = 'app/farmer/token/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// add token state
content = content.replace(
  'const [cancelled, setCancelled] = useState(false);',
  `const [cancelled, setCancelled] = useState(false);\n  const [tokenId, setTokenId] = useState(null);\n  const [tokenNo, setTokenNo] = useState('A125');`
);

// add fetch in useEffect
content = content.replace(
  'const interval = setInterval(() => {',
  `fetch('/api/farmers/me', { headers: { Authorization: \`Bearer \${localStorage.getItem('kisanseva_token')}\` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.activeToken) {
          setTokenId(d.data.activeToken.id);
          setTokenNo(d.data.activeToken.tokenNo);
        }
      }).catch(()=>{});
    const interval = setInterval(() => {`
);

// fix handleCancel
content = content.replace(
  `await fetch('/api/bookings/1', {`,
  `if (tokenId) await fetch(\`/api/bookings/\${tokenId}\`, {`
);

// fix token UI
content = content.replace(
  `<strong style={{ color: '#2A7A3B' }}>A125</strong>`,
  `<strong style={{ color: '#2A7A3B' }}>{tokenNo}</strong>`
);
content = content.replace(
  `{isEn ? 'Token ' : 'टोकन '}<strong style={{ color: '#2A7A3B' }}>A125</strong> {isEn ? 'will be cancelled.' : 'रद्द हो जाएगा।'}`,
  `{isEn ? 'Token ' : 'टोकन '}<strong style={{ color: '#2A7A3B' }}>{tokenNo}</strong> {isEn ? 'will be cancelled.' : 'रद्द हो जाएगा।'}`
);

fs.writeFileSync(file, content);
console.log('Fixed');
