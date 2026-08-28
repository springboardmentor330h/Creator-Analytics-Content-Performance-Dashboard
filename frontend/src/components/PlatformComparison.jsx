import React from 'react';
import { Eye, Heart, MessageSquare, Share2, TrendingUp, BarChart2 } from 'lucide-react';
import { formatNumber } from '../utils/format';
import { YoutubeIcon, InstagramIcon, TikTokIcon, LinkedInIcon, TwitterIcon } from './PlatformIcons';

const platformIconMap = {
  YouTube: YoutubeIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  LinkedIn: LinkedInIcon,
  Facebook: Share2,
  X: TwitterIcon,
  Twitter: TwitterIcon,
  'Twitter/X': TwitterIcon,
};

const platformColorMap = {
  YouTube: '#ef4444',
  Instagram: '#ec4899',
  TikTok: '#06b6d4',
  LinkedIn: '#2563eb',
  Facebook: '#3b82f6',
  X: '#0284c7',
  Twitter: '#0284c7',
  'Twitter/X': '#0284c7',
};

export default function PlatformComparison({ platformComparison }) {
  if (!platformComparison) return null;

  let comparisonMap = {};
  if (Array.isArray(platformComparison)) {
    platformComparison.forEach(item => {
      if (item && item.platform) comparisonMap[item.platform] = item;
    });
  } else if (typeof platformComparison === 'object') {
    if (platformComparison.comparison && Array.isArray(platformComparison.comparison)) {
      platformComparison.comparison.forEach(item => {
        if (item && item.platform) comparisonMap[item.platform] = item;
      });
    } else {
      comparisonMap = platformComparison;
    }
  }

  const platforms = Object.keys(comparisonMap);
  if (platforms.length === 0) return null;

  const maxViews = Math.max(...platforms.map(p => comparisonMap[p]?.views || comparisonMap[p]?.total_views || 0), 1);

  return (
    <div className="section-card" style={{ marginTop: '24px' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} color="#2563eb" />
            <span>Platform Comparison Analytics</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            Comparative overview of views, reach, engagement rates, likes, and comments across social platforms
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {platforms.map((p) => {
          const data = comparisonMap[p] || {};
          const IconComp = platformIconMap[p] || Share2;
          const color = platformColorMap[p] || '#6366f1';
          const pViews = data.views ?? data.total_views ?? 0;
          const pLikes = data.likes ?? data.total_likes ?? 0;
          const pComments = data.comments ?? data.total_comments ?? 0;
          const pReach = data.reach ?? data.total_reach ?? 0;
          const pEng = data.engagement_rate ?? data.average_engagement_rate ?? 0;
          const pctWidth = Math.min(100, Math.round((pViews / maxViews) * 100));

          return (
            <div
              key={p}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComp size={20} color={color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>{p}</h4>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Connected Channel</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: color
                }}>
                  {pEng}% Eng. Rate
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  <span>Views Volume</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatNumber(pViews)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pctWidth}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
                </div>
              </div>

              {/* Grid of Key Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Organic Reach</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{formatNumber(pReach)}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Total Likes</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{formatNumber(pLikes)}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Comments</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{formatNumber(pComments)}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Avg Eng Rate</div>
                  <div style={{ fontWeight: 700, color: color, fontSize: '13px' }}>{pEng}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
