import React, { useState } from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { formatNumber } from '../utils/format';

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

export default function AnalyticsChart({ engagementData, followerGrowthData }) {
  const [activeTab, setActiveTab] = useState('engagement'); // 'engagement' or 'followers'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartData = activeTab === 'engagement' ? engagementData : followerGrowthData;
  const labels = chartData?.labels || [];
  const values = chartData?.values || [];

  const width = 500;
  const height = 180;
  const padding = 30;

  const maxValue = Math.max(...values.map(v => Number(v || 0)), 1);
  const strokeColor = activeTab === 'engagement' ? '#2563eb' : '#059669';
  const fillColor = activeTab === 'engagement' ? '#2563eb' : '#059669';
  const gradId = activeTab === 'engagement' ? 'blueChartGrad' : 'greenChartGrad';

  const getX = (idx) => {
    if (labels.length <= 1) return width / 2;
    return padding + (idx / (labels.length - 1)) * (width - 2 * padding);
  };

  const getY = (val) => {
    return height - padding - (Number(val || 0) / maxValue) * (height - 2 * padding);
  };

  const points = labels.map((_, i) => `${getX(i)},${getY(values[i])}`).join(' ');
  const areaPoints = labels.length > 0 ? `${getX(0)},${height - padding} ${points} ${getX(labels.length - 1)},${height - padding}` : '';

  const getSampledLabels = () => {
    if (labels.length <= 6) {
      return labels.map((lbl, i) => ({ text: formatShortDate(lbl), x: getX(i) }));
    }
    const maxTicks = 5;
    const step = (labels.length - 1) / maxTicks;
    const result = [];
    for (let i = 0; i <= maxTicks; i++) {
      const idx = Math.min(Math.round(i * step), labels.length - 1);
      result.push({ text: formatShortDate(labels[idx]), x: getX(idx) });
    }
    return result;
  };

  const sampledLabels = getSampledLabels();

  return (
    <div className="section-card">
      <div className="section-header" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color={strokeColor} />
            <span>Performance Trend Analytics</span>
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            Time-series tracking of engagement rates and community growth trends
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('engagement')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === 'engagement' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'engagement' ? '#2563eb' : '#ffffff',
              color: activeTab === 'engagement' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <TrendingUp size={14} />
            <span>Engagement Rate Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('followers')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: activeTab === 'followers' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'followers' ? '#059669' : '#ffffff',
              color: activeTab === 'followers' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} />
            <span>Follower Growth Chart</span>
          </button>
        </div>
      </div>

      {labels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>No chart data loaded from API.</p>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'hidden', position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '200px' }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2={width} y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="90" x2={width} y2="90" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="150" x2={width} y2="150" stroke="#f1f5f9" strokeWidth="1" />

            {/* Gradient Area Fill */}
            {areaPoints && <polygon fill={`url(#${gradId})`} points={areaPoints} />}

            {/* Line Path */}
            {points && <polyline fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />}

            {/* Interactive Circles */}
            {labels.map((lbl, i) => {
              const x = getX(i);
              const y = getY(values[i]);
              const isHovered = hoveredIndex === i;

              return (
                <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? "6" : "3.5"}
                    fill={strokeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
          </svg>

          {hoveredIndex !== null && labels[hoveredIndex] && (
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
              <div><strong>Date:</strong> {labels[hoveredIndex]} ({formatShortDate(labels[hoveredIndex])})</div>
              <div style={{ color: activeTab === 'engagement' ? '#60a5fa' : '#34d399', marginTop: '2px', fontWeight: 700 }}>
                <strong>{activeTab === 'engagement' ? 'Engagement Rate' : 'Followers'}:</strong> {activeTab === 'engagement' ? `${values[hoveredIndex]}%` : formatNumber(values[hoveredIndex])}
              </div>
            </div>
          )}

          {/* Sampled date ticks */}
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
      )}
    </div>
  );
}
