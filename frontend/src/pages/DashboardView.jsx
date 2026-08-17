import React from 'react';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import DeviceChart from '../components/DeviceChart';
import AgeChart from '../components/AgeChart';
import TopCountries from '../components/TopCountries';

export default function DashboardView({ summary, audienceReport, audienceTrends }) {
  const totalFollowers = summary?.total_followers ?? audienceReport?.total_followers ?? 0;
  const totalReach = summary?.total_reach ?? audienceReport?.total_reach ?? 0;
  const totalImpressions = audienceReport?.total_impressions ?? 0;
  const avgEngagementRate = summary?.average_engagement_rate ?? 0;

  return (
    <div className="dashboard-grid">
      {/* Left / Main Column */}
      <div className="grid-column-main">
        {/* Realtime Stat Cards Row */}
        <div className="metrics-row">
          <StatCard
            label="Total Followers"
            value={totalFollowers > 1000 ? `${(totalFollowers / 1000).toFixed(1)}k` : totalFollowers.toLocaleString()}
            trend="Realtime"
            isUp={true}
          />
          <StatCard
            label="Total Organic Reach"
            value={totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach.toLocaleString()}
            trend="Realtime"
            isUp={true}
          />
          <StatCard
            label="Avg Engagement Rate"
            value={`${avgEngagementRate}%`}
            trend="Realtime"
            isUp={avgEngagementRate >= 2.0}
          />
        </div>

        {/* Realtime Growth & Reach Line Chart */}
        <LineChart title="Realtime Audience & Reach Trends" data={audienceTrends} />

        {/* Active Geographic Audience */}
        <TopCountries report={audienceReport} />
      </div>

      {/* Right / Sidebar Column */}
      <div className="grid-column-side">
        {/* Device Breakdown */}
        <DeviceChart title="Device Usage" distribution={audienceReport?.device_distribution} />

        {/* Age Breakdown */}
        <AgeChart title="Age Distribution" distribution={audienceReport?.age_distribution} />
      </div>
    </div>
  );
}
