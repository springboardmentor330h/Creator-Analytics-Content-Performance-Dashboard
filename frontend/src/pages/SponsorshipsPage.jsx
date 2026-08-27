import React, { useEffect, useState } from 'react';
import { getSponsorships } from '../services/api';
import { Briefcase } from 'lucide-react';

export default function SponsorshipsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSponsorships(8)
      .then(res => {
        setDeals(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalValue = deals.reduce((sum, d) => sum + (d.contract_value || d.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sponsorship Deals</h2>
        <p className="text-gray-500 text-sm">Brand contracts, campaign values, and payout tracking.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">Total Contract Value</span>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-4 bg-purple-50 text-purple-600 rounded-lg">
          <Briefcase className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4">Campaign</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.length > 0 ? (
              deals.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{row.brand_name}</td>
                  <td className="px-6 py-4">{row.campaign_name}</td>
                  <td className="px-6 py-4 font-semibold text-purple-700">${(row.contract_value || row.amount)?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      row.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.payment_status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  {loading ? 'Loading sponsorships...' : 'No active brand sponsorships recorded.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}