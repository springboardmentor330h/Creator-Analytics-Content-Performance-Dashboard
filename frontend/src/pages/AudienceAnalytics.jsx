import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function AudienceAnalytics() {
  const [snapshot, setSnapshot] = useState(null);

  const load = async () => {
    const res = await api.get("/audience/latest");
    setSnapshot(res.data);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    await api.post("/audience/refresh");
    load();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Audience Analytics</h1>
            <button onClick={refresh} className="rounded bg-indigo-600 px-4 py-2 text-white">
              Refresh Snapshot
            </button>
          </div>

          {snapshot && (
            <>
              <div className="mb-6 grid grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Followers</p>
                  <p className="text-2xl font-bold">{snapshot.followers.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">New Followers</p>
                  <p className="text-2xl font-bold">+{snapshot.new_followers}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Impressions</p>
                  <p className="text-2xl font-bold">{snapshot.impressions.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500">Reach</p>
                  <p className="text-2xl font-bold">{snapshot.reach.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="mb-2 font-medium">Age Distribution</p>
                  <p className="text-sm">13-17: {snapshot.age_13_17}%</p>
                  <p className="text-sm">18-24: {snapshot.age_18_24}%</p>
                  <p className="text-sm">25-34: {snapshot.age_25_34}%</p>
                  <p className="text-sm">35-44: {snapshot.age_35_44}%</p>
                  <p className="text-sm">45+: {snapshot.age_45_plus}%</p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow">
                  <p className="mb-2 font-medium">Gender & Location</p>
                  <p className="text-sm">Male: {snapshot.male_pct}%</p>
                  <p className="text-sm">Female: {snapshot.female_pct}%</p>
                  <p className="text-sm">Other: {snapshot.other_pct}%</p>
                  <p className="mt-2 text-sm">Top Country: {snapshot.top_country}</p>
                  <p className="text-sm">Top Device: {snapshot.top_device}</p>
                  <p className="text-sm">Peak Active Hour: {snapshot.peak_active_hour}:00</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}