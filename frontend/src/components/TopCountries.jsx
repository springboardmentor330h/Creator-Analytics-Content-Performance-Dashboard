import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';

export default function TopCountries({ report }) {
  const topCountry = report?.top_country;
  const topCity = report?.top_city;

  if (!topCountry && !topCity) {
    return (
      <div className="chart-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={28} color="#94a3b8" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No location data found</h4>
        <p style={{ fontSize: '12px', color: '#64748b' }}>No audience country or city records logged in database.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Active Geographic Audience</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#4338ca' }}>
          <Globe size={14} />
          <span>Realtime</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px', alignItems: 'center' }}>
        <div className="country-list">
          {topCountry && (
            <div className="country-item">
              <div className="country-info">
                <span className="flag-icon">🌐</span>
                <span className="country-name">Top Country: {topCountry}</span>
              </div>
              <span className="country-val" style={{ color: '#047857', fontWeight: 700 }}>Primary</span>
            </div>
          )}
          {topCity && (
            <div className="country-item">
              <div className="country-info">
                <span className="flag-icon">📍</span>
                <span className="country-name">Top City: {topCity}</span>
              </div>
              <span className="country-val" style={{ color: '#4338ca', fontWeight: 700 }}>Primary</span>
            </div>
          )}
        </div>

        <div style={{
          height: '140px',
          background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '16px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <svg viewBox="0 0 300 160" width="100%" height="100%" opacity="0.6">
            <path fill="#cbd5e1" d="M30 40 Q50 30 70 45 T110 50 T150 40 T200 60 T250 50 T280 80 Q260 110 210 100 T150 120 T90 110 Q50 120 30 40 Z"/>
            <circle cx="70" cy="50" r="4" fill="#4338ca"/>
            <circle cx="150" cy="90" r="4" fill="#4338ca"/>
            <circle cx="220" cy="70" r="4" fill="#4338ca"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
