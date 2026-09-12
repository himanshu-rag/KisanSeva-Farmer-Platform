'use client';
import { useEffect, useState } from 'react';
import { Thermometer, Wind, Droplets, Cloud } from 'lucide-react';

// Real GPS coordinates for Haryana Mandis (Open-Meteo, no API key needed)
const MANDI_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  '1': { lat: 29.6857, lng: 76.9905, name: 'Karnal' },
  '2': { lat: 29.3909, lng: 76.9708, name: 'Panipat' },
  '3': { lat: 30.3782, lng: 76.7767, name: 'Ambala' },
  '4': { lat: 28.8955, lng: 76.5892, name: 'Rohtak' },
  '5': { lat: 29.1492, lng: 75.7115, name: 'Hisar' },
};

// WMO weather code → emoji + description
function getWeatherInfo(code: number, isEn: boolean): { emoji: string; label: string; advice: string } {
  if (code === 0) return { emoji: '☀️', label: isEn ? 'Clear Sky' : 'साफ आसमान', advice: isEn ? 'Great day to travel!' : 'यात्रा के लिए बेहतरीन दिन!' };
  if (code <= 3) return { emoji: '⛅', label: isEn ? 'Partly Cloudy' : 'आंशिक बादल', advice: isEn ? 'Good day to visit Mandi.' : 'मंडी जाने का अच्छा दिन।' };
  if (code <= 49) return { emoji: '🌫️', label: isEn ? 'Fog' : 'कोहरा', advice: isEn ? 'Foggy morning, travel safely.' : 'सुबह कोहरा, सावधानी से जाएँ।' };
  if (code <= 67) return { emoji: '🌧️', label: isEn ? 'Rain' : 'बारिश', advice: isEn ? 'Cover your crop!' : 'फसल ढक कर ले जाएँ!' };
  if (code <= 77) return { emoji: '❄️', label: isEn ? 'Snow' : 'बर्फबारी', advice: isEn ? 'Call centre before leaving.' : 'जाने से पहले केंद्र को फ़ोन करें।' };
  if (code <= 82) return { emoji: '🌦️', label: isEn ? 'Light Rain' : 'हल्की बारिश', advice: isEn ? 'Carry an umbrella.' : 'छाता साथ रखें।' };
  if (code <= 99) return { emoji: '⛈️', label: isEn ? 'Thunderstorm' : 'आंधी-तूफान', advice: isEn ? '⚠️ Avoid travelling today.' : '⚠️ आज यात्रा टालें।' };
  return { emoji: '🌤️', label: isEn ? 'Fair' : 'मौसम', advice: isEn ? 'Good to go.' : 'मंडी जाने के लिए ठीक है।' };
}

interface WeatherData {
  temp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

import { useFarmerLang } from '@/lib/hooks/useFarmerLang';

export default function WeatherWidget({ centreId = '1' }: { centreId?: string }) {
  const { isEn } = useFarmerLang();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const coords = MANDI_COORDS[centreId] || MANDI_COORDS['1'];

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Asia%2FKolkata&forecast_days=1`;
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
          });
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [centreId, coords.lat, coords.lng]);

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', borderRadius: '16px', padding: '16px 20px', color: 'white', opacity: 0.7 }}>
        <div style={{ fontSize: '14px' }}>🌤️ मौसम लोड हो रहा है...</div>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Silently hide if no internet
  }

  const { emoji, label, advice } = getWeatherInfo(weather.weatherCode, isEn);

  const bgColor = weather.weatherCode <= 3
    ? 'linear-gradient(135deg, #60A5FA, #2563EB)'
    : weather.weatherCode <= 49
    ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
    : weather.weatherCode <= 67 || weather.weatherCode <= 82
    ? 'linear-gradient(135deg, #60A5FA, #6366F1)'
    : 'linear-gradient(135deg, #F59E0B, #EF4444)';

  return (
    <div style={{ background: bgColor, borderRadius: '16px', padding: '16px 20px', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px' }}>📍 {isEn ? `${coords.name} Mandi Weather` : `${coords.name} मंडी का मौसम`}</div>
          <div style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1 }}>{weather.temp}°</div>
          <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '4px' }}>{label}</div>
        </div>
        <div style={{ fontSize: '56px', lineHeight: 1, opacity: 0.9 }}>{emoji}</div>
      </div>

      {/* Advice banner */}
      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
        {advice}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: 0.9 }}>
          <Wind size={14} /> {weather.windSpeed} km/h
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', opacity: 0.9 }}>
          <Droplets size={14} /> {weather.humidity}%
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.6 }}>Open-Meteo</div>
      </div>
    </div>
  );
}
