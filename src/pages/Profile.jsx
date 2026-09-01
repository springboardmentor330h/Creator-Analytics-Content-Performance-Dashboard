import { useEffect, useState } from "react";
import api from "../services/api";
import { User, ShieldCheck, Mail, Link as LinkIcon, RefreshCw, CheckCircle2 } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users/me");
      setProfile(response.data);
    } catch (err) {
      console.error("Profile API error:", err);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSync = async (platform) => {
    try {
      setSyncing(platform);
      setSyncMessage("");
      if (platform === "YouTube") {
        await api.post("/social/youtube/sync", { channel_id: "UC123456" });
      } else {
        await api.post("/social/sync", { platform });
      }
      setSyncMessage(`Successfully synchronized ${platform} metrics and content!`);
      setTimeout(() => setSyncMessage(""), 4000);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading creator profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{error}</div>;
  }

  const platforms = [
    { name: "YouTube", handle: "@monikacreator", status: "Connected", subscribers: "89.9K" },
    { name: "Instagram", handle: "@monika_dev", status: "Connected", subscribers: "80.3K" },
    { name: "TikTok", handle: "@monikacodes", status: "Connected", subscribers: "55.0K" },
    { name: "LinkedIn", handle: "Monika Chowdary", status: "Connected", subscribers: "18.2K" },
    { name: "X", handle: "@monika_tweets", status: "Connected", subscribers: "14.5K" },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Creator Profile & Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Manage account credentials, linked social channels, and sync webhooks</p>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/20">
            MC
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{profile?.full_name || "Monika Chowdary"}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{profile?.email || "monika@example.com"}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {profile?.role || "Creator"}
              </span>
              <span className="text-xs text-slate-400">Account ID: #{profile?.id || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Channels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-indigo-600" /> Linked Social Platforms
          </h2>
          <span className="text-xs font-medium text-slate-400">Live API Webhooks</span>
        </div>

        <div className="divide-y divide-slate-100">
          {platforms.map((p) => (
            <div key={p.name} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {p.name}
                </div>
                <div className="text-xs text-slate-500">{p.handle} • {p.subscribers} audience</div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {p.status}
                </span>
                <button
                  onClick={() => handleSync(p.name)}
                  disabled={syncing === p.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing === p.name ? "animate-spin" : ""}`} />
                  {syncing === p.name ? "Syncing..." : "Sync"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
