import React from 'react';
import { Monitor, Smartphone, Tablet, AlertCircle } from 'lucide-react';

export default function DeviceChart({ title = "Device Usage", distribution }) {
  const hasData = distribution && Object.keys(distribution).length > 0;

  if (!hasData) {
    return (
      <div className="chart-card" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
        <AlertCircle size={28} color="#94a3b8" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No device data found</h4>
        <p style={{ fontSize: '12px', color: '#64748b' }}>No audience device records found in database.</p>
      </div>
    );
  }

  const entries = Object.entries(distribution);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>

      <div className="device-bubbles-container" style={{ gap: '16px' }}>
        {entries.map(([device, pct], i) => {
          const bgColors = ['#4338ca', '#064e3b', '#fb7185', '#ea580c'];
          const sizes = [100, 80, 65, 55];
          return (
            <div
              key={device}
              className="bubble"
              style={{
                width: `${sizes[i % sizes.length]}px`,
                height: `${sizes[i % sizes.length]}px`,
                backgroundColor: bgColors[i % bgColors.length],
                fontSize: '14px'
              }}
              title={`${device}: ${pct}%`}
            >
              {pct}%
            </div>
          );
        })}
      </div>

      <div className="device-legend-list">
        {entries.map(([device, pct]) => (
          <div key={device} className="device-legend-item">
            <span><strong>{pct}%</strong> {device}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
