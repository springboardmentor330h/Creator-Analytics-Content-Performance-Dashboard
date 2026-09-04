import { useEffect, useState } from "react";
import api from "../services/api";
import { Handshake, Calendar, DollarSign, CheckCircle2, Clock, RefreshCw, Award, ArrowUpRight, Sparkles } from "lucide-react";

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

  const sponsorshipList = Array.isArray(data) ? data : data?.data || [];
  const totalValue = sponsorshipList.reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);
  const paidValue = sponsorshipList
    .filter((s) => s.payment_status === "Paid")
    .reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Sponsorships & Partnerships</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Multi-platform brand campaigns, contracted deliverables, and milestone payouts across YouTube, Instagram, TikTok, and LinkedIn.
          </p>
        </div>

        <button
          onClick={loadSponsorships}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Deals</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {sponsorshipList.filter((s) => s.status === "Active").length} Campaigns
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">Across 4 Social Channels</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Handshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Contract Pipeline</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              ₹{totalValue.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">
              ₹{paidValue.toLocaleString()} Cleared ({Math.round((paidValue / (totalValue || 1)) * 100)}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs card-hover flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sponsor Retention</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1 tracking-tight">
              88.5%
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">High Sponsor Satisfaction</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">{error}</div>}

      {/* Sponsorships Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-indigo-600" /> Active Partnerships & Deliverable Tracking
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {sponsorshipList.length} Active Deals
          </span>
        </div>

        {sponsorshipList.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {loading ? "Loading sponsorships..." : "No sponsorship records available."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5">Platform</th>
                  <th className="px-6 py-3.5">Brand & Campaign</th>
                  <th className="px-6 py-3.5">Contract Value</th>
                  <th className="px-6 py-3.5">Campaign Window</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sponsorshipList.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.platform || "YouTube"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{item.brand_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.campaign}</div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">
                      ₹{Number(item.contract_value).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.start_date} → {item.end_date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          item.payment_status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.payment_status === "Paid" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
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
