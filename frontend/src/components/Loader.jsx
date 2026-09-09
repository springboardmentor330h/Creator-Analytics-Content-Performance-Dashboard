import React from 'react';

/**
 * Small/Medium/Large Spinning Indicator Icon
 * Ideal for buttons, header icons, table cells, or inline loaders
 */
export function Spinner({ size = 'sm', color = '#6366f1', className = '' }) {
  const sizePx = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 36,
    xl: 48
  }[size] || 18;

  const borderWidth = sizePx <= 18 ? 2 : 3;

  return (
    <div
      className={`loader-spinner ${className}`}
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        border: `${borderWidth}px solid ${color}22`,
        borderTop: `${borderWidth}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        display: 'inline-block',
        flexShrink: 0
      }}
    />
  );
}

/**
 * Animated Shimmer Skeleton Text Line
 */
export function SkeletonText({ lines = 1, width = '100%', height = '16px', className = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            width: i === lines - 1 && lines > 1 ? '70%' : width,
            height,
            borderRadius: '6px'
          }}
        />
      ))}
    </div>
  );
}

/**
 * Animated Shimmer Skeleton KPI / Metric Card Loader
 */
export function SkeletonCard({ height = '140px', className = '' }) {
  return (
    <div className={`section-card skeleton-shimmer-card ${className}`} style={{ minHeight: height, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
      </div>
      <div className="skeleton-shimmer" style={{ width: '65%', height: '32px', borderRadius: '6px', margin: '16px 0 8px 0' }} />
      <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
    </div>
  );
}

/**
 * Animated Shimmer Skeleton Table Loader
 */
export function SkeletonTable({ rows = 5, cols = 5, className = '' }) {
  return (
    <div className={`table-container ${className}`} style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="skeleton-shimmer" style={{ flex: 1, height: '18px', borderRadius: '4px' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="skeleton-shimmer" style={{ flex: 1, height: '24px', borderRadius: '4px', opacity: 0.85 - (r * 0.1) }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated Skeleton Chart Loader
 */
export function SkeletonChart({ height = 280, className = '' }) {
  return (
    <div className={`section-card ${className}`} style={{ height: `${height}px`, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="skeleton-shimmer" style={{ width: '35%', height: '20px', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '12px' }}>
        {[40, 65, 30, 85, 50, 90, 75, 60, 95, 45, 80, 70].map((h, i) => (
          <div key={i} className="skeleton-shimmer" style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Full Page / Main Dashboard Screen Loader
 */
export function PageLoader({ message = 'Loading Realtime CreatorIQ Workspace...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        width: '100%',
        gap: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.15)',
            borderTop: '3px solid #6366f1',
            borderRight: '3px solid #8b5cf6',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <div
          className="brand-icon pulse-glow"
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            fontSize: '14px',
            fontWeight: 800,
            margin: 0
          }}
        >
          IQ
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
          {message}
        </h4>
        <p style={{ fontSize: '12px', color: '#64748b' }}>
          Fetching realtime metrics & social media channels
        </p>
      </div>
    </div>
  );
}

/**
 * Section Content Loader (for individual views)
 */
export function SectionLoader({ message = 'Updating view...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', width: '100%' }}>
      <Spinner size="md" color="#6366f1" />
      <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>{message}</span>
    </div>
  );
}

/**
 * Floating Real-Time Data Sync Banner Notification
 */
export function SyncingBanner({ message = 'Syncing real-time social metrics from X, YouTube, & Instagram...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        border: '1px solid #334155',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <Spinner size="sm" color="#38bdf8" />
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
          {message}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Fetching latest posts, tweets & follower stats...
        </div>
      </div>
    </div>
  );
}

