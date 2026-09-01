import { useEffect, useState } from "react";
import api from "../services/api";
import { Handshake, Calendar, DollarSign, CheckCircle2, Clock } from "lucide-react";

function Sponsorships() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSponsorships = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/sponsorships");
      setData(response.data);
    } catch (err) {
      console.error("Sponsorship API error:", err);
      setError("Unable to load sponsorship data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorships();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading sponsorships...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const sponsorshipList = Array.isArray(data) ? data : data?.data || [];
  const totalValue = sponsorshipList.reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Sponsorships & Deals</h1>
        <p className="text-sm text-slate-500 mt-1">Manage brand partnerships, contract commitments, and payout statuses</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active Deals</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {sponsorshipList.filter((s) => s.status === "Active").length}
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Contract Pipeline</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{totalValue.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Completed Campaigns</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {sponsorshipList.filter((s) => s.status === "Completed").length}
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sponsorships Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-indigo-600" /> Active Partnerships & Contracts
          </h2>
          <span className="text-xs font-medium text-slate-400">{sponsorshipList.length} Campaigns</span>
        </div>

        {sponsorshipList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No sponsorship data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Brand & Campaign</th>
                  <th className="px-6 py-3.5">Contract Value</th>
                  <th className="px-6 py-3.5">Campaign Timeline</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sponsorshipList.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.brand_name}</div>
                      <div className="text-xs text-slate-500">{item.campaign}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{Number(item.contract_value).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.start_date} → {item.end_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.payment_status === "Paid"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.payment_status === "Paid" ? (
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        {item.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sponsorships;
