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

  const width = 600;
  const height = 230;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const followerValues = data.map(d => Number(d.followers || 0));
  const reachValues = data.map(d => Number(d.reach || 0));

  const maxFollowers = Math.max(...followerValues, 10);
  const maxReach = Math.max(...reachValues, 10);
  const maxScale = Math.max(maxFollowers, maxReach);

  const getX = (idx) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return paddingTop + chartHeight - (val / maxScale) * chartHeight;
  };

  const followerPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.followers) }));
  const reachPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.reach) }));

  const followerSmoothPath = getSmoothPath(followerPoints);
  const reachSmoothPath = getSmoothPath(reachPoints);

  const followerAreaPath = followerPoints.length > 0
    ? `${followerSmoothPath} L ${followerPoints[followerPoints.length - 1].x} ${paddingTop + chartHeight} L ${followerPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const reachAreaPath = reachPoints.length > 0
    ? `${reachSmoothPath} L ${reachPoints[reachPoints.length - 1].x} ${paddingTop + chartHeight} L ${reachPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Calculate 4 Y-axis Ticks
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = maxScale * ratio;
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { val, y, labelText: formatNumber(Math.round(val)) };
  });

  // Calculate Sampled X-axis Date Labels (5-6 Ticks)
  const getSampledTicks = () => {
    if (data.length === 0) return [];
    if (data.length <= 6) {
      return data.map((d, i) => ({ text: formatShortDate(d.date), x: getX(i), index: i }));
    }
    const maxTicks = 5;
    const step = (data.length - 1) / maxTicks;
    const ticks = [];
    for (let i = 0; i <= maxTicks; i++) {
      const idx = Math.min(Math.round(i * step), data.length - 1);
      ticks.push({ text: formatShortDate(data[idx].date), x: getX(idx), index: idx });
    }
    return ticks;
  };

  const sampledTicks = getSampledTicks();
  const activeRecord = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="section-card">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title">{title}</h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Dual-line vector tracking for cumulative audience size and daily reach
          </p>
        </div>
        <div style={{ fontSize: '12px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ color: '#4f46e5', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4f46e5' }}></span>
            Followers Stream
          </span>
          <span style={{ color: '#f43f5e', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f43f5e' }}></span>
            Organic Reach Stream
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'hidden', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '240px', overflow: 'visible' }}>
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

          {/* Gradient Fills */}
          {reachAreaPath && <path d={reachAreaPath} fill="url(#pinkGrad)" />}
          {followerAreaPath && <path d={followerAreaPath} fill="url(#blueGrad)" />}

          {/* Smooth Stroke Lines */}
          {reachSmoothPath && (
            <path
              d={reachSmoothPath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {followerSmoothPath && (
            <path
              d={followerSmoothPath}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical Guideline on Hover */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={paddingTop + chartHeight}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.75"
            />
          )}

          {/* Data Circles for Followers & Reach */}
          {data.map((d, i) => {
            const x = getX(i);
            const yF = getY(d.followers);
            const yR = getY(d.reach);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                <circle
                  cx={x}
                  cy={yR}
                  r={isHovered ? "5.5" : "3"}
                  fill={isHovered ? "#ffffff" : "#f43f5e"}
                  stroke="#f43f5e"
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />
                <circle
                  cx={x}
                  cy={yF}
                  r={isHovered ? "6" : "3.5"}
                  fill={isHovered ? "#ffffff" : "#4f46e5"}
                  stroke="#4f46e5"
                  strokeWidth={isHovered ? "3" : "2"}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />
              </g>
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
        {activeRecord && (
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
              Date: {activeRecord.date} ({formatShortDate(activeRecord.date)})
            </div>
            <div style={{ color: '#818cf8', fontWeight: 800, marginTop: '2px' }}>
              Followers: {formatNumber(activeRecord.followers)} (Exact: {rawNumber(activeRecord.followers)})
            </div>
            <div style={{ color: '#fda4af', fontWeight: 800, marginTop: '2px' }}>
              Organic Reach: {formatNumber(activeRecord.reach)} (Exact: {rawNumber(activeRecord.reach)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

