import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCreator } from "../context/CreatorContext";

const AVAILABLE_PLATFORMS = ["YouTube", "Instagram", "Facebook", "LinkedIn", "TikTok", "X"];

export default function SocialMedia() {
  const { creatorId } = useCreator();
  const [connected, setConnected] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("YouTube");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const loadConnections = async () => {
    try {
      const res = await api.get("/social/platforms");
      setConnected(res.data.platforms);
    } catch {
      setError("Could not load connected platforms");
    }
  };

  useEffect(() => { loadConnections(); }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const res = await api.post("/social/connect", {
        platform: selectedPlatform,
        account_name: accountName || "DemoCreator",
      });
      setMessage(res.data.message);
      setAccountName("");
      await loadConnections();
    } catch (err) {
      setError(err.response?.data?.detail || "Connection failed");
    }
  };

  const handleSync = async (platform) => {
    setSyncing(true); setError(""); setMessage("");
    try {
      const res = await api.post("/social/sync", { creator_id: creatorId, platform });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <main className="p-4 sm:p-6">
          <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Social Media Integration</h1>
          {message && <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}
          {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <form onSubmit={handleConnect} className="mb-6 flex flex-wrap gap-2 rounded-xl bg-white p-4 shadow">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded border px-3 py-2 text-sm"
            >
              {AVAILABLE_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-sm text-white">
              Connect
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_PLATFORMS.map((platform) => {
              const isConnected = connected.includes(platform);
              return (
                <div key={platform} className="rounded-xl bg-white p-4 shadow">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{platform}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSync(platform)}
                    disabled={!isConnected || syncing}
                    className="w-full rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                  >
                    {syncing ? "Syncing..." : "Sync Data"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}