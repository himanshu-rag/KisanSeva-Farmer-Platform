const fs = require('fs');
const file = 'components/admin/AdminSidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('Map, Brain, AlertTriangle, LogOut', 'Map, Brain, AlertTriangle, LogOut, MapPin');

content = content.replace(
  `{ href: '/admin/anomalies', icon: AlertTriangle, label: t.anomalies },`,
  `{ href: '/admin/anomalies', icon: AlertTriangle, label: t.anomalies },
    { href: '/admin/locations', icon: MapPin, label: isEn ? 'Locations' : 'स्थान' },`
);

fs.writeFileSync(file, content);
