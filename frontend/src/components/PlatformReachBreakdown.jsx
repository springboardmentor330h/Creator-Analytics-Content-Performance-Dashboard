import React from 'react';
import { Globe, Eye, Share2 } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from './PlatformIcons';

const platformConfig = {
  YouTube: { color: '#ef4444', bgColor: '#fef2f2', icon: YoutubeIcon },
  Instagram: { color: '#ec4899', bgColor: '#fdf2f8', icon: InstagramIcon },
  TikTok: { color: '#06b6d4', bgColor: '#ecfeff', icon: TikTokIcon },
  LinkedIn: { color: '#2563eb', bgColor: '#eff6ff', icon: LinkedInIcon },
  'Twitter/X': { color: '#0284c7', bgColor: '#f0f9ff', icon: TwitterIcon },
  Twitter: { color: '#0284c7', bgColor: '#f0f9ff', icon: TwitterIcon },
};

export default function PlatformReachBreakdown({ reachBreakdown, selectedPlatform, onSelectPlatform }) {
  if (!reachBreakdown) return null;

  const { combined_total_reach, combined_total_views, platform_breakdown } = reachBreakdown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Individual Platform Reach vs Combined Reach
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Click any platform to filter growth & content performance
          </p>
        </div>
        <div style={{
          backgroundColor: '#3b82f615',
          border: '1px solid #3b82f630',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Globe size={16} />
          <span>Combined Reach: {formatNumber(combined_total_reach)}</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* All Platforms Combined Card */}
        <div
          onClick={() => onSelectPlatform && onSelectPlatform('All')}
          style={{
            background: selectedPlatform === 'All' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#ffffff',
            color: selectedPlatform === 'All' ? '#ffffff' : '#0f172a',
            border: selectedPlatform === 'All' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>Combined All Reach</span>
            <Globe size={20} color={selectedPlatform === 'All' ? '#60a5fa' : '#3b82f6'} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>
            {formatNumber(combined_total_reach)}
          </div>
          <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>
            100% total audience reach
          </div>
        </div>

        {/* Individual Platform Reach Cards */}
        {platform_breakdown && platform_breakdown.map((item) => {
          const cfg = platformConfig[item.platform] || { color: '#6366f1', bgColor: '#e0e7ff', icon: Globe };
          const IconComp = cfg.icon;
          const isSelected = selectedPlatform === item.platform;

          return (
            <div
              key={item.platform}
              onClick={() => onSelectPlatform && onSelectPlatform(item.platform)}
              style={{
                backgroundColor: isSelected ? cfg.bgColor : '#ffffff',
                border: isSelected ? `2px solid ${cfg.color}` : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{item.platform}</span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: cfg.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={18} color={cfg.color} />
                </div>
              </div>

              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {formatNumber(item.reach)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: cfg.color,
                  backgroundColor: `${cfg.color}15`,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {item.percentage_share}% of total
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Eye size={12} /> {formatNumber(item.views)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
