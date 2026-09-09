import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, rawNumber } from '../utils/format';

export default function StatCard({ label, value, trend, isUp = true }) {
  const isNumeric = typeof value === 'number' || (!isNaN(value) && value !== null && value !== '');
  const displayVal = isNumeric ? formatNumber(value) : value;
  const fullVal = isNumeric ? rawNumber(value) : value;

  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        onClick={() => alert(`Exact Figure for ${label}: ${fullVal}`)}
        title={`Hover/Click for exact figure: ${fullVal}`}
      >
        {displayVal}
        <span className="number-tooltip">Exact Value: {fullVal}</span>
      </div>
      {trend && (
        <div>
          <span className={`stat-trend ${isUp ? 'up' : 'down'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{trend}</span>
          </span>
        </div>
      )}
    </div>
  );
}
