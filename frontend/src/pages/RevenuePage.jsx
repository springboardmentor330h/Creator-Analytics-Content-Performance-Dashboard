import React, { useEffect, useState } from 'react';
import { getRevenues } from '../services/api';
import { DollarSign } from 'lucide-react';

export default function RevenuePage() {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenues(8)
      .then(res => {
        setRevenues(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Management</h2>
        <p className="text-gray-500 text-sm">Direct platform payouts, ad revenue, and channel income.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">Total Direct Revenue</span>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 bg-amber-50 text-amber-600 rounded-lg">
          <DollarSign className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {revenues.length > 0 ? (
              revenues.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{row.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 capitalize">{row.source || row.platform}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">${row.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{row.date || row.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  {loading ? 'Loading revenue records...' : 'No revenue records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}