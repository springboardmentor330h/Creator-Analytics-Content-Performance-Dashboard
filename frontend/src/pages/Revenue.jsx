import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

export default function Revenue() {
  const { creatorId } = useCreator();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    platform: "YouTube", source: "ad_revenue", description: "", amount: "",
    currency: "USD", earned_date: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    setError("");
    try {
      const [listRes, summaryRes] = await Promise.all([
        api.get("/revenue"),
        api.get(`/revenue/creator/${creatorId}/summary`),
      ]);
      setRecords(listRes.data.filter((r) => r.creator_id === creatorId));
      setSummary(summaryRes.data);
    } catch {
      setError("Could not load revenue data");
    }
  };

  useEffect(() => { load(); }, [creatorId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/revenue", { ...form, creator_id: creatorId, amount: Number(form.amount) });
      await load();
      setForm({ ...form, description: "", amount: "" });
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || "Failed to add revenue record");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Revenue Analytics</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {summary && (
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Total Earnings" value={`$${summary.total_earnings.toLocaleString()}`} />
              <Stat label="Records" value={summary.record_count} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-3 lg:grid-cols-6">
            <input name="platform" placeholder="Platform" value={form.platform} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <select name="source" value={form.source} onChange={handleChange} className="rounded border px-2 py-1 text-sm">
              <option value="sponsorship">Sponsorship</option>
              <option value="ad_revenue">Ad Revenue</option>
              <option value="affiliate">Affiliate</option>
              <option value="brand_collab">Brand Collab</option>
              <option value="subscription">Subscription</option>
            </select>
            <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} className="rounded border px-2 py-1 text-sm" required />
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="earned_date" type="date" value={form.earned_date} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-sm text-white">Add</button>
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

          <div className="rounded-xl bg-white p-4 shadow">
            <p className="mb-2 font-medium">Recent Records</p>
            {records.map((r) => (
              <div key={r.id} className="flex flex-wrap justify-between border-b py-1 text-sm gap-2">
                <span>{r.source} · {r.platform}</span>
                <span>${r.amount} — {r.earned_date}</span>
              </div>
            ))}
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
      <p className="text-lg font-bold sm:text-2xl">{value}</p>
    </div>
  );
}