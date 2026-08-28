import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="stat-card skeleton-card">
      <div className="skeleton-line" style={{ width: '40%', height: '14px', marginBottom: '12px' }} />
      <div className="skeleton-line" style={{ width: '70%', height: '32px', marginBottom: '12px' }} />
      <div className="skeleton-line" style={{ width: '30%', height: '16px', borderRadius: '12px' }} />
    </div>
  );
}

export function ChartSkeleton({ height = '300px' }) {
  return (
    <div className="section-card skeleton-card" style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="skeleton-line" style={{ width: '35%', height: '20px' }} />
      <div className="skeleton-box" style={{ width: '100%', flex: 1, marginTop: '16px', borderRadius: '12px' }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-responsive">
      <table className="simple-table">
        <thead>
          <tr>
            <th><div className="skeleton-line" style={{ width: '40px', height: '14px' }} /></th>
            <th><div className="skeleton-line" style={{ width: '100px', height: '14px' }} /></th>
            <th><div className="skeleton-line" style={{ width: '80px', height: '14px' }} /></th>
            <th><div className="skeleton-line" style={{ width: '60px', height: '14px' }} /></th>
            <th><div className="skeleton-line" style={{ width: '60px', height: '14px' }} /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton-line" style={{ width: '30px', height: '14px' }} /></td>
              <td><div className="skeleton-line" style={{ width: '140px', height: '14px' }} /></td>
              <td><div className="skeleton-line" style={{ width: '90px', height: '14px' }} /></td>
              <td><div className="skeleton-line" style={{ width: '50px', height: '14px' }} /></td>
              <td><div className="skeleton-line" style={{ width: '70px', height: '14px' }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FullPageLoader({ title = "Loading CreatorIQ Analytics..." }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px',
      gap: '16px'
    }}>
      <div className="pulse-spinner" />
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#64748b' }}>Fetching real-time creator metrics & financial streams...</div>
    </div>
  );
}
