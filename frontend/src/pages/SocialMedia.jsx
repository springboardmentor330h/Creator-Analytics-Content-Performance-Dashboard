import { useEffect, useState } from "react";
import {
  RefreshCw,
  Video,
  Eye,
  Heart,
  MessageCircle,
  Radio,
  TrendingUp,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LoadingState, ErrorState } from "../components/StatusMessage";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);

const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;

export default function SocialMedia() {
  const { user } = useAuth();

  const [platforms, setPlatforms] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(true);
  const [error, setError] = useState("");
  const [comparisonError, setComparisonError] = useState("");

  const [syncing, setSyncing] = useState(null);
  const [result, setResult] = useState(null);
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [platformRes, performanceRes] = await Promise.all([
          api.get("/social/platforms"),
          api.get("/analytics/platform-performance", {
            params: { creator_id: user.id },
          }),
        ]);

        setPlatforms(platformRes.data.data ?? []);
        setPerformance(performanceRes.data ?? []);
      } catch (err) {
        setError("Couldn't load platform data.");
        setComparisonError(
          err.response?.data?.detail ||
            "Couldn't load platform comparison data."
        );
      } finally {
        setLoading(false);
        setComparisonLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const refreshComparison = async () => {
    setComparisonLoading(true);
    setComparisonError("");

    try {
      const res = await api.get("/analytics/platform-performance", {
        params: { creator_id: user.id },
      });

      setPerformance(res.data ?? []);
    } catch (err) {
      setComparisonError(
        err.response?.data?.detail ||
          "Couldn't refresh platform comparison."
      );
    } finally {
      setComparisonLoading(false);
    }
  };

  const syncMock = async (platform) => {
    setSyncing(platform);
    setResult(null);

    try {
      const res = await api.post(`/social/${platform}/sync`, null, {
        params: { creator_id: user.id },
      });

      setResult({
        platform,
        ...res.data.data,
        message: res.data.message,
      });

      await refreshComparison();
    } catch {
      setResult({
        platform,
        message: "Sync failed.",
      });
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
        params: {
          creator_id: user.id,
          channel_id: channelId,
        },
      });

      setResult({
        platform: "YouTube",
        ...res.data.data,
        message: res.data.message,
      });

      await refreshComparison();
    } catch (err) {
      setResult({
        platform: "YouTube",
        message:
          err.response?.data?.detail ||
          "Sync failed.",
      });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading platforms..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Social Media
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Compare creator performance across connected platforms and
          synchronize new content data.
        </p>
      </div>

      {/* Platform comparison */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Platform Comparison
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Compare views, likes, comments, reach and engagement
              across platforms.
            </p>
          </div>

          <button
            onClick={refreshComparison}
            disabled={comparisonLoading}
            className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 text-sm px-3 py-2 rounded-lg"
          >
            <RefreshCw
              size={14}
              className={
                comparisonLoading ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {comparisonError ? (
          <div className="p-5">
            <ErrorState message={comparisonError} />
          </div>
        ) : comparisonLoading ? (
          <div className="p-5">
            <LoadingState label="Loading comparison..." />
          </div>
        ) : performance.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No platform performance data is available yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left font-medium text-slate-500 px-5 py-3">
                      Platform
                    </th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">
                      Views
                    </th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">
                      Likes
                    </th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">
                      Comments
                    </th>
                    <th className="text-right font-medium text-slate-500 px-4 py-3">
                      Reach
                    </th>
                    <th className="text-right font-medium text-slate-500 px-5 py-3">
                      Engagement
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {performance.map((row) => (
                    <tr
                      key={row.platform}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">
                          {row.platform}
                        </span>
                      </td>

                      <td className="text-right px-4 py-4 text-slate-600">
                        {formatNumber(row.views)}
                      </td>

                      <td className="text-right px-4 py-4 text-slate-600">
                        {formatNumber(row.likes)}
                      </td>

                      <td className="text-right px-4 py-4 text-slate-600">
                        {formatNumber(row.comments)}
                      </td>

                      <td className="text-right px-4 py-4 text-slate-600">
                        {formatNumber(row.reach)}
                      </td>

                      <td className="text-right px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
                          <TrendingUp size={14} />
                          {formatPercent(row.average_engagement_rate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden grid gap-3 p-4">
              {performance.map((row) => (
                <div
                  key={row.platform}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-slate-800">
                      {row.platform}
                    </span>

                    <span className="text-sm font-semibold text-brand-600">
                      {formatPercent(row.average_engagement_rate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      icon={<Eye size={14} />}
                      label="Views"
                      value={formatNumber(row.views)}
                    />

                    <Metric
                      icon={<Heart size={14} />}
                      label="Likes"
                      value={formatNumber(row.likes)}
                    />

                    <Metric
                      icon={<MessageCircle size={14} />}
                      label="Comments"
                      value={formatNumber(row.comments)}
                    />

                    <Metric
                      icon={<Radio size={14} />}
                      label="Reach"
                      value={formatNumber(row.reach)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* YouTube sync */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Video size={18} className="text-red-600" />
          YouTube — Real Sync
        </h2>

        <form
          onSubmit={syncYouTube}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            required
            placeholder="YouTube Channel ID (e.g. UCxxxxxxxx)"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />

          <button
            type="submit"
            disabled={syncing === "YouTube"}
            className="flex items-center gap-1 justify-center bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
          >
            <RefreshCw
              size={14}
              className={
                syncing === "YouTube"
                  ? "animate-spin"
                  : ""
              }
            />
            Sync
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-2">
          Requires YOUTUBE_API_KEY set in the backend .env.
        </p>
      </div>

      {/* Other platforms */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Other Platforms
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {platforms
            .filter((p) => p.platform !== "YouTube")
            .map((p) => (
              <div
                key={p.platform}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between"
              >
                <span className="font-medium text-slate-800">
                  {p.platform}
                </span>

                <button
                  onClick={() => syncMock(p.platform)}
                  disabled={syncing === p.platform}
                  className="text-xs flex items-center gap-1 text-brand-600 hover:text-brand-700 disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={
                      syncing === p.platform
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {syncing === p.platform
                    ? "Syncing..."
                    : "Sync (mock)"}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Sync result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          <strong>{result.platform}:</strong>{" "}
          {result.message}

          {result.inserted !== undefined && (
            <span>
              {" "}
              — {result.inserted} inserted,{" "}
              {result.skipped_duplicates} duplicates skipped.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        {icon}
        {label}
      </div>

      <div className="font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}