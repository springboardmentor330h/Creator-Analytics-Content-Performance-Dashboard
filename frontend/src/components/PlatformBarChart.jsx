import React, { useState } from 'react';
import { BarChart as BarIcon } from 'lucide-react';
import { formatNumber } from '../utils/format';

const platformColorMap = {
  YouTube: '#ef4444',
  Instagram: '#ec4899',
  TikTok: '#06b6d4',
  LinkedIn: '#2563eb',
  Twitter: '#0284c7',
  'Twitter/X': '#0284c7',
  Facebook: '#3b82f6',
};

export default function PlatformBarChart({ platformComparison }) {
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  if (!platformComparison || Object.keys(platformComparison).length === 0) return null;

  const platforms = Object.keys(platformComparison);
  const maxVal = Math.max(
    ...platforms.flatMap(p => [
      platformComparison[p]?.views || 0,
      platformComparison[p]?.reach || 0
    ]),
    1
  );

  return (
    <div className="section-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarIcon size={20} color="#2563eb" />
            <span>Platform Volume & Reach Performance</span>
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Side-by-side volume comparison of total views and organic reach
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', fontSize: '12px', fontWeight: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#2563eb' }} />
            <span>Views</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#93c5fd' }} />
            <span>Organic Reach</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
        {platforms.map((p) => {
          const data = platformComparison[p] || {};
          const views = data.views || 0;
          const reach = data.reach || 0;
          const viewsPct = Math.round((views / maxVal) * 100);
          const reachPct = Math.round((reach / maxVal) * 100);
          const brandColor = platformColorMap[p] || '#6366f1';
          const isHovered = hoveredPlatform === p;

          return (
            <div
              key={p}
              onMouseEnter={() => setHoveredPlatform(p)}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: isHovered ? '#f8fafc' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: brandColor }} />
                  {p}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  {formatNumber(views)} views / {formatNumber(reach)} reach
                </span>
              </div>

              {/* Bar 1: Views */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${viewsPct}%`, height: '100%', backgroundColor: brandColor, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {/* Bar 2: Reach */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${reachPct}%`, height: '100%', backgroundColor: `${brandColor}80`, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
