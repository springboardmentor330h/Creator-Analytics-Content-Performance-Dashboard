import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Revenue() {
  const { creatorId } = useCreator();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [trend, setTrend] = useState(null);
  const [sponsorships, setSponsorships] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    platform: "YouTube", source: "ad_revenue", description: "", amount: "",
    currency: "USD", earned_date: new Date().toISOString().slice(0, 10),
  });
  const [sponsorForm, setSponsorForm] = useState({
    brand_name: "", campaign_name: "", contract_value: "",
    start_date: new Date().toISOString().slice(0, 10),
    status: "active", payment_status: "pending",
  });

  const load = async () => {
    setError("");
    try {
      const [listRes, summaryRes, monthlyRes, trendRes, sponsorRes] = await Promise.all([
        api.get(`/revenue/creator/${creatorId}`),
        api.get(`/revenue/creator/${creatorId}/summary`),
        api.get(`/revenue/creator/${creatorId}/monthly`),
        api.get(`/revenue/creator/${creatorId}/trend`),
        api.get(`/sponsorships/creator/${creatorId}`),
      ]);
      setRecords(listRes.data);
      setSummary(summaryRes.data);
      setMonthly(monthlyRes.data);
      setTrend(trendRes.data);
      setSponsorships(sponsorRes.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view this creator's revenue. Check the Creator ID matches your account.");
      } else if (err.response?.status === 401) {
        setError("Session expired or not logged in. Please log in again.");
      } else {
        setError("Could not load revenue data");
      }
    }
  };

  useEffect(() => { load(); }, [creatorId]);

  const handleRevenueSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/revenue", { ...form, creator_id: creatorId, amount: Number(form.amount) });
      await load();
      setForm({ ...form, description: "", amount: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add revenue record");
    }
  };

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sponsorships", {
        ...sponsorForm,
        creator_id: creatorId,
        contract_value: Number(sponsorForm.contract_value),
      });
      await load();
      setSponsorForm({ ...sponsorForm, brand_name: "", campaign_name: "", contract_value: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add sponsorship");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Revenue Analytics</h1>
          {error && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          {summary && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total Earnings" value={`$${summary.total_earnings.toLocaleString()}`} />
              <Stat label="Records" value={summary.record_count} />
              <Stat label="Trend" value={trend?.trend || "—"} />
              <Stat label="Sponsorships" value={sponsorships.length} />
            </div>
          )}

          {/* Revenue form */}
          <form onSubmit={handleRevenueSubmit} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-3 lg:grid-cols-6">
            <input name="platform" placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="rounded border px-2 py-1 text-sm" />
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded border px-2 py-1 text-sm">
              <option value="sponsorship">Sponsorship</option>
              <option value="ad_revenue">Ad Revenue</option>
              <option value="affiliate">Affiliate</option>
              <option value="brand_collab">Brand Collab</option>
              <option value="subscription">Subscription</option>
            </select>
            <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded border px-2 py-1 text-sm" required />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded border px-2 py-1 text-sm" />
            <input type="date" value={form.earned_date} onChange={(e) => setForm({ ...form, earned_date: e.target.value })} className="rounded border px-2 py-1 text-sm" />
            <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-sm text-white">Add Revenue</button>
          </form>

          {/* Sponsorship form */}
          <form onSubmit={handleSponsorSubmit} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-3 lg:grid-cols-6">
            <input placeholder="Brand Name" value={sponsorForm.brand_name} onChange={(e) => setSponsorForm({ ...sponsorForm, brand_name: e.target.value })} className="rounded border px-2 py-1 text-sm" required minLength={2} />
            <input placeholder="Campaign Name" value={sponsorForm.campaign_name} onChange={(e) => setSponsorForm({ ...sponsorForm, campaign_name: e.target.value })} className="rounded border px-2 py-1 text-sm" required minLength={2} />
            <input type="number" placeholder="Contract Value" value={sponsorForm.contract_value} onChange={(e) => setSponsorForm({ ...sponsorForm, contract_value: e.target.value })} className="rounded border px-2 py-1 text-sm" required />
            <input type="date" value={sponsorForm.start_date} onChange={(e) => setSponsorForm({ ...sponsorForm, start_date: e.target.value })} className="rounded border px-2 py-1 text-sm" />
            <select value={sponsorForm.payment_status} onChange={(e) => setSponsorForm({ ...sponsorForm, payment_status: e.target.value })} className="rounded border px-2 py-1 text-sm">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <button type="submit" className="rounded bg-emerald-600 px-3 py-1 text-sm text-white">Add Sponsorship</button>
          </form>

          {summary && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="mb-2 font-medium">By Source</p>
                {Object.entries(summary.by_source).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b py-1 text-sm">
                    <span className="capitalize">{k.replace("_", " ")}</span><span>${v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white p-4 shadow">
                <p className="mb-2 font-medium">By Platform</p>
                {Object.entries(summary.by_platform).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b py-1 text-sm">
                    <span>{k}</span><span>${v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthly.length > 0 && (
            <div className="mb-6 rounded-xl bg-white p-4 shadow">
              <p className="mb-2 font-medium">Monthly Revenue</p>
              {monthly.map((m) => (
                <div key={m.month} className="flex justify-between border-b py-1 text-sm">
                  <span>{m.month}</span><span>${m.total_revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6 rounded-xl bg-white p-4 shadow">
            <p className="mb-2 font-medium">Sponsorships</p>
            {sponsorships.map((s) => (
              <div key={s.id} className="flex flex-wrap justify-between gap-2 border-b py-1 text-sm">
                <span>{s.brand_name} — {s.campaign_name}</span>
                <span>${s.contract_value.toLocaleString()} · {s.status} · {s.payment_status}</span>
              </div>
            ))}
            {sponsorships.length === 0 && <p className="text-sm text-gray-500">No sponsorships yet.</p>}
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <p className="mb-2 font-medium">Recent Revenue Records</p>
            {records.map((r) => (
              <div key={r.id} className="flex flex-wrap justify-between border-b py-1 text-sm gap-2">
                <span>{r.source} · {r.platform}</span>
                <span>${r.amount} — {r.earned_date}</span>
              </div>
            ))}
            {records.length === 0 && <p className="text-sm text-gray-500">No revenue records yet.</p>}
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow sm:p-4">
      <p className="text-xs text-gray-500 sm:text-sm">{label}</p>
      <p className="text-lg font-bold capitalize sm:text-2xl">{value}</p>
    </div>
  );
}