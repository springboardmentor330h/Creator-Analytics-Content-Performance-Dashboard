import React, { useEffect, useState } from 'react';
import { getReportSummary } from '../services/api';

export default function AudiencePage() {
  const [audience, setAudience] = useState([]);

  useEffect(() => {
    getReportSummary(8).then(res => {
      setAudience(res.data.audience_demographics || []);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audience Demographics</h2>
        <p className="text-gray-500 text-sm">Breakdown of creator audience geography, age, and gender parameters.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Age Group</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {audience.length > 0 ? (
              audience.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.country}</td>
                  <td className="px-6 py-4">{row.age_group}</td>
                  <td className="px-6 py-4 capitalize">{row.gender}</td>
                  <td className="px-6 py-4 font-semibold text-sky-600">{row.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  No audience demographic records logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}