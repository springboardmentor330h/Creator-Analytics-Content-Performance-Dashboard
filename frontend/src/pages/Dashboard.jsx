import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/overview").then((res) => setData(res.data));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h1 className="mb-4 text-2xl font-semibold">Overview</h1>
          {data && (
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(data.kpis).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-white p-4 shadow">
                  <p className="text-sm text-gray-500 capitalize">{key.replace("_", " ")}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}