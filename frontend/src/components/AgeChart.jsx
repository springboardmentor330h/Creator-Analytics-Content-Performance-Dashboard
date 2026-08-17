import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AgeChart({ title = "Age Distribution", distribution }) {
  const hasData = distribution && Object.keys(distribution).length > 0;

  if (!hasData) {
    return (
      <div className="chart-card" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
        <AlertCircle size={28} color="#94a3b8" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No age distribution data found</h4>
        <p style={{ fontSize: '12px', color: '#64748b' }}>No audience age group records found in database.</p>
      </div>
    );
  }

  const entries = Object.entries(distribution);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const classes = ['bar-blue', 'bar-green', 'bar-pink', 'bar-red'];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
      </div>

      <div className="age-bars-container">
        {entries.map(([label, val], idx) => {
          const heightPct = Math.max(15, Math.round((val / maxVal) * 100));
          return (
            <div className="age-bar-group" key={label}>
              <span className="bar-val">{val}%</span>
              <div
                className={`bar-pill ${classes[idx % classes.length]}`}
                style={{ height: `${heightPct}%` }}
              ></div>
              <span className="bar-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
