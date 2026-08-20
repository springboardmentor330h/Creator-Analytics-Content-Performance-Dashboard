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

// Generate smooth cubic bezier SVG path
function getSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) * 0.4;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) * 0.6;
    const cp2y = next.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return d;
}

export default function AnalyticsChart({ engagementData, followerGrowthData }) {
  const [activeTab, setActiveTab] = useState('engagement');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const chartData = activeTab === 'engagement' ? engagementData : followerGrowthData;
  const labels = chartData?.labels || [];
  const rawValues = chartData?.values || [];

  const width = 600;
  const height = 230;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = rawValues.map(v => Number(v || 0));
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const strokeColor = activeTab === 'engagement' ? '#2563eb' : '#059669';
  const fillColor = activeTab === 'engagement' ? '#2563eb' : '#059669';
  const gradId = activeTab === 'engagement' ? 'blueChartGrad' : 'greenChartGrad';

  const getX = (idx) => {
    if (labels.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (labels.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  const points = labels.map((_, i) => ({ x: getX(i), y: getY(values[i]) }));
  const smoothLinePath = getSmoothPath(points);

  const smoothAreaPath = points.length > 0
    ? `${smoothLinePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Calculate 4 Y-axis Ticks
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = maxVal * ratio;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    const labelText = activeTab === 'engagement' ? `${val.toFixed(1)}%` : formatNumber(Math.round(val));
    return { val, y, labelText };
  });

  // Calculate Sampled X-axis Date Labels (5-6 Ticks)
  const getSampledTicks = () => {
    if (labels.length === 0) return [];
    if (labels.length <= 6) {
      return labels.map((lbl, i) => ({ text: formatShortDate(lbl), x: getX(i), index: i }));
    }
    const maxTicks = 5;
    const step = (labels.length - 1) / maxTicks;
    const ticks = [];
    for (let i = 0; i <= maxTicks; i++) {
      const idx = Math.min(Math.round(i * step), labels.length - 1);
      ticks.push({ text: formatShortDate(labels[idx]), x: getX(idx), index: idx });
    }
    return ticks;
  };

  const sampledTicks = getSampledTicks();
  const hoveredPoint = hoveredIndex !== null && labels[hoveredIndex] ? {
    x: getX(hoveredIndex),
    y: getY(values[hoveredIndex]),
    label: labels[hoveredIndex],
    value: values[hoveredIndex]
  } : null;

  return (
    <div className="section-card">
      <div className="section-header" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color={strokeColor} />
            <span>Performance Trend Analytics</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Vector-aligned timeline analytics for engagement & community growth
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setActiveTab('engagement'); setHoveredIndex(null); }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: activeTab === 'engagement' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'engagement' ? '#2563eb' : '#ffffff',
              color: activeTab === 'engagement' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <TrendingUp size={14} />
            <span>Engagement Rate</span>
          </button>

          <button
            onClick={() => { setActiveTab('followers'); setHoveredIndex(null); }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: activeTab === 'followers' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'followers' ? '#059669' : '#ffffff',
              color: activeTab === 'followers' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={14} />
            <span>Follower Growth</span>
          </button>
        </div>
      </div>

      {labels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
          <p style={{ fontSize: '14px', fontWeight: 600 }}>No chart data loaded from API.</p>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'hidden', position: 'relative' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '240px', overflow: 'visible' }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Scale Labels */}
            {yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={width - paddingRight}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "none" : "3 3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {tick.labelText}
                </text>
              </g>
            ))}

            {/* Gradient Fill */}
            {smoothAreaPath && <path d={smoothAreaPath} fill={`url(#${gradId})`} />}

            {/* Smooth Bezier Line */}
            {smoothLinePath && (
              <path
                d={smoothLinePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical Hover Guideline */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={paddingTop + chartHeight}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.75"
              />
            )}

            {/* Data Circles */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? "6" : "3.5"}
                  fill={isHovered ? "#ffffff" : strokeColor}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? "3" : "2"}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Vector-Aligned X-Axis Date Labels & Ticks */}
            {sampledTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={tick.x}
                  y1={paddingTop + chartHeight}
                  x2={tick.x}
                  y2={paddingTop + chartHeight + 5}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                <text
                  x={tick.x}
                  y={paddingTop + chartHeight + 20}
                  fill="#475569"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {tick.text}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredPoint && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              zIndex: 20
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
                Date: {hoveredPoint.label} ({formatShortDate(hoveredPoint.label)})
              </div>
              <div style={{ color: activeTab === 'engagement' ? '#60a5fa' : '#34d399', fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                {activeTab === 'engagement' ? 'Engagement Rate' : 'Follower Growth'}: {' '}
                {activeTab === 'engagement' ? `${hoveredPoint.value}%` : formatNumber(hoveredPoint.value)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

