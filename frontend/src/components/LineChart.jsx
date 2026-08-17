import React, { useState } from 'react';
import { formatNumber, rawNumber } from '../utils/format';

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]} ${day}`;
      }
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

export default function LineChart({ title = "Audience Growth & Reach Realtime Trends", data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="section-card" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>No trend data found in database.</p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>Add audience or growth records to populate realtime trend lines.</p>
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const padding = 30;

  const maxFollowers = Math.max(...data.map(d => Number(d.followers || 0)), 10);
  const maxReach = Math.max(...data.map(d => Number(d.reach || 0)), 10);

  const getX = (idx) => {
    if (data.length === 1) return width / 2;
    return padding + (idx / (data.length - 1)) * (width - 2 * padding);
  };

  const getFollowerY = (val) => {
    return height - padding - (Number(val || 0) / maxFollowers) * (height - 2 * padding);
  };

  const getReachY = (val) => {
    return height - padding - (Number(val || 0) / maxReach) * (height - 2 * padding);
  };

  const followerPoints = data.map((d, i) => `${getX(i)},${getFollowerY(d.followers)}`).join(' ');
  const reachPoints = data.map((d, i) => `${getX(i)},${getReachY(d.reach)}`).join(' ');

  // Gradient area fill paths
  const followerAreaPoints = `${getX(0)},${height - padding} ${followerPoints} ${getX(data.length - 1)},${height - padding}`;
  const reachAreaPoints = `${getX(0)},${height - padding} ${reachPoints} ${getX(data.length - 1)},${height - padding}`;

  // Sample 5-6 date ticks on X axis to avoid text crowding
  const getSampledLabels = () => {
    if (data.length <= 6) {
      return data.map((d, i) => ({ text: formatShortDate(d.date), x: getX(i) }));
    }
    const maxTicks = 5;
    const step = (data.length - 1) / maxTicks;
    const labels = [];
    for (let i = 0; i <= maxTicks; i++) {
      const idx = Math.min(Math.round(i * step), data.length - 1);
      labels.push({ text: formatShortDate(data[idx].date), x: getX(idx) });
    }
    return labels;
  };

  const sampledLabels = getSampledLabels();

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">{title}</h3>
        <div style={{ fontSize: '13px', display: 'flex', gap: '16px' }}>
          <span style={{ color: '#4f46e5', fontWeight: '800' }}>● Followers (Realtime)</span>
          <span style={{ color: '#f43f5e', fontWeight: '800' }}>● Reach (Realtime)</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'hidden', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
          <defs>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="30" x2={width} y2="30" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="150" x2={width} y2="150" stroke="#f1f5f9" strokeWidth="1" />

          {/* Gradient Area Fills */}
          <polygon fill="url(#pinkGrad)" points={reachAreaPoints} />
          <polygon fill="url(#blueGrad)" points={followerAreaPoints} />

          {/* Stroke Lines */}
          <polyline fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={reachPoints} />
          <polyline fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={followerPoints} />

          {/* Data Circles */}
          {data.map((d, i) => {
            const x = getX(i);
            const yF = getFollowerY(d.followers);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                <circle
                  cx={x}
                  cy={yF}
                  r={isHovered ? "6" : "3.5"}
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
        </svg>

        {hoveredIndex !== null && data[hoveredIndex] && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            zIndex: 10
          }}>
            <div><strong>Date:</strong> {data[hoveredIndex].date} ({formatShortDate(data[hoveredIndex].date)})</div>
            <div style={{ color: '#818cf8', marginTop: '2px' }}>
              <strong>Followers:</strong> {formatNumber(data[hoveredIndex].followers)} (Exact: {rawNumber(data[hoveredIndex].followers)})
            </div>
            <div style={{ color: '#fda4af', marginTop: '2px' }}>
              <strong>Reach:</strong> {formatNumber(data[hoveredIndex].reach)} (Exact: {rawNumber(data[hoveredIndex].reach)})
            </div>
          </div>
        )}
      </div>

      {/* Clean 5 sampled date ticks */}
      <div style={{ position: 'relative', height: '24px', marginTop: '8px' }}>
        {sampledLabels.map((lbl, idx) => {
          const leftPct = (lbl.x / width) * 100;
          return (
            <span
              key={idx}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                transform: 'translateX(-50%)',
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}
            >
              {lbl.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
