import React, { useEffect, useState } from 'react';
import { getReportSummary } from '../services/api';

export default function GrowthPage() {
  const [growth, setGrowth] = useState([]);

  useEffect(() => {
    getReportSummary(8).then(res => {
      setGrowth(res.data.growth_trends || []);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Growth & Trends</h2>
        <p className="text-gray-500 text-sm">Historical snapshots of follower acquisition and engagement rates.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Recorded Date</th>
              <th className="px-6 py-4">Follower Count</th>
              <th className="px-6 py-4">Engagement Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {growth.length > 0 ? (
              growth.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.recorded_date}</td>
                  <td className="px-6 py-4">{row.follower_count?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{row.engagement_rate}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                  No historical growth trends logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}