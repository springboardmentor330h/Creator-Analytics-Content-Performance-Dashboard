import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusMessage";

const STATUS_COLORS = {
  Pending: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Completed: "bg-slate-100 text-slate-600",
  Cancelled: "bg-red-100 text-red-700",
};

const EMPTY_FORM = { brand_name: "", platform: "YouTube", deal_amount: "", status: "Pending" };

export default function Sponsorships() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    if (!user) return;
    Promise.all([
      api.get("/sponsorships/", { params: { creator_id: user.id } }),
      api.get(`/sponsorships/creator/${user.id}/summary`),
    ])
      .then(([dealsRes, summaryRes]) => {
        setDeals(dealsRes.data.data ?? []);
        setSummary(summaryRes.data);
      })
      .catch(() => setError("Couldn't load sponsorships."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/sponsorships/", {
      creator_id: user.id,
      brand_name: form.brand_name,
      platform: form.platform,
      deal_amount: parseFloat(form.deal_amount || 0),
      status: form.status,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    load();
  };

  if (loading) return <LoadingState label="Loading sponsorships..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sponsorships</h1>
          <p className="text-sm text-slate-400">Track every brand deal, from pitch to payout.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2 rounded-lg"
        >
          <Plus size={16} /> New Deal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Total Deals" value={summary?.total_deals ?? 0} />
        <Card title="Total Deal Value" value={`$${(summary?.total_deal_value ?? 0).toLocaleString()}`} />
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid sm:grid-cols-4 gap-3">
          <input required placeholder="Brand name" value={form.brand_name}
            onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            {["YouTube", "Instagram", "TikTok", "Facebook", "LinkedIn", "X"].map((p) => <option key={p}>{p}</option>)}
          </select>
          <input required type="number" step="0.01" placeholder="Deal amount" value={form.deal_amount}
            onChange={(e) => setForm({ ...form, deal_amount: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="sm:col-span-4 bg-brand-600 hover:bg-brand-700 text-white text-sm py-2 rounded-lg">
            Save
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No sponsorships yet.</td></tr>
            ) : deals.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{d.brand_name}</td>
                <td className="px-4 py-3 text-slate-500">{d.platform}</td>
                <td className="px-4 py-3">${d.deal_amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] || "bg-slate-100 text-slate-600"}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
