import React from 'react';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import { TrendingUp, Award, Calendar } from 'lucide-react';

export default function GrowthView({ growthTrends }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Cards */}
      <div className="metrics-row">
        <StatCard
          label="30-Day Follower Growth"
          value="+12.4%"
          trend="850 new/day"
        />
        <StatCard
          label="Avg Daily Reach"
          value="18,400"
          trend="+4.2% reach"
        />
        <StatCard
          label="Growth Momentum Score"
          value="94 / 100"
          trend="Top 5% Creator"
        />
      </div>

      {/* Main Growth Curve Chart */}
      <LineChart title="30-Day Audience Growth & Reach Trends" />

      {/* Historical Growth Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <h3 className="chart-title">Daily Historical Growth Log</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <Calendar size={16} />
            <span>Last 30 Days</span>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Followers</th>
              <th>Daily Reach</th>
              <th>Daily Growth</th>
              <th>Growth Percentage</th>
            </tr>
          </thead>
          <tbody>
            {growthTrends && growthTrends.length > 0 ? (
              growthTrends.map((g, idx) => (
                <tr key={idx}>
                  <td><strong>{g.date}</strong></td>
                  <td>{g.followers ? g.followers.toLocaleString() : 0}</td>
                  <td>{g.reach ? g.reach.toLocaleString() : 'N/A'}</td>
                  <td>
                    <span style={{ color: g.daily_growth > 0 ? '#059669' : '#64748b', fontWeight: 700 }}>
                      +{g.daily_growth || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`trend-badge ${g.growth_percentage >= 0 ? 'up' : 'down'}`}>
                      {g.growth_percentage || 0}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  No growth historical data logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
