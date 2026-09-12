// Official Government MSP Rates (2024-25 Kharif & Rabi Season)
// Source: Cabinet Committee on Economic Affairs (CCEA), Govt. of India

export const MSP_RATES: Record<string, { rate: number; unit: string; increase: number; season: string; emoji: string; labelHi: string }> = {
  wheat: {
    rate: 2275,
    unit: 'प्रति क्विंटल',
    increase: 150,
    season: 'रबी 2024-25',
    emoji: '🌾',
    labelHi: 'गेहूँ',
  },
  paddy: {
    rate: 2183,
    unit: 'प्रति क्विंटल',
    increase: 117,
    season: 'खरीफ 2024-25',
    emoji: '🌾',
    labelHi: 'धान',
  },
  mustard: {
    rate: 5650,
    unit: 'प्रति क्विंटल',
    increase: 200,
    season: 'रबी 2024-25',
    emoji: '🌿',
    labelHi: 'सरसों',
  },
  maize: {
    rate: 2090,
    unit: 'प्रति क्विंटल',
    increase: 135,
    season: 'खरीफ 2024-25',
    emoji: '🌽',
    labelHi: 'मक्का',
  },
  barley: {
    rate: 1735,
    unit: 'प्रति क्विंटल',
    increase: 115,
    season: 'रबी 2024-25',
    emoji: '🌾',
    labelHi: 'जौ',
  },
  cotton: {
    rate: 7121,
    unit: 'प्रति क्विंटल',
    increase: 501,
    season: 'खरीफ 2024-25',
    emoji: '☁️',
    labelHi: 'कपास',
  },
  sunflower: {
    rate: 6760,
    unit: 'प्रति क्विंटल',
    increase: 325,
    season: 'खरीफ 2024-25',
    emoji: '🌻',
    labelHi: 'सूरजमुखी',
  },
};
