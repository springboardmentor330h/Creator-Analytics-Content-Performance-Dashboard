import React, { useState } from 'react';
import { Users, AlertCircle, PieChart as PieIcon } from 'lucide-react';

const ageGroupColors = {
  '<18': '#ec4899',
  '18-24': '#ec4899',
  '18-30': '#2563eb',
  '25-34': '#2563eb',
  '30-45': '#059669',
  '35-44': '#059669',
  '>45': '#d97706',
  '45+': '#d97706'
};

const defaultPalette = ['#ec4899', '#2563eb', '#059669', '#d97706', '#8b5cf6', '#06b6d4'];

export default function AgeChart({ title = "Age Group Breakdown", distribution }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const hasData = distribution && Object.keys(distribution).length > 0;

  if (!hasData) {
    return (
      <div className="chart-card" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
        <AlertCircle size={28} color="#94a3b8" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>No age distribution data found</h4>
        <p style={{ fontSize: '12px', color: '#64748b' }}>No audience age group records found in database.</p>
      </div>
    );
  }

  const entries = Object.entries(distribution).map(([ageGroup, pct]) => ({
    ageGroup,
    percentage: Number(pct || 0)
  })).filter(item => item.percentage > 0);

  const totalPct = entries.reduce((acc, curr) => acc + curr.percentage, 0) || 100;

  let cumulativeAngle = 0;
  const slices = entries.map((item, index) => {
    const fraction = item.percentage / totalPct;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const x1 = 100 + 75 * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = 100 + 75 * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = 100 + 75 * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = 100 + 75 * Math.sin((Math.PI * (endAngle - 90)) / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const color = ageGroupColors[item.ageGroup] || defaultPalette[index % defaultPalette.length];

    const pathData = entries.length === 1
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
    <div className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="chart-header" style={{ marginBottom: '16px' }}>
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieIcon size={18} color="#2563eb" />
          <span>{title} (Pie Chart)</span>
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            {slices.map((slice, i) => (
              <path
                key={slice.ageGroup}
                d={slice.pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth={hoveredIdx === i ? "30" : "22"}
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.55
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>

          {/* Donut Center Label */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {activeItem ? `Age ${activeItem.ageGroup}` : 'Age Groups'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: activeItem ? activeItem.color : '#0f172a' }}>
              {activeItem ? `${activeItem.percentage}%` : '100%'}
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '180px' }}>
          {slices.map((slice, i) => {
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={slice.ageGroup}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isHovered ? `${slice.color}15` : '#f8fafc',
                  border: `1px solid ${isHovered ? slice.color : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: slice.color
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                    Age {slice.ageGroup}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: slice.color }}>{slice.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

