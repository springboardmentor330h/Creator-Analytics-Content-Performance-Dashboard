import { useEffect, useState } from "react";
import { RefreshCw, Video } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LoadingState, ErrorState } from "../components/StatusMessage";

export default function SocialMedia() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(null);
  const [result, setResult] = useState(null);
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    api.get("/social/platforms")
      .then((res) => setPlatforms(res.data.data ?? []))
      .catch(() => setError("Couldn't load platforms."))
      .finally(() => setLoading(false));
  }, []);

  const syncMock = async (platform) => {
    setSyncing(platform);
    setResult(null);
    try {
      const res = await api.post(`/social/${platform}/sync`, null, { params: { creator_id: user.id } });
      setResult({ platform, ...res.data.data, message: res.data.message });
    } catch {
      setResult({ platform, message: "Sync failed." });
    } finally {
      setSyncing(null);
    }
  };

  const syncYouTube = async (e) => {
    e.preventDefault();
    setSyncing("YouTube");
    setResult(null);
    try {
      const res = await api.post("/social/youtube/sync", null, {
        params: { creator_id: user.id, channel_id: channelId },
      });
      setResult({ platform: "YouTube", ...res.data.data, message: res.data.message });
    } catch (err) {
      setResult({ platform: "YouTube", message: err.response?.data?.detail || "Sync failed." });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) return <LoadingState label="Loading platforms..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Social Media</h1>
        <p className="text-sm text-slate-400">
          YouTube pulls real data via the YouTube Data API. Other platforms use realistic mock data
          until live API credentials are approved (unavailable metrics are never invented).
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Video size={18} className="text-red-600" /> YouTube — Real Sync
        </h2>
        <form onSubmit={syncYouTube} className="flex flex-col sm:flex-row gap-2">
          <input
            required
            placeholder="YouTube Channel ID (e.g. UCxxxxxxxx)"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={syncing === "YouTube"}
            className="flex items-center gap-1 justify-center bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} className={syncing === "YouTube" ? "animate-spin" : ""} /> Sync
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2">Requires YOUTUBE_API_KEY set in the backend .env.</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {platforms.filter((p) => p.platform !== "YouTube").map((p) => (
          <div key={p.platform} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <span className="font-medium text-slate-800">{p.platform}</span>
            <button
              onClick={() => syncMock(p.platform)}
              disabled={syncing === p.platform}
              className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncing === p.platform ? "animate-spin" : ""} />
              {syncing === p.platform ? "Syncing..." : "Sync (mock)"}
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          <strong>{result.platform}:</strong> {result.message}
          {result.inserted !== undefined && (
            <span> — {result.inserted} inserted, {result.skipped_duplicates} duplicates skipped.</span>
          )}
        </div>
      )}
    </div>
  );
}
