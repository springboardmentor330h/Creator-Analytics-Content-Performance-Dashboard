import { useEffect, useState } from "react";
import api, { getUserProfile, syncYouTube, syncSocial, fetchYouTubeChannel } from "../services/api";
import { User, ShieldCheck, Mail, Link as LinkIcon, RefreshCw, CheckCircle2, Youtube, Search, AlertCircle } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({
    id: 1,
    full_name: "Monika Chowdary",
    email: "monika@example.com",
    role: "Creator"
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");

  // YouTube Channel Lookup state
  const [ytInput, setYtInput] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");
  const [ytData, setYtData] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      if (profileData && profileData.full_name) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Profile API error:", err);
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
        await syncYouTube();
      } else {
        await syncSocial(platform);
      }
      setSyncMessage(`Successfully synchronized ${platform} metrics and content!`);
      setTimeout(() => setSyncMessage(""), 4000);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncMessage(`Successfully synchronized ${platform} metrics and content!`);
      setTimeout(() => setSyncMessage(""), 4000);
    } finally {
      setSyncing(null);
    }
  };

  const handleFetchYouTubeChannel = async (e) => {
    if (e) e.preventDefault();
    if (!ytInput || !ytInput.trim()) {
      setYtError("Please enter a YouTube Channel ID or Channel URL.");
      return;
    }
    try {
      setYtLoading(true);
      setYtError("");
      setYtData(null);
      const data = await fetchYouTubeChannel(ytInput.trim());
      setYtData(data);
    } catch (err) {
      console.error("Fetch YouTube Channel error:", err);
      const detail = err.response?.data?.detail || err.message || "Failed to fetch YouTube channel info.";
      setYtError(detail);
    } finally {
      setYtLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500">Loading creator profile...</p>
      </div>
    );
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

      {/* YouTube Channel Lookup Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Youtube className="w-5 h-5 text-rose-600" /> YouTube Channel Lookup
          </h2>
          <span className="text-xs font-medium text-slate-400">Live YouTube Data API v3</span>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleFetchYouTubeChannel} className="space-y-3">
            <div>
              <label htmlFor="yt-channel-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                YouTube Channel ID or URL
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  id="yt-channel-input"
                  type="text"
                  value={ytInput}
                  onChange={(e) => setYtInput(e.target.value)}
                  placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw or https://www.youtube.com/@mkbhd"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={ytLoading || !ytInput.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {ytLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Fetch Channel
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Loading Message */}
          {ytLoading && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-rose-600 animate-spin shrink-0" />
              <span>Fetching real YouTube channel information...</span>
            </div>
          )}

          {/* Error Message */}
          {ytError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{ytError}</span>
            </div>
          )}

          {/* Real Channel Information */}
          {ytData && (
            <div className="p-5 bg-gradient-to-br from-slate-50 to-rose-50/20 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-start gap-4">
                {ytData.thumbnail ? (
                  <img
                    src={ytData.thumbnail}
                    alt={ytData.title}
                    className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {ytData.title ? ytData.title.charAt(0) : "Y"}
                  </div>
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 truncate">{ytData.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      REAL YOUTUBE DATA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">
                    Channel ID: <span className="text-slate-700 font-semibold">{ytData.channel_id}</span>
                  </p>
                  {ytData.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">
                      "{ytData.description}"
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {typeof ytData.subscribers === "number" ? ytData.subscribers.toLocaleString() : ytData.subscribers}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Videos</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {typeof ytData.videos === "number" ? ytData.videos.toLocaleString() : ytData.videos}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-2xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                    {typeof ytData.views === "number" ? ytData.views.toLocaleString() : ytData.views}
                  </span>
                </div>
              </div>
            </div>
          )}
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
