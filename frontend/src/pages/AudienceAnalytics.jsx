import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AudienceAnalytics() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    age_group: "18-24", gender: "male", country: "India", city: "Bangalore",
    device_type: "Mobile", active_hour: 19, followers: 0, impressions: 0, reach: 0,
  });

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/analytics/audience");
      setReport(res.data);
    } catch {
      setError("Could not load audience analytics");
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/audience", {
        ...form,
        creator_id: 1,
        active_hour: Number(form.active_hour), followers: Number(form.followers),
        impressions: Number(form.impressions), reach: Number(form.reach),
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || "Failed to add audience record");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Audience Analytics</h1>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-4 shadow sm:grid-cols-4 lg:grid-cols-9">
            <input name="age_group" placeholder="Age Group" value={form.age_group} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="device_type" placeholder="Device" value={form.device_type} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="active_hour" type="number" min="0" max="23" value={form.active_hour} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="followers" type="number" placeholder="Followers" value={form.followers} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <input name="reach" type="number" placeholder="Reach" value={form.reach} onChange={handleChange} className="rounded border px-2 py-1 text-sm" />
            <button type="submit" className="rounded bg-indigo-600 px-3 py-1 text-sm text-white">Add</button>
          </form>

          {report && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Total Followers" value={report.total_followers?.toLocaleString()} />
                <Stat label="Total Reach" value={report.total_reach?.toLocaleString()} />
                <Stat label="Total Impressions" value={report.total_impressions?.toLocaleString()} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="mb-2 font-medium">Gender Distribution</p>
                  {Object.entries(report.gender_distribution || {}).map(([k, v]) => (
                    <p key={k} className="text-sm">{k}: {v}%</p>
                  ))}
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="mb-2 font-medium">Age Distribution</p>
                  {Object.entries(report.age_distribution || {}).map(([k, v]) => (
                    <p key={k} className="text-sm">{k}: {v}%</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-4 shadow text-sm">
                <p>Top Country: <b>{report.top_country || "—"}</b></p>
                <p>Top City: <b>{report.top_city || "—"}</b></p>
                <p>Top Device: <b>{report.top_device || "—"}</b></p>
              </div>
            </>
          )}
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