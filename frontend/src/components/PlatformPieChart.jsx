import React, { useState } from 'react';
import { PieChart as PieIcon, Globe, Info } from 'lucide-react';
import { formatNumber } from '../utils/format';

const platformColorMap = {
  YouTube: '#ef4444',
  Instagram: '#ec4899',
  TikTok: '#06b6d4',
  LinkedIn: '#2563eb',
  Twitter: '#0284c7',
  'Twitter/X': '#0284c7',
  Facebook: '#3b82f6',
  Other: '#64748b'
};

export default function PlatformPieChart({ reachBreakdown, selectedPlatform, onSelectPlatform }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!reachBreakdown || !reachBreakdown.platform_breakdown) return null;

  const breakdown = reachBreakdown.platform_breakdown.filter(item => item.reach > 0);
  const totalReach = reachBreakdown.combined_total_reach || 1;

  if (breakdown.length === 0) return null;

  // Calculate Pie Slices (Donut Chart)
  let cumulativeAngle = 0;
  const slices = breakdown.map((item, index) => {
    const fraction = item.reach / totalReach;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Convert angles to SVG arc paths
    const x1 = 100 + 75 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 100 + 75 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 100 + 75 * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = 100 + 75 * Math.sin((Math.PI * (endAngle - 90)) / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const color = platformColorMap[item.platform] || '#6366f1';

    const pathData = breakdown.length === 1
      ? `M 100 25 A 75 75 0 1 1 99.99 25 Z`
      : `M ${x1} ${y1} A 75 75 0 ${largeArc} 1 ${x2} ${y2}`;

    return {
      ...item,
      pathData,
      color,
      fraction,
      startAngle,
      endAngle
    };
  });

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="section-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={20} color="#ec4899" />
            <span>Platform Audience Reach Share</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Distribution of total audience reach across social networks
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', flex: 1 }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(0deg)' }}>
            {slices.map((slice, i) => (
              <path
                key={slice.platform}
                d={slice.pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth={hoveredIdx === i ? "32" : "24"}
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.6
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectPlatform && onSelectPlatform(slice.platform)}
              />
            ))}
          </svg>

          {/* Center Info in Donut Hole */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {activeItem ? activeItem.platform : 'Total Reach'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: activeItem ? activeItem.color : '#0f172a' }}>
              {activeItem ? `${activeItem.percentage_share}%` : formatNumber(totalReach)}
            </div>
            {activeItem && (
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {formatNumber(activeItem.reach)} reach
              </div>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '220px' }}>
          {slices.map((slice, i) => {
            const isSelected = selectedPlatform === slice.platform;
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={slice.platform}
                onClick={() => onSelectPlatform && onSelectPlatform(slice.platform)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelected || isHovered ? `${slice.color}15` : '#f8fafc',
                  border: isSelected ? `1.5px solid ${slice.color}` : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: slice.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{slice.platform}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: slice.color }}>{slice.percentage_share}%</span>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{formatNumber(slice.reach)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
