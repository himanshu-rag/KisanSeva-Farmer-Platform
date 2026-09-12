/**
 * KisanSeva Demo Seed Script
 * Creates realistic demo data for SIH demonstration
 * Run: npx tsx lib/seed.ts
 */

import getDb from './db';

export function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existing.count > 0) {
    console.log('✅ Database already seeded');
    return;
  }

  console.log('🌱 Seeding KisanSeva database...');

  // ── CROPS ──────────────────────────────────────────────
  db.prepare(`
    INSERT INTO crops (name_en, name_hi, name_pa, emoji, msp_per_qt, season) VALUES
    ('Wheat',     'गेहूँ',   'ਕਣਕ',   '🌾', 2275, 'Rabi'),
    ('Paddy',     'धान',    'ਝੋਨਾ',  '🌾', 2183, 'Kharif'),
    ('Mustard',   'सरसों',  'ਸਰੋਂ',  '🌿', 5650, 'Rabi'),
    ('Maize',     'मक्का',  'ਮੱਕੀ',  '🌽', 2090, 'Kharif'),
    ('Barley',    'जौ',     'ਜੌਂ',   '🌾', 1735, 'Rabi'),
    ('Cotton',    'कपास',   'ਕਪਾਹ',  '🌱', 7020, 'Kharif'),
    ('Sunflower', 'सूरजमुखी','ਸੂਰਜਮੁਖੀ','🌻',6400,'Kharif')
  `).run();

  // ── PROCUREMENT CENTRES ────────────────────────────────
  db.prepare(`
    INSERT INTO procurement_centres (name, name_hi, district, lat, lng, total_capacity, counters, contact) VALUES
    ('Karnal Mandi',   'करनाल मंडी',   'Karnal',  29.6857, 76.9905, 500, 6, '0184-2221234'),
    ('Panipat Mandi',  'पानीपत मंडी',  'Panipat', 29.3909, 76.9635, 500, 5, '0180-2641234'),
    ('Ambala Mandi',   'अंबाला मंडी',  'Ambala',  30.3752, 76.7821, 400, 4, '0171-2521234'),
    ('Rohtak Mandi',   'रोहतक मंडी',   'Rohtak',  28.8955, 76.6066, 450, 5, '01262-241234'),
    ('Hisar Mandi',    'हिसार मंडी',   'Hisar',   29.1492, 75.7217, 400, 4, '01662-221234')
  `).run();

  // ── ADMIN USERS ────────────────────────────────────────
  const insertUser = db.prepare(
    'INSERT INTO users (mobile, role) VALUES (?, ?)'
  );
  const insertFarmer = db.prepare(`
    INSERT INTO farmers (user_id, name, village, district, primary_crop, typical_qty, farmer_id, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Admin
  const adminId = (insertUser.run('9000000001', 'ADMIN') as { lastInsertRowid: number | bigint }).lastInsertRowid;
  // Operator - Karnal
  const op1Id = (insertUser.run('9000000002', 'OPERATOR') as { lastInsertRowid: number | bigint }).lastInsertRowid;
  const op2Id = (insertUser.run('9000000003', 'OPERATOR') as { lastInsertRowid: number | bigint }).lastInsertRowid;

  // ── DEMO FARMER: RAMESH KUMAR (SIH Demo) ──────────────
  const rameshUserId = (insertUser.run('9876543210', 'FARMER') as { lastInsertRowid: number | bigint }).lastInsertRowid;
  const rameshFarmerId = (insertFarmer.run(
    rameshUserId, 'Ramesh Kumar', 'Sirsali', 'Karnal', 'Wheat', 50, 'HR-KRNL-2847', 'hi'
  ) as { lastInsertRowid: number | bigint }).lastInsertRowid;

  // ── 19 MORE DEMO FARMERS ───────────────────────────────
  const farmerData = [
    ['9876000001', 'Suresh Singh',    'Nilokhari',   'Karnal',  'Wheat',   45, 'HR-2001'],
    ['9876000002', 'Mahesh Kumar',    'Kunjpura',    'Karnal',  'Paddy',   60, 'HR-2002'],
    ['9876000003', 'Harpal Singh',    'Gharaunda',   'Karnal',  'Wheat',   80, 'HR-2003'],
    ['9876000004', 'Balwinder Singh', 'Israna',      'Panipat', 'Mustard', 30, 'HR-2004'],
    ['9876000005', 'Gurpreet Kaur',   'Samalkha',    'Panipat', 'Wheat',   55, 'HR-2005'],
    ['9876000006', 'Rajbir Singh',    'Madlauda',    'Panipat', 'Paddy',   70, 'HR-2006'],
    ['9876000007', 'Pritam Devi',     'Naraingarh',  'Ambala',  'Wheat',   35, 'HR-2007'],
    ['9876000008', 'Ramji Lal',       'Mullana',     'Ambala',  'Maize',   25, 'HR-2008'],
    ['9876000009', 'Joginder Singh',  'Shazadpur',   'Ambala',  'Barley',  40, 'HR-2009'],
    ['9876000010', 'Dharam Pal',      'Lakhan Majra','Rohtak',  'Wheat',   65, 'HR-2010'],
    ['9876000011', 'Hari Om',         'Kiloi',       'Rohtak',  'Cotton',  20, 'HR-2011'],
    ['9876000012', 'Surinder Kumar',  'Mokhra',      'Rohtak',  'Mustard', 45, 'HR-2012'],
    ['9876000013', 'Bhupender Singh', 'Uklana',      'Hisar',   'Cotton',  50, 'HR-2013'],
    ['9876000014', 'Santosh Devi',    'Barwala',     'Hisar',   'Wheat',   30, 'HR-2014'],
    ['9876000015', 'Mange Ram',       'Agroha',      'Hisar',   'Sunflower',35,'HR-2015'],
    ['9876000016', 'Kapoor Singh',    'Uchana',      'Jind',    'Paddy',   55, 'HR-2016'],
    ['9876000017', 'Naresh Kumar',    'Julana',      'Jind',    'Wheat',   42, 'HR-2017'],
    ['9876000018', 'Paramjit Kaur',   'Safidon',     'Jind',    'Mustard', 28, 'HR-2018'],
    ['9876000019', 'Vijay Kumar',     'Hansi',       'Hisar',   'Cotton',  60, 'HR-2019'],
  ];

  const farmerIds: (number | bigint)[] = [rameshFarmerId];
  for (const [mobile, name, village, district, crop, qty, fid] of farmerData) {
    const uid = (insertUser.run(mobile, 'FARMER') as { lastInsertRowid: number | bigint }).lastInsertRowid;
    const frid = (insertFarmer.run(uid, name, village, district, crop, qty, fid, 'hi') as { lastInsertRowid: number | bigint }).lastInsertRowid;
    farmerIds.push(frid);
  }

  // ── TODAY'S DATE ───────────────────────────────────────
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // ── SLOTS FOR TODAY (Karnal = centre 1) ───────────────
  const insertSlot = db.prepare(`
    INSERT OR IGNORE INTO slots (centre_id, date, slot_start, slot_end, capacity, booked, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const slotDefs = [
    ['08:00', '09:00', 60, 58, 'ALMOST_FULL'],
    ['09:00', '10:00', 60, 55, 'ALMOST_FULL'],
    ['10:00', '11:00', 60, 48, 'AVAILABLE'],  // Ramesh's slot
    ['11:00', '12:00', 60, 50, 'AVAILABLE'],
    ['12:00', '13:00', 60, 20, 'AVAILABLE'],
    ['14:00', '15:00', 60, 8,  'AVAILABLE'],  // AI recommended
    ['15:00', '16:00', 60, 12, 'AVAILABLE'],
    ['16:00', '17:00', 60, 5,  'AVAILABLE'],
  ];

  const slotIds: number[] = [];
  for (const [centreId] of [[1],[2],[3],[4],[5]]) {
    for (const [start, end, cap, booked, status] of slotDefs) {
      const r = insertSlot.run(centreId, todayStr, start, end, cap, booked, status) as { lastInsertRowid: number };
      if (centreId === 1) slotIds.push(r.lastInsertRowid);
    }
  }

  // ── TOKENS ────────────────────────────────────────────
  const insertToken = db.prepare(`
    INSERT INTO tokens (token_no, farmer_id, centre_id, slot_id, crop_id, quantity, status, booked_at, arrived_at, verified_at, weighed_at, procured_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Already served tokens A100–A112 (before Ramesh)
  const servedStatuses = ['PROCURED','PROCURED','PROCURED','PROCURED','PROCURED',
                          'PROCURED','PROCURED','PROCURED','PROCURED','PROCURED','PROCURED','PROCURED','PROCURED'];
  for (let i = 0; i < 13; i++) {
    const farmerIdx = (i % (farmerIds.length - 1)) + 1;
    insertToken.run(
      `A${100 + i}`, farmerIds[farmerIdx], 1, slotIds[2], 1, 40 + i * 2, 'PROCURED',
      `${todayStr}T08:00:00`, `${todayStr}T08:${i*4}:00`,
      `${todayStr}T08:${i*4+1}:00`, `${todayStr}T08:${i*4+3}:00`, `${todayStr}T08:${i*4+5}:00`
    );
  }

  // A113 = currently being served
  const a113Id = (insertToken.run(
    'A113', farmerIds[1], 1, slotIds[2], 1, 45, 'WEIGHED',
    `${todayStr}T09:30:00`, `${todayStr}T09:45:00`, `${todayStr}T09:47:00`, `${todayStr}T09:55:00`, null
  ) as { lastInsertRowid: number }).lastInsertRowid;

  // A114 – A124 = in queue ahead of Ramesh
  for (let i = 1; i <= 11; i++) {
    const farmerIdx = (i % (farmerIds.length - 1)) + 1;
    insertToken.run(
      `A${113 + i}`, farmerIds[farmerIdx], 1, slotIds[2], 1, 35 + i * 3, 'ARRIVED',
      `${todayStr}T09:30:00`, `${todayStr}T09:50:00`, null, null, null
    );
  }

  // A125 = RAMESH (SIH demo hero)
  const a125Id = (insertToken.run(
    'A125', rameshFarmerId, 1, slotIds[2], 1, 50, 'BOOKED',
    `${todayStr}T07:00:00`, null, null, null, null
  ) as { lastInsertRowid: number }).lastInsertRowid;

  // A126–A150 = more upcoming tokens
  for (let i = 1; i <= 25; i++) {
    const farmerIdx = (i % (farmerIds.length - 1)) + 1;
    insertToken.run(
      `A${125 + i}`, farmerIds[farmerIdx], 1, slotIds[2], 1, 30 + i, 'BOOKED',
      `${todayStr}T08:00:00`, null, null, null, null
    );
  }

  // ── QUEUE ENTRIES ─────────────────────────────────────
  const insertQueue = db.prepare(
    'INSERT INTO queue_entries (token_id, centre_id, position, is_current) VALUES (?, ?, ?, ?)'
  );
  // A113 is current
  insertQueue.run(a113Id, 1, 1, 1);
  // A125 is at position 14 (13 ahead + itself)
  insertQueue.run(a125Id, 1, 14, 0);

  // ── PROCUREMENTS (historical) ─────────────────────────
  const insertProcurement = db.prepare(`
    INSERT INTO procurements (token_id, farmer_id, centre_id, crop_id, quantity, msp_rate, grade, status, procured_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, 'A', 'COMPLETED', ?, ?)
  `);

  // All PROCURED tokens get procurement records
  const procuredTokens = db.prepare(
    "SELECT id, farmer_id, crop_id, quantity FROM tokens WHERE status='PROCURED' LIMIT 13"
  ).all() as { id: number; farmer_id: number; crop_id: number; quantity: number }[];

  const procIds: number[] = [];
  for (const tok of procuredTokens) {
    const pid = (insertProcurement.run(
      tok.id, tok.farmer_id, 1, tok.crop_id, tok.quantity, 2275,
      `${todayStr}T09:00:00`, `${todayStr}T09:30:00`
    ) as { lastInsertRowid: number }).lastInsertRowid;
    procIds.push(pid);
  }

  // ── PAYMENTS ──────────────────────────────────────────
  const insertPayment = db.prepare(`
    INSERT INTO payments (procurement_id, farmer_id, amount, bank_ref, status, initiated_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < procIds.length; i++) {
    const proc = procuredTokens[i];
    const amount = proc.quantity * 2275;
    const status = i < 10 ? 'COMPLETED' : 'PROCESSING';
    insertPayment.run(
      procIds[i], proc.farmer_id, amount,
      `UTR${Date.now()}${i}`, status,
      `${todayStr}T10:00:00`,
      status === 'COMPLETED' ? `${todayStr}T14:00:00` : null
    );
  }

  // ── NOTIFICATIONS for Ramesh ──────────────────────────
  const insertNotif = db.prepare(`
    INSERT INTO notifications (farmer_id, type, title_en, title_hi, body_en, body_hi, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    rameshFarmerId, 'TOKEN',
    'Token Confirmed', 'टोकन पक्का हुआ',
    'Your token A125 is confirmed. Karnal Mandi, today 10:00–11:00 AM.',
    'आपका टोकन A125 पक्का हो गया है। Karnal मंडी, आज सुबह 10:00–11:00 बजे।',
    0
  );
  insertNotif.run(
    rameshFarmerId, 'ALERT',
    'High Crowd Today', 'आज भीड़ ज्यादा है',
    'Karnal Mandi is expected to be crowded. Consider coming after 2 PM.',
    'Karnal मंडी पर आज भीड़ ज्यादा होगी। दोपहर 2 बजे के बाद आने पर विचार करें।',
    0
  );
  insertNotif.run(
    rameshFarmerId, 'QUEUE',
    'Queue Moving Slowly', 'Queue धीमी है',
    'The queue at Karnal is moving slowly. You can arrive 20 min late.',
    'Karnal में Queue धीमी है। आप 20 मिनट देरी से आ सकते हैं।',
    1
  );

  // ── AI PREDICTIONS ────────────────────────────────────
  const insertPred = db.prepare(`
    INSERT INTO predictions (centre_id, prediction_date, expected_count, peak_hour_start, peak_hour_end, risk_level, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPred.run(1, tomorrowStr, 350, '10:00', '13:00', 'MEDIUM',
    'Open 1 additional counter between 10 AM and 1 PM');
  insertPred.run(2, tomorrowStr, 650, '09:00', '12:00', 'CRITICAL',
    'Open 2 additional counters and extend working hours till 6 PM');
  insertPred.run(3, tomorrowStr, 280, '11:00', '14:00', 'MEDIUM',
    'Standard operations. Monitor queue from 11 AM.');
  insertPred.run(4, tomorrowStr, 120, '10:00', '12:00', 'LOW',
    'Normal operations expected.');
  insertPred.run(5, tomorrowStr, 80, '09:00', '11:00', 'LOW',
    'Normal operations expected.');

  // ── ANOMALY ALERTS ────────────────────────────────────
  const insertAnomaly = db.prepare(`
    INSERT INTO anomaly_alerts (farmer_id, alert_type, description, risk_level, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnomaly.run(
    farmerIds[3], 'DUPLICATE_BOOKING',
    'Farmer has 2 token bookings for the same day at Karnal Mandi. Needs verification.',
    'MEDIUM', 'OPEN'
  );
  insertAnomaly.run(
    farmerIds[4], 'UNUSUAL_QUANTITY',
    'Declared quantity 520 quintals is significantly above district average of 45 quintals.',
    'HIGH', 'OPEN'
  );
  insertAnomaly.run(
    farmerIds[5], 'MULTIPLE_CENTRES',
    'Farmer has active bookings at 3 different procurement centres simultaneously.',
    'MEDIUM', 'OPEN'
  );
  insertAnomaly.run(
    farmerIds[8], 'REPEAT_BOOKING',
    'This is the 4th booking by this farmer within 7 days. Previous 3 completed normally.',
    'LOW', 'RESOLVED'
  );

  // ── HISTORICAL CROWD DATA (7 days × 5 centres) ────────
  const insertCrowd = db.prepare(
    'INSERT OR IGNORE INTO crowd_history (centre_id, date, hour, count) VALUES (?, ?, ?, ?)'
  );

  const basePatterns = [
    [0,0,5,15,35,55,65,70,75,80,72,60,40,30,25,20,10,5,0,0,0,0,0,0],   // Karnal
    [0,0,3,10,28,48,58,65,70,75,68,55,38,28,22,18,8,3,0,0,0,0,0,0],    // Panipat (busy)
    [0,0,2,8,20,38,45,52,55,58,52,44,30,22,18,12,6,2,0,0,0,0,0,0],     // Ambala
    [0,0,1,5,15,28,35,40,42,45,40,33,25,18,14,10,4,1,0,0,0,0,0,0],     // Rohtak
    [0,0,1,3,10,20,28,32,35,38,33,27,20,15,10,8,3,1,0,0,0,0,0,0],      // Hisar
  ];

  for (let day = 0; day < 7; day++) {
    const d = new Date(today);
    d.setDate(d.getDate() - day);
    const dateStr = d.toISOString().split('T')[0];
    for (let centreIdx = 0; centreIdx < 5; centreIdx++) {
      for (let hour = 0; hour < 24; hour++) {
        const base = basePatterns[centreIdx][hour];
        const noise = Math.floor(Math.random() * 6) - 3;
        const count = Math.max(0, base + noise);
        if (count > 0) {
          insertCrowd.run(centreIdx + 1, dateStr, hour, count);
        }
      }
    }
  }

  // ── CENTRE CAPACITY for today ─────────────────────────
  const insertCap = db.prepare(`
    INSERT OR IGNORE INTO centre_capacity (centre_id, date, total_slots, booked)
    VALUES (?, ?, ?, ?)
  `);
  insertCap.run(1, todayStr, 500, 120);  // Karnal - normal
  insertCap.run(2, todayStr, 500, 480);  // Panipat - critical
  insertCap.run(3, todayStr, 400, 200);  // Ambala - busy
  insertCap.run(4, todayStr, 450, 80);   // Rohtak - normal
  insertCap.run(5, todayStr, 400, 45);   // Hisar - low

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('  Farmer (Ramesh): 9876543210, OTP: 123456');
  console.log('  Admin:          admin@sih.gov.in / admin123');
  console.log('  Operator:       operator@karnal.gov.in / op123');
  console.log('');
  console.log('🌾 Demo Token: A125 | Karnal Mandi | 10:00-11:00 AM | 50 quintals Wheat');
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}
